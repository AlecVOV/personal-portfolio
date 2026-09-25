# Le Hoang Triet Thong — Portfolio & CMS

A full-stack personal portfolio website with a built-in admin CMS, powered by **Nuxt 3**, **Supabase**, and **Tailwind CSS**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 3](https://nuxt.com) (Vue 3 + SSR + TypeScript) |
| Styling | [Tailwind CSS](https://tailwindcss.com) — AWS squid-ink dark theme |
| Backend / DB | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage) |
| Email | [Resend](https://resend.com) (contact form replies from CMS) |
| Icons | Custom SVG components (13 icons) |
| Forms | Web3Forms (contact form delivery) |
| Markdown | markdown-it (blog content rendering) |
| Utilities | @vueuse/core (reactive helpers) |

## Features

### Public Site (`/`)
- **About** — profile intro, fields of interest, social links, contact info toggle
- **Resume** — education, experience, skills grid (with CDN icons), certifications (with badge/certificate links)
- **Portfolio** — two-section layout: **Industry Projects** & **Academic Research**, each with independent multi-select category filters
- **Blog** (`/blog`) — published posts grid with slug-based routing (`/blog/[slug]`)
- **Contact** — validated form with Web3Forms delivery + Supabase storage
- **404 Page** (`error.vue`) — custom branded error page

### Admin CMS (`/admin/*`)
| Page | What you can do |
|---|---|
| **Dashboard** | Live count cards for all content types + quick-link grid |
| **Profile** | Edit bio, avatar, resume/CV with **bucket browsing** (upload or pick existing) |
| **Projects** | CRUD with multi-category tagging, industry/research section toggle, thumbnail bucket browsing |
| **Skills** | Reorderable skill list with icon URLs |
| **Education** | Timeline entries |
| **Experience** | Work history entries |
| **Certifications** | Add certifications with optional badge URL + certificate link |
| **Fields of Interest** | About-me field cards |
| **Social Links** | Platform list (LinkedIn, GitHub, Photography, etc.) — icon name maps to custom SVG components |
| **Blog** | Markdown posts with **publish/unpublish toggle**, **inline image insertion** from bucket, cover image browsing, auto-slug |
| **Messages** | View contact form submissions, **reply via Resend email** with sender/CC management, mark as replied |
| **Login** | Supabase Auth (email/password), admin-only middleware |

### Key Capabilities
- **Bucket Browsing** — all file inputs (avatar, resume, CV, project thumbnails, blog images) support **upload new** or **pick existing** from Supabase Storage
- **Multi-Select Portfolio Filtering** — toggle multiple category chips per section (OR logic)
- **Industry/Research Project Split** — single radio toggle in admin; front-end shows separate stacked sections
- **Blog Publish/Unpublish** — save as draft, publish when ready, unpublish to hide
- **Contact Message Storage** — all form submissions saved to Supabase `contact_messages` table
- **Reply from CMS** — send email replies via Resend API; tracks replied/pending status
- **ConfirmDialog** — custom dark-modal confirmation on all admin delete actions (replaces browser `confirm()`)
- **Admin Auth** — middleware protects all `/admin/*` routes; RLS policies enforce row-level security (public read, admin write)

## Storage Buckets

| Bucket | Purpose | Access |
|---|---|---|
| `avatars` | Profile avatar | Public read |
| `resumes` | Resume PDF | Public read |
| `cv` | CV PDF | Public read |
| `projects` | Project thumbnails | Public read |
| `certificates` | Cert badge images | Public read |
| `blog-images` | Blog covers + inline images | Public read |

## Database Tables

| Table | Purpose |
|---|---|
| `profile` | Singleton — site owner info |
| `social_links` | Social media platform links |
| `fields` | Fields of interest cards |
| `education` | Education timeline |
| `experience` | Work experience timeline |
| `skills` | Technical skills + icon URLs |
| `certifications` | Certifications + badge links |
| `projects` | Portfolio projects |
| `project_categories` | M2M project ↔ category tags |
| `blog_posts` | Blog posts (markdown, publish flag) |
| `contact_messages` | Guest form submissions (replied flag) |

All tables have RLS enabled: public read-only, `is_admin()` function grants full access to 4 admin accounts.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (email replies from CMS)
RESEND_API_KEY=re_xxxxxxxx

# Web3Forms (contact form)
NUXT_WEB3FORMS_ACCESS_KEY_1=your-key
NUXT_WEB3FORMS_ACCESS_KEY_2=your-fallback-key
NUXT_CONTACT_EMAIL_1=your-email@example.com
NUXT_CONTACT_EMAIL_2=your-fallback@example.com

# Site metadata
NUXT_PUBLIC_SITE_URL=https://your-domain.com
NUXT_SITE_NAME="Your Name Portfolio"
NUXT_SITE_DESCRIPTION="Your site description"
```

### 3. Supabase database

Run `supabase/sql_command.sql` in your Supabase SQL Editor. This creates all tables, storage buckets, RLS policies, triggers, and the `is_admin()` function.

> ⚠️ Replace the admin UUIDs in the `is_admin()` function with your actual Supabase user UUIDs. Add new admins by updating the UUID list and re-running the function.

### 4. Create admin account

1. Supabase Dashboard → Authentication → Users → Add User
2. Your UUID goes into the `is_admin()` function
3. Login at `/admin/login`

### 5. Resend setup (for message replies)

1. Sign up at [resend.com](https://resend.com) (free: 100 emails/day)
2. Create an API key → add to `.env` as `RESEND_API_KEY`
3. In sandbox mode, only your registered email receives messages
4. Verify a domain to send to any address

### 6. Run dev server

```bash
npm run dev
```

## Project Structure

```
├── assets/css/           Global styles & Tailwind layers
├── components/           Reusable Vue components (13 icons, ConfirmDialog, Sidebar, etc.)
├── composables/          Shared logic
│   ├── useAdminCrud.ts        Generic Supabase CRUD
│   ├── useStorageUpload.ts    Supabase storage upload/delete
│   ├── useSupabaseData.ts     Public data fetching + getPublicUrl
│   ├── usePortfolio.ts        Navigation, sidebar, filter state
│   ├── useFormValidation.ts   Contact form validation + sanitize
│   ├── useErrorHandler.ts     Error boundary + retry logic
│   └── usePerformance.ts      Lazy loading, debounce, throttle
├── layouts/              Admin layout (top nav + mobile nav)
├── middleware/            Admin auth guard (Supabase session)
├── pages/
│   ├── index.vue              Public single-page portfolio
│   ├── admin/                 11 admin CMS pages
│   └── blog/                  Blog listing & [slug] detail
├── server/api/           Nitro server routes
│   └── messages/send-reply    Resend email API
├── supabase/             SQL schema, RLS policies, seed data
├── types/                TypeScript interfaces
├── tailwind.config.ts    AWS squid-ink dark theme palette
└── nuxt.config.ts        Nuxt + modules + runtime config
```

## Production Build

```bash
npm run build
npm run preview
```

SSR-enabled via Nuxt Nitro server. Deployable to Vercel, Netlify, or any Node.js host.

## Color Palette (AWS Squid-Ink Dark Theme)

| Token | Hex | Usage |
|---|---|---|
| AWS Squid Ink | `#232F3E` | Main background |
| AWS Lighter Slate | `#1C2533` | Cards, inputs |
| AWS Dark Slate | `#0F1B2A` | Sidebar, nav |
| AWS Orange | `#FF9900` | Buttons, links, focus, accent |
| AWS Teal | `#14B8A6` | Research paper section |
| AWS Magenta | `#FF007A` | 3D accent gradient |
| AWS Yellow | `#FFC800` | 3D accent gradient |
| AWS Cyan | `#00BFFF` | 3D accent gradient |
