# API Preview on Render Free and Neon Free

## Status and scope

Implementation baseline for the KAN-27 Preview environment.

This phase deploys only Preview and must not contain real client data. Production
remains out of scope until its database, secrets, domain, backup policy, and
promotion workflow are approved independently.

The hosting target is intentionally portable:

- Render runs the repository root `Dockerfile`.
- Neon provides PostgreSQL 18.
- GitHub Actions owns CI, migrations, deployment, and verification.
- Render automatic deploys remain disabled.
- The same OCI image and environment contract can move to another provider.

## Target Preview topology

| Concern     | Preview resource                                                      | Region / branch                         |
| ----------- | --------------------------------------------------------------------- | --------------------------------------- |
| Source      | `sandicts/nodejs-sandicts-api`                                        | Git branch `staging`                    |
| CI/CD       | GitHub Actions environment `preview`                                  | deployments allowed only from `staging` |
| API runtime | planned Render Free Web Service `sandicts-api-preview`                | Virginia                                |
| Database    | Neon Free project `sandicts-api-preview`, database `sandicts_preview` | AWS US East 1, PostgreSQL 18            |
| Frontend    | Vercel Preview/Staging deployment                                     | exact HTTPS origin in API CORS          |

The Neon console can display an internal database branch named `production`.
That label is not the Sandicts Production environment: the entire Neon project
is Preview-only. It can be renamed later for clarity without changing the Git
promotion model.

## Runtime contract

- run `node dist/main.js` as the container process
- run as the unprivileged `node` user
- bind to `APP_HOST=0.0.0.0` and the provider `PORT`
- store state only in PostgreSQL or another external service
- use the pooled Neon URL in the Render `DATABASE_URL`
- inject secrets at runtime and never bake them into the image
- treat the container filesystem as ephemeral
- handle `SIGTERM` through Nest shutdown hooks and Prisma disconnection
- start independently from PostgreSQL; readiness remains unavailable until the
  database accepts queries

The image contains no Render-specific application code.

Local Compose uses the official `postgres:18-bookworm` image and a new named
volume, `sandicts-postgres-18-data`. The previous PostgreSQL 16 volume remains
untouched for recoverability; Compose does not perform an unsafe in-place major
upgrade. Recreate local synthetic data through migrations and seed procedures.

## Health contract

| Endpoint            | Purpose           | Dependency | Success               | Failure                        |
| ------------------- | ----------------- | ---------- | --------------------- | ------------------------------ |
| `GET /health/live`  | process liveness  | none       | `200 {"status":"ok"}` | process is unreachable         |
| `GET /health/ready` | traffic readiness | PostgreSQL | `200 {"status":"ok"}` | `503 {"status":"unavailable"}` |

Configure Render's HTTP health check as `/health/ready`. If
`APP_GLOBAL_PREFIX` is later set, prefix both health paths consistently.

## Database credentials and migrations

Use two separate credentials:

| Credential       | Connection      | Stored in                                               | Purpose                      |
| ---------------- | --------------- | ------------------------------------------------------- | ---------------------------- |
| migration owner  | Neon direct URL | GitHub environment secret `PREVIEW_DATABASE_DIRECT_URL` | `prisma migrate deploy` only |
| application role | Neon pooled URL | Render secret `DATABASE_URL`                            | API runtime only             |

Do not use `neondb_owner` in the running API. Create a SQL role without schema
creation privileges after the migrations exist. Use a generated password and
replace the placeholder locally; never commit or paste the final URL.

```sql
CREATE ROLE sandicts_preview_app LOGIN PASSWORD 'REPLACE_WITH_GENERATED_PASSWORD';

GRANT CONNECT ON DATABASE sandicts_preview TO sandicts_preview_app;
GRANT USAGE ON SCHEMA public TO sandicts_preview_app;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public
  TO sandicts_preview_app;
GRANT USAGE, SELECT, UPDATE
  ON ALL SEQUENCES IN SCHEMA public
  TO sandicts_preview_app;

ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sandicts_preview_app;
ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO sandicts_preview_app;
```

Application startup never runs migrations. The post-merge workflow checks out
the immutable `staging` SHA and runs:

```bash
npm ci
npm run prisma:migrate:deploy
```

Migrations must follow expand-and-contract compatibility. A code rollback does
not and must not attempt to run destructive down migrations automatically.

## GitHub Preview environment

Configure these values only in GitHub Settings > Environments > `preview`.

### Secrets

| Name                             | Value                                             |
| -------------------------------- | ------------------------------------------------- |
| `PREVIEW_DATABASE_DIRECT_URL`    | direct Neon owner URL for migrations              |
| `RENDER_PREVIEW_DEPLOY_HOOK_URL` | secret hook from the Render service Settings page |
| `RENDER_API_KEY`                 | Render API key used only to observe deploy status |

### Variables

| Name                        | Example                                     |
| --------------------------- | ------------------------------------------- |
| `RENDER_PREVIEW_SERVICE_ID` | `srv-...` identifier from Render            |
| `PREVIEW_API_BASE_URL`      | `https://sandicts-api-preview.onrender.com` |

Keep the environment deployment rule restricted to the `staging` branch. Do
not store pooled runtime credentials in GitHub and do not store the direct
migration URL in Render.

## Render service configuration

Create the service only after this implementation reaches `developer` and
before the first `developer -> staging` promotion.

| Field             | Value                          |
| ----------------- | ------------------------------ |
| Name              | `sandicts-api-preview`         |
| Source            | `sandicts/nodejs-sandicts-api` |
| Runtime           | Docker                         |
| Dockerfile        | repository root `Dockerfile`   |
| Branch            | `staging`                      |
| Region            | Virginia                       |
| Plan              | Free                           |
| Auto-Deploy       | Off                            |
| Health Check Path | `/health/ready`                |

Render runtime configuration must include:

| Variable                   | Preview rule                                  |
| -------------------------- | --------------------------------------------- |
| `NODE_ENV`                 | `production`                                  |
| `APP_ENV`                  | `staging`                                     |
| `APP_HOST`                 | `0.0.0.0`                                     |
| `DATABASE_URL`             | pooled Neon URL using `sandicts_preview_app`  |
| `CORS_ALLOWED_ORIGINS`     | exact HTTPS Vercel Preview/Staging origin(s)  |
| `WEB_APP_BASE_URL`         | primary exact HTTPS frontend origin           |
| `AUTH_ACCESS_TOKEN_SECRET` | generated value of at least 32 characters     |
| `AUTH_GOOGLE_CLIENT_ID`    | Preview Google OAuth client ID                |
| `AUTH_COOKIE_SECURE`       | `true`                                        |
| `AUTH_COOKIE_SAME_SITE`    | `none` while Vercel and Render are cross-site |
| `EMAIL_DELIVERY_PROVIDER`  | `resend`                                      |
| `EMAIL_FROM_ADDRESS`       | verified Preview sender                       |
| `RESEND_API_KEY`           | Preview-only Resend credential                |
| `LOG_LEVEL`                | `info`                                        |
| `LOG_PRETTY`               | `false`                                       |

`CORS_VERCEL_PREVIEW_PROJECT_SLUG` and
`CORS_VERCEL_PREVIEW_TEAM_SLUG` are optional and must be configured together
when dynamic Vercel PR origins are allowed. Production must not allow those
dynamic origins.

## Deployment flow

```text
task branch -> PR to developer -> CI PR -> squash merge
developer -> promotion PR to staging -> CI PR -> merge commit
push staging SHA -> reusable full CI
                 -> prisma migrate deploy (Neon direct owner URL)
                 -> Render deploy hook ref=<exact SHA>
                 -> poll Render API until that SHA is live
                 -> GET /health/ready
                 -> GET /health/live smoke test
                 -> success
```

The deploy helper handles both an immediately started deploy (`200`) and a
queued deploy (`202`). It discovers the queued deploy by exact commit SHA and
never prints the hook URL or API key.

## Rollback

Use `.github/workflows/rollback-preview.yml` from the `staging` branch and
provide:

- the full 40-character SHA of a previously healthy Preview release
- a non-empty rollback reason

The workflow deploys exactly that SHA, verifies the Render-reported commit, and
runs readiness and liveness checks. It does not reverse Prisma migrations.
Rollback is safe only while database changes remain backward compatible. If the
schema change is destructive, restore compatibility with a forward migration
before rolling application code back.

## Free-tier operating rules

- cold starts are expected after inactivity
- the filesystem is ephemeral
- capacity and uptime are not an SLA
- use synthetic Preview data only
- migrations and seed procedures are the source of truth for reconstruction
- provider recovery features are helpful but are not the only recovery plan

Move to paid, durable infrastructure before real client data, predictable
latency, multiple instances, formal backup/restore objectives, or an SLA are
required.

## Reference documentation

- [Render deploy hooks](https://render.com/docs/deploy-hooks)
- [Render deploy behavior](https://render.com/docs/deploys)
- [Render health checks](https://render.com/docs/health-checks)
- [Render API](https://render.com/docs/api)
