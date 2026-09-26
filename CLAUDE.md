# CLAUDE.md — personal-portfolio (monorepo, all-AWS serverless)

Two Nuxt 3 SSR sites for Le Hoang Triet Thong (GitHub: AlecVOV) in one GitHub repo.
Target: **everything on AWS, serverless, minimum cost**, region **ap-southeast-1 (Singapore)**.
Old stack being removed: Vercel, Supabase (DB + Auth + Storage), Cloudinary, Resend, Web3Forms.

## Working with the human

The owner is not an infrastructure person. Claude drives the Migration checklist end to end, in order.
- Do everything Claude can do itself. Stop only when the human must act (log in, paste a key, click in the
  AWS/Supabase/GitHub web console) or must approve a command that costs money or deletes data (see Hard rule 3).
- Ask ONE thing at a time, in simple Vietnamese, with exact click-by-click steps: which page, which button,
  which file and which line to paste into. The human replies "xong" when done.
- Never ask the human to read code or diffs. After each Phase, summarize in 2–3 sentences what was done, then continue.
- On errors, read the logs and fix them yourself. Ask only when truly stuck.
- All Hard rules still apply, especially: never print secret values.

## Target architecture

| Concern | Old | New (AWS) |
|---|---|---|
| Hosting + SSR | Vercel | Amplify Hosting (WEB_COMPUTE, Nitro preset `aws_amplify`), 2 apps from 1 repo |
| Database | Supabase Postgres | DynamoDB, **on-demand**, one table per app, single-table design |
| Admin auth | Supabase Auth | Amazon Cognito user pool (Lite tier, self sign-up off, 1 admin user), shared by both apps, one app client per app |
| Images / files | Cloudinary, Supabase Storage | One private S3 bucket + one CloudFront distribution (OAC), prefixes `photo/` and `it/` |
| Uploads | Cloudinary widget | Browser resizes → server route returns S3 presigned PUT URL → browser uploads directly |
| Email | Resend | Amazon SES (sandbox is fine: only sends to the owner's verified address) |
| Contact forms | Web3Forms | Own server route → save to DynamoDB + SES notification |
| AWS credentials in SSR | — | Amplify **IAM compute role** per app. No access keys in env, ever |
| Infra as code | — | `infra/template.yaml` (CloudFormation), deployed with `aws cloudformation deploy` |

Cost rules (apply to every change):
- No always-on resources: no RDS, NAT Gateway, EC2, ElastiCache, OpenSearch, provisioned DynamoDB capacity, or AppSync.
- No image-processing Lambda. Resize in the browser before upload (max 2560px long edge + an 800px thumbnail, WebP/JPEG).
- Public pages send `Cache-Control: s-maxage=300, stale-while-revalidate=86400` via `routeRules` so the CDN absorbs traffic; admin and `/api` write routes send `no-store`. (Verify Amplify honors it by checking `x-cache` headers after deploy.)
- Public list pages = one DynamoDB `Query` each. Never `Scan` in a public request path.
- S3 lifecycle: abort incomplete multipart uploads after 1 day. No versioning.
- CloudWatch log retention for Amplify compute logs: 14 days.

## Repo layout

```
personal-portfolio/
├── CLAUDE.md
├── amplify.yml
├── infra/
│   └── template.yaml            # DynamoDB x2, S3, CloudFront+OAC, IAM compute roles x2, SES identity, Cognito
├── scripts/
│   └── migrate/                 # one-off: Supabase → DynamoDB, Cloudinary/Supabase Storage → S3
├── docs/
│   └── data-model.md            # key design per table (write BEFORE coding the data layer)
└── apps/
    ├── it-portfolio/
    └── photography-portfolio/
```

- Folder names kebab-case, no spaces. Exactly one `.git`, at the repo root.
- Each app keeps its own `package.json` / `package-lock.json`. No workspaces.

## Data layer rules

- AWS SDK v3 only (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `@aws-sdk/client-sesv2`).
- All AWS access lives in `server/` (`server/utils/*.ts` + `server/api/*`). The browser never talks to DynamoDB, and never holds AWS credentials.
- Single-table design per app: attributes `PK`, `SK`, `GSI1PK`, `GSI1SK`, plus `type`, `createdAt`, `updatedAt`. One GSI (`GSI1`) max unless docs/data-model.md justifies another.
- Every list shown on a public page must be answerable by one `Query` on `PK` or `GSI1PK`.
- Derive entities from the existing code: it-portfolio from `supabase/sql_command.sql` and composables; photography-portfolio from its `server/api/*` routes.
- Every write/delete route and every presign route calls `requireAdmin(event)` first.
- Validate request bodies (zod or hand-written) before writing. Escape user text before putting it in email HTML.

## Auth (Cognito)

- One user pool in `infra/template.yaml`: `UserPoolTier: LITE` (verify property name), `AllowAdminCreateUserOnly: true`,
  email as username, strong password policy, optional TOTP MFA. Two public app clients (no client secret),
  `ALLOW_USER_PASSWORD_AUTH` + `ALLOW_REFRESH_TOKEN_AUTH` only. No hosted UI / Cognito domain needed.
- Flow (keeps the existing custom login pages):
  1. `POST /api/auth/login` → server calls Cognito `InitiateAuth` (`USER_PASSWORD_AUTH`) with `@aws-sdk/client-cognito-identity-provider`.
  2. Handle `NEW_PASSWORD_REQUIRED` and `SOFTWARE_TOKEN_MFA` challenges via `POST /api/auth/challenge`.
  3. Verify the ID token server-side with `aws-jwt-verify`, then store only `{ sub, email, exp }` in a
     `nuxt-auth-utils` sealed session cookie (httpOnly, secure, sameSite=lax, max 8h). Cognito tokens never reach the browser.
  4. `POST /api/auth/logout` clears the session (and calls `GlobalSignOut` if a refresh token is kept server-side; otherwise skip).
- `server/utils/auth.ts` exports `requireAdmin(event)` = `requireUserSession` + check `sub` against `APP_ADMIN_SUB` or membership in group `admin`.
- Admin middleware uses `useUserSession()`. Remove all `@nuxtjs/supabase` auth code.
- Brute force is handled by Cognito's built-in lockout; no custom rate limiter.
- The admin user is created by the human with the AWS CLI (`admin-create-user`, then `admin-set-user-password --permanent`). Claude never sees the password.

## Commands (inside an app folder)

```bash
npm ci
npm run dev                                # uses your local AWS profile (AWS_PROFILE) for DynamoDB/S3
NITRO_PRESET=aws_amplify npm run build     # must succeed before any deploy-related change is "done"
```

Infra (from repo root; the human runs deploys, Claude writes/validates):
```bash
aws cloudformation validate-template --template-body file://infra/template.yaml
aws cloudformation deploy --template-file infra/template.yaml --stack-name portfolio-infra \
  --capabilities CAPABILITY_NAMED_IAM --region ap-southeast-1
```

Node 20 everywhere.

## Deployment — Amplify Hosting

- Two Amplify apps, region ap-southeast-1, branch `main`, monorepo:
  `AMPLIFY_MONOREPO_APP_ROOT=apps/it-portfolio` and `apps/photography-portfolio`.
- Attach each app's IAM compute role (output of the CloudFormation stack) in Amplify → App settings → IAM roles → Compute role.
- `nuxt.config.ts`: `nitro: { awsAmplify: { runtime: 'nodejs20.x' } }` (verify option against installed Nitro).
- Don't add `vercel.json` or any Vercel package.

Live resources (account 677276113002, created 2026-09-25/26):
| | it-portfolio | photography-portfolio |
|---|---|---|
| Amplify app ID | `d21kdgth3ccglp` | `d9tbb9ql4bwpu` |
| URL | https://main.d21kdgth3ccglp.amplifyapp.com | https://main.d9tbb9ql4bwpu.amplifyapp.com |
| Table / compute role | `portfolio-it` / `portfolio-it-compute` | `portfolio-photo` / `portfolio-photo-compute` |
- Stack `portfolio-infra`; Cognito pool `ap-southeast-1_7ochT3JZ0` (admin user = owner's outlook address, group `admin`).
- Env vars are set with the AWS CLI from stack outputs (never typed by hand, never printed).
  `update-app --environment-variables` REPLACES the whole map — always merge with the current map.
- S3 CORS origins come from the stack parameter `AllowedOrigins`; add custom domains there and redeploy.
- Amplify log groups `/aws/amplify/<appId>` pre-created with 14-day retention.

### amplify.yml (repo root)

```yaml
version: 1
applications:
  - appRoot: apps/it-portfolio
    frontend:
      phases:
        preBuild:
          commands:
            - nvm install 20 && nvm use 20
            - npm ci
        build:
          commands:
            - NITRO_PRESET=aws_amplify npm run build
      artifacts:
        baseDirectory: .amplify-hosting
        files: ['**/*']
      cache:
        paths: ['node_modules/**/*']
  - appRoot: apps/photography-portfolio
    frontend:
      phases:
        preBuild:
          commands:
            - nvm install 20 && nvm use 20
            - npm ci
        build:
          commands:
            - NITRO_PRESET=aws_amplify npm run build
      artifacts:
        baseDirectory: .amplify-hosting
        files: ['**/*']
      cache:
        paths: ['node_modules/**/*']
```

### Environment variables (set per Amplify app; never committed)

Amplify reserves names starting with `AWS`, so app variables use the `APP_` prefix.
`nuxt.config.ts` reads them at build time → redeploy after changing any.

| Both apps | it-portfolio only | photography-portfolio only |
|---|---|---|
| `APP_REGION=ap-southeast-1` | `NUXT_PUBLIC_SITE_URL`, `NUXT_SITE_NAME`, `NUXT_SITE_DESCRIPTION` | — |
| `APP_TABLE_NAME` | | |
| `SES_FROM_EMAIL`, `CONTACT_TO_EMAIL` (both = the SES-verified owner address while in sandbox) | | |
| `APP_MEDIA_BUCKET`, `NUXT_PUBLIC_MEDIA_BASE_URL` (CloudFront URL) | | |
| `NUXT_SESSION_PASSWORD` (≥32 chars), `APP_COGNITO_USER_POOL_ID`, `APP_COGNITO_CLIENT_ID` (per app), `APP_ADMIN_SUB` | | |

Each app has `.env.example` with names only.

## Hard rules

1. Never commit `.env*` (except `.env.example`), keys, tokens, or AWS credentials. Root `.gitignore` covers
   `node_modules`, `.nuxt`, `.nitro`, `.output`, `.data`, `.cache`, `dist`, `.amplify-hosting`, `.env`, `.env.*`, `!.env.example`, `*.log*`, `dev_log.txt`, `scripts/migrate/data/`.
2. Never print secret values. Refer to variables by name. Do not `cat`/`head`/`grep -v` files that may hold secrets
   (`.env*`, `dev_log.txt`, `Ultimate_Plan.md`, `*.sql`, anything under `scripts/migrate/` output). To inspect them,
   print only key names or line counts (e.g. `grep -oE '^[A-Z_]+=' .env`, `grep -ciE 'password|key|secret' file`).
   If a secret is ever printed, stop and tell the human which credential to rotate.
3. Never run `aws cloudformation deploy`, `aws s3 rm`, `aws dynamodb delete-*`, or anything that creates cost or deletes data without the human explicitly saying so in this session. Read-only `aws ... describe/list/get` is fine.
4. IAM least privilege: each compute role gets only its own table (+ its GSI) and its own S3 prefix, plus
   `ses:SendEmail` from the verified identity (both apps: contact-form notifications; the owner chose this for
   photography-portfolio on 2026-09-25).
5. One app per commit unless the change is repo-wide.
6. Migrate photography-portfolio first (it already routes data through `server/api`), then it-portfolio.

## Migration checklist

Phase 1 — repo
- [x] Delete nested `.git`; rename folders to `apps/it-portfolio`, `apps/photography-portfolio`.
- [x] Root `.gitignore`; `git init`; verify no `.env` is staged.
- [x] Move `apps/photography-portfolio/public/img for resize/` OUT of the repo (moved to `D:\portfolio-originals\photography`) before the first commit; used later as Phase 5 upload source.
- [x] Replace the real Supabase URL + anon key in `apps/it-portfolio/supabase/sql_command.sql` with placeholders.
- [x] First commit + push.

Phase 2 — infra
- [x] Write `docs/data-model.md` (entities, PK/SK/GSI1 per access pattern) for both apps.
- [x] Write `infra/template.yaml`: 2 DynamoDB tables (on-demand, TTL attr `ttl`, PITR off), S3 bucket (private, block public access, CORS for PUT from both site domains + localhost, lifecycle rule), CloudFront + OAC (PriceClass_200 or PriceClass_All; pick the cheapest class that includes Singapore), 2 compute roles (trust `amplify.amazonaws.com`), SES email identity, Cognito user pool + 2 app clients. Outputs: table names, bucket, CloudFront domain, role ARNs, user pool ID, client IDs.
- [x] Validate template. Human deploys. (stack `portfolio-infra` deployed 2026-09-25)

Phase 3 — photography-portfolio
- [x] `server/utils/{dynamo,s3,auth}.ts`; rewrite `server/api/*` on DynamoDB; add auth to all writes.
- [x] Replace Cloudinary with browser resize + presigned upload + `server/api/media/*` (list/delete by S3 prefix).
- [x] Replace Supabase auth with Cognito flow (see Auth); update `middleware/auth.ts` and admin pages.
- [x] Contact form → `server/api/contact.post.ts` (DynamoDB + SES) or keep as mailto; remove Web3Forms.
- [x] Remove `@nuxtjs/supabase`, `@supabase/supabase-js`, `@nuxt/content`, `better-sqlite3`, test pages.
- [x] `routeRules` caching; Amplify build passes locally.

Phase 4 — it-portfolio
- [x] Move every client-side Supabase call (`useSupabaseData`, `useAdminCrud`, `useStorageUpload`, admin pages) behind new `server/api/*` routes on DynamoDB/S3.
- [x] Auth via Cognito flow (see Auth); `middleware/admin-auth.ts` updated.
- [x] Contact form + `messages` admin page on DynamoDB; `send-reply` via SES with auth + escaping; remove Resend and Web3Forms.
- [x] Remove `@nuxtjs/supabase`, `resend`, stray `content:` block in `nuxt.config.ts`.
- [x] `routeRules` caching; Amplify build passes locally.

Phase 5 — data migration (one-off, `scripts/migrate/`). Run right after Phase 2 so Phases 3–4 are built
against real data; re-run at cutover to pick up anything new.

Source inventory (two SEPARATE Supabase projects):
- it-portfolio: `profile`, `projects`, `project_categories`, `skills`, `experience`, `education`,
  `certifications`, `fields`, `social_links`, `contact_messages`, `blog_posts`; Storage buckets `projects`, `blog-images`.
- photography-portfolio: `portfolio_items`, `categories`, `blog_posts`, `testimonials`, `analytics_events`
  (ask the human whether to migrate or drop `analytics_events`); images on Cloudinary.

Structure: `scripts/migrate/` is its own package (`package.json` with `tsx`, `@supabase/supabase-js`,
AWS SDK v3, `cloudinary`), config from `scripts/migrate/.env` (gitignored), outputs under
`scripts/migrate/data/` (gitignored — contains visitor PII from `contact_messages`).
- [x] `export.ts --app <it|photo>`: read every table with the service key, paginated (1000 rows), write
      `data/<app>/<table>.json`; download every Supabase Storage object and every Cloudinary asset referenced
      by rows (or listed via Cloudinary Admin API) into `data/<app>/files/`. Read-only against the source.
- [x] `transform.ts`: pure functions per entity → items shaped per docs/data-model.md. Keep the original UUID
      as the item id (relations like `category_id` stay valid), timestamps → ISO 8601, drop nulls.
- [x] `upload-files.ts`: upload files to S3 (`photo/...`, `it/...`), write `data/<app>/url-map.json`
      (old URL → CloudFront URL), and rewrite URLs in image fields AND inside blog markdown/HTML bodies.
- [x] `import.ts`: `BatchWriteItem` in chunks of 25 with retry on `UnprocessedItems`; deterministic keys so
      re-runs overwrite instead of duplicating. `--dry-run` is the DEFAULT; real writes need `--apply`.
- [x] `verify.ts`: per-entity counts source vs DynamoDB, list any unrewritten old URLs (`supabase.co`, `cloudinary.com`).
- [x] Claude writes and dry-runs; the human runs `--apply`. (first full run 2026-09-25: VERIFY OK both apps; re-run at cutover) Claude never prints row contents, only counts and key names.

Phase 6 — go live
- [x] Push to GitHub; create both Amplify apps (Singapore), attach compute roles, set env vars.
- [x] Verify SES identity; set an AWS Budget alert. (SES identity verified; budget `portfolio-monthly-5usd` in the stack)
- [ ] Content freeze on the old sites → final `export` + `import --apply` + `verify`.
- [ ] Test admin login, CRUD, uploads, contact forms on the Amplify URLs.
- [ ] Move domains from Vercel; then delete Vercel projects, Supabase project, Cloudinary, Resend, Web3Forms accounts/keys.
- [ ] Make old repo `AlecVOV/chilonthon-portfolio-site` private or delete it (its history contains `.env` and `dev_log.txt`).
