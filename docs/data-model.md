# Data model — DynamoDB single-table design

One on-demand table per app, created by `infra/template.yaml`:

| App | Table | S3 prefix |
|---|---|---|
| photography-portfolio | `portfolio-photo` | `photo/` |
| it-portfolio | `portfolio-it` | `it/` |

Every item has `PK`, `SK`, `type`, `createdAt`, `updatedAt` (ISO 8601 UTC). `GSI1PK` / `GSI1SK` are set
only on items that must appear in a sorted public list (a **sparse** index: hidden/deleted items drop out
of the index by removing `GSI1PK`/`GSI1SK`). `GSI1` projects `ALL`. `ttl` (epoch seconds) is enabled on
both tables but unused for now.

Conventions:
- `id` = the original Supabase UUID (kept on migration, so `category_id` relations stay valid); new items get `crypto.randomUUID()`.
- Domain attributes keep their existing snake_case names (`featured_image`, `category_id`, `sort_order`, ...)
  so the Vue pages change as little as possible. The API layer strips `PK/SK/GSI1*/type` and returns
  `createdAt`/`updatedAt` as `created_at`/`updated_at`.
- Null attributes are not stored.
- Image/file fields hold full CloudFront URLs (`NUXT_PUBLIC_MEDIA_BASE_URL` + key).
- Slug uniqueness: a pointer item `SLUG#<slug>` is written in the same `TransactWriteItems` as the post,
  with `attribute_not_exists(PK)`. Changing a slug = delete old pointer + put new pointer + update post, in one transaction.
- Admin-only lists (small) are one `Query` on `PK` and may be sorted in memory. Public lists are one
  `Query` already in display order. No `Scan` anywhere.

---

## photography-portfolio (`portfolio-photo`)

Source: `server/api/*` routes, `components/Admin/*Editor.vue`, `pages/*`. Status values: `published | hidden`
(blog also `deleted`, a soft delete with `deleted_at`).

| Entity | PK | SK | GSI1PK (sparse) | GSI1SK | Attributes |
|---|---|---|---|---|---|
| Category | `CATEGORY` | `CAT#<id>` | — | — | id, name, slug, (+ any other source columns) |
| Portfolio item | `PORTFOLIO` | `ITEM#<id>` | `PORTFOLIO#PUBLISHED` when status=published | `createdAt` | id, title, image, description, status, category_id, category_name, category_slug |
| Blog post | `BLOG` | `POST#<id>` | `BLOG#PUBLISHED` when status=published and no deleted_at | `createdAt` | id, title, slug, content, excerpt, featured_image, status, deleted_at, category_id, category_name, category_slug |
| Blog slug pointer | `BLOG` | `SLUG#<slug>` | — | — | id |
| Testimonial | `TESTIMONIAL` | `T#<id>` | `TESTIMONIAL#PUBLISHED` when status=published | `createdAt` | id, name, role, avatar, rating, quote, status |
| Contact message | `MESSAGE` | `MSG#<id>` | `MESSAGE` | `createdAt` | id, name, email, subject, message (only if the contact form moves to DynamoDB, decided in Phase 3) |

Category name/slug are **denormalized** onto portfolio items and blog posts at write time (categories have no
write route; they change only through the migration). If categories ever get an admin editor, its update route
must rewrite `category_name`/`category_slug` on the referencing items.

| Access pattern | Who | Operation |
|---|---|---|
| Published portfolio, newest first (index page, filtered by category in the browser) | public | `Query GSI1 GSI1PK=PORTFOLIO#PUBLISHED, ScanIndexForward=false` |
| All categories | public | `Query PK=CATEGORY` (sort by name in memory) |
| Published blog list, newest first; related posts on the post page | public | `Query GSI1 GSI1PK=BLOG#PUBLISHED, ScanIndexForward=false` |
| Blog post by slug | public | `GetItem BLOG / SLUG#<slug>` → `GetItem BLOG / POST#<id>` (reject unless published) |
| Published testimonials, newest first | public | `Query GSI1 GSI1PK=TESTIMONIAL#PUBLISHED, ScanIndexForward=false` |
| Admin lists (all statuses) | admin | `Query PK=PORTFOLIO` / `PK=BLOG, begins_with(SK,'POST#')` / `PK=TESTIMONIAL` |
| Get/update/delete by id | admin | `GetItem` / `UpdateItem` / `DeleteItem` on `PK` + `<prefix>#<id>`; status change also sets/removes `GSI1PK`,`GSI1SK` |
| Blog soft delete | admin | `UpdateItem status=deleted, deleted_at=now, REMOVE GSI1PK, GSI1SK` |
| Dashboard counts | admin | `Query ... Select=COUNT` per PK |
| Media library | admin | S3 `ListObjectsV2 Prefix=photo/` (no DynamoDB) |

`analytics_events`: only read as a count on the admin dashboard; nothing in the code writes to it.
Migrate or drop is asked in Phase 5. If kept: `PK=ANALYTICS`, `SK=EVT#<createdAt>#<id>`, admin count only.

---

## it-portfolio (`portfolio-it`)

Source: `supabase/sql_command.sql` (DDL), `types/portfolio.ts`, `composables/useSupabaseData.ts`,
`composables/useAdminCrud.ts`, `pages/admin/*`.

The public home page (`pages/index.vue`) shows profile, social links, fields, education, experience, skills,
certifications and projects. They all live in **one partition `SITE`**, so the whole page is **one `Query PK=SITE`**
(a few dozen small items, far under 1 MB) and is grouped by `type` + sorted by `sort_order` in memory.

| Entity | PK | SK | GSI1PK (sparse) | GSI1SK | Attributes |
|---|---|---|---|---|---|
| Profile (singleton) | `SITE` | `PROFILE` | — | — | full_name, title, bio, avatar_url, resume_url, cv_url, email_1, email_2, phone, location, map_embed |
| Social link | `SITE` | `SOCIAL#<id>` | — | — | id, platform, url, icon_name, sort_order |
| Field of interest | `SITE` | `FIELD#<id>` | — | — | id, title, description, sort_order |
| Education | `SITE` | `EDU#<id>` | — | — | id, degree, school, year, description, sort_order |
| Experience | `SITE` | `EXP#<id>` | — | — | id, title, company, period, description, sort_order |
| Skill | `SITE` | `SKILL#<id>` | — | — | id, name, icon_url, sort_order |
| Certification | `SITE` | `CERT#<id>` | — | — | id, name, issuer, date, link, badge_url, sort_order |
| Project | `SITE` | `PROJECT#<id>` | — | — | id, title, description, image_url, demo_url, github_url, sort_order, **categories: string[]** |
| Blog post | `BLOG` | `POST#<id>` | `BLOG#PUBLISHED` when published=true | `published_at` | id, title, slug, excerpt, content, image_url, category, published, published_at |
| Blog slug pointer | `BLOG` | `SLUG#<slug>` | — | — | id |
| Contact message | `MESSAGE` | `MSG#<id>` | `MESSAGE` | `createdAt` | id, guest_name, guest_email, message, replied |

`project_categories` (join table) is folded into `Project.categories` (list of strings), so the join disappears.

| Access pattern | Who | Operation |
|---|---|---|
| Home page (all sections) | public | `Query PK=SITE` |
| Published blog list, newest first | public | `Query GSI1 GSI1PK=BLOG#PUBLISHED, ScanIndexForward=false` |
| Blog post by slug | public | `GetItem BLOG / SLUG#<slug>` → `GetItem BLOG / POST#<id>` (reject unless published) |
| Submit contact message | public | `PutItem MESSAGE / MSG#<id>` + SES notification |
| Admin list of one section | admin | `Query PK=SITE, begins_with(SK,'SKILL#')` etc. |
| Admin blog list (incl. drafts) | admin | `Query PK=BLOG, begins_with(SK,'POST#')` |
| Admin messages, newest first | admin | `Query GSI1 GSI1PK=MESSAGE, ScanIndexForward=false` |
| Mark message replied | admin | `UpdateItem MESSAGE / MSG#<id> SET replied=true` |
| Profile read/update | admin | `GetItem` / `PutItem SITE / PROFILE` |
| Create/update/delete by id | admin | `PutItem` / `UpdateItem` / `DeleteItem` on `SITE` + `<prefix>#<id>` |
| Dashboard counts | admin | one `Query PK=SITE` grouped by type + `Query ... Select=COUNT` for `BLOG` and `MESSAGE` |

### Files (Supabase Storage → S3 `it/`)

Buckets used by the code, mapped to prefixes: `avatars` → `it/avatars/`, `resumes` → `it/resumes/`,
`cv` → `it/cv/`, `projects` → `it/projects/`, `blog-images` → `it/blog-images/`. The SQL also defines a
`certificates` bucket; the migration exports it if it has objects.

---

## Hard-coded Cloudinary URLs

Besides database rows, photography-portfolio has Cloudinary URLs hard-coded in `pages/index.vue`,
`pages/portfolio/[category].vue`, `components/Home/HeroSlider.vue`, `components/Home/FeaturedWork.vue`,
`components/About/AboutSection.vue` (two Cloudinary clouds). Phase 3 replaces them with
`NUXT_PUBLIC_MEDIA_BASE_URL` paths using `url-map.json` from Phase 5.
