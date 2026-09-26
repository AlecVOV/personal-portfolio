# personal-portfolio

Two portfolio websites for **Le Hoang Triet Thong (Chi Lon Thon)**, built with Nuxt 3 and running entirely on
serverless AWS in Singapore (`ap-southeast-1`).

| Site | URL | Source |
|---|---|---|
| IT portfolio — projects, resume, certifications, blog | https://chilonthon.com | [`apps/it-portfolio`](apps/it-portfolio) |
| Photography portfolio — gallery, blog, testimonials | https://photo.chilonthon.com | [`apps/photography-portfolio`](apps/photography-portfolio) |

Both sites have a public part (server-rendered, cached at the CDN) and a private `/admin` area for editing content.

## Architecture

```
Browser ──► Amplify Hosting (Nuxt SSR, CloudFront CDN) ──► server/api/* ──► DynamoDB (one table per site)
   │                         │                                  ├──► S3 presigned upload URLs
   │                         │                                  ├──► Cognito (admin sign-in)
   │                         │                                  └──► SES (contact-form email)
   └──► images/files ◄── CloudFront ◄── private S3 bucket (it/, photo/)
```

| Concern | Service |
|---|---|
| Hosting + SSR | AWS Amplify Hosting (`WEB_COMPUTE`, Nitro preset `aws_amplify`), one app per site from this monorepo |
| Data | Amazon DynamoDB, on-demand, single-table design ([`docs/data-model.md`](docs/data-model.md)) |
| Images / files | Private Amazon S3 bucket behind CloudFront (Origin Access Control); images are resized in the browser before upload |
| Admin sign-in | Amazon Cognito (one admin user); the session is a sealed, httpOnly cookie via `nuxt-auth-utils` |
| Email | Amazon SES, domain `chilonthon.com` verified with DKIM, SPF (custom MAIL FROM) and DMARC |
| DNS | Amazon Route 53 |
| Server credentials | Amplify IAM compute role per site — no AWS access keys in code or environment variables |
| Infrastructure as code | [`infra/template.yaml`](infra/template.yaml) (AWS CloudFormation) |

Design goals: no always-on servers, minimal monthly cost (a budget alert fires above 5 USD/month),
every public list is a single DynamoDB `Query`, and every write route requires an admin session.

## Repository layout

```
personal-portfolio/
├── amplify.yml              # Amplify build spec for both apps (monorepo)
├── infra/template.yaml      # DynamoDB, S3 + CloudFront, IAM roles, Cognito, SES, Route 53 records, budget
├── docs/data-model.md       # DynamoDB key design and access patterns
├── scripts/migrate/         # one-off migration from the previous Supabase/Cloudinary stack
├── apps/
│   ├── it-portfolio/
│   └── photography-portfolio/
├── DEPLOY.md                # live status and remaining deployment steps (Vietnamese)
└── CLAUDE.md                # working rules for the Claude Code assistant
```

The two apps share no runtime code; each has its own `package.json` and `package-lock.json`.

## Local development

Requirements: Node.js 20 and the AWS CLI signed in to the account (the dev server uses your local AWS profile).

```bash
cd apps/it-portfolio            # or apps/photography-portfolio
cp .env.example .env            # fill in values — see below
npm ci
npm run dev                     # http://localhost:3000
```

Environment variable names are listed in each app's `.env.example`. Values come from the CloudFormation stack
outputs:

```bash
aws cloudformation describe-stacks --stack-name portfolio-infra --region ap-southeast-1 \
  --query 'Stacks[0].Outputs'
```

Never commit `.env` files. Only `.env.example` files (names, no values) are tracked.

## Deployment

- **Sites:** pushing to `main` triggers an Amplify build of both apps. To reproduce the production build locally:
  `NITRO_PRESET=aws_amplify npm run build` (output in `.amplify-hosting/`).
- **Environment variables** are set per Amplify app and read at build time, so trigger a rebuild after changing one.
- **Infrastructure:** validate, then deploy the stack. The full command, with all required parameters, is in
  [`DEPLOY.md`](DEPLOY.md) §6.

  ```bash
  aws cloudformation validate-template --template-body file://infra/template.yaml
  ```

## Security

- Report security issues privately to the repository owner rather than opening a public issue.
- Secrets never live in the repository: AWS access comes from IAM roles; the session secret and resource names are
  Amplify environment variables.
- All admin routes check the Cognito-backed session on the server; request bodies are validated and user text is
  escaped before it goes into email.

## License

See [`apps/it-portfolio/LICENSE`](apps/it-portfolio/LICENSE).
