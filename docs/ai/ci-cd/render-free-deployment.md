# Render Free Deployment Foundation

## Status

Implementation baseline for KAN-30, KAN-27, and KAN-28.

The initial hosting target is Render Free. This is a transitional MVP choice,
not an architectural dependency: the same OCI image and environment contract
must remain deployable to Render, AWS, Google Cloud, or another container
platform.

## Runtime Contract

- build the repository root `Dockerfile`
- run `node dist/main.js` directly as the container process
- run as the unprivileged `node` user
- listen on `APP_HOST=0.0.0.0` and the provider-assigned `PORT`
- persist all application state in PostgreSQL or an external service
- provide the database through the standard `DATABASE_URL`
- inject secrets at runtime; never bake them into the image
- treat the container filesystem as ephemeral
- terminate gracefully on `SIGTERM` through Nest shutdown hooks and Prisma
  disconnection
- allow the HTTP process to start independently from PostgreSQL; Prisma connects
  lazily and readiness remains unavailable until the database accepts queries

The image contains no Render-specific runtime code or configuration.

## Health Contract

| Endpoint            | Purpose           | Dependency | Success               | Failure                        |
| ------------------- | ----------------- | ---------- | --------------------- | ------------------------------ |
| `GET /health/live`  | process liveness  | none       | `200 {"status":"ok"}` | process is unreachable         |
| `GET /health/ready` | traffic readiness | PostgreSQL | `200 {"status":"ok"}` | `503 {"status":"unavailable"}` |

When `APP_GLOBAL_PREFIX` is configured, prefix both paths. Configure Render's
health check with the effective readiness path.

## Transitional Free Topology

Create two independent Render Web Services from the same repository and
Dockerfile:

| Environment | Git branch | Logical database      | Intended use                                   |
| ----------- | ---------- | --------------------- | ---------------------------------------------- |
| preview     | `staging`  | `sandicts_preview`    | integration and product validation             |
| production  | `master`   | `sandicts_production` | production-like validation before real clients |

The free workspace supports only one free PostgreSQL instance, so the two
logical databases share one physical instance. This does not provide physical
isolation. Do not store real client data in this transitional topology.

## Database Provisioning

Provision the two logical databases once with a privileged administrative
connection. Give each service its own least-privilege application credential
and its own `DATABASE_URL`. Do not reuse the administrative credential at
runtime.

Run schema migrations as an explicit deployment step before releasing the new
application image:

```bash
npm ci
npm run prisma:migrate:deploy
```

Application startup must never run migrations implicitly. This keeps startup
repeatable and avoids concurrent migration races when the platform is upgraded
to multiple instances.

## Render Service Configuration

For each Web Service:

1. Select Docker as the runtime and use the repository root `Dockerfile`.
2. Map the service to `staging` for preview or `master` for production.
3. Configure the effective readiness endpoint as the health-check path.
4. Set `NODE_ENV=production`.
5. Set `APP_ENV=staging` or `APP_ENV=production`.
6. Inject `DATABASE_URL` and the remaining application secrets through the
   environment-specific Render configuration.
7. Use exact HTTPS frontend origins in `CORS_ALLOWED_ORIGINS`.
8. Disable automatic deploy until the migration-and-deploy workflow is wired,
   so application code is not released before its migration succeeds.

Keep Render deploy hooks, service IDs, and API credentials in deployment
configuration only. They are adapters around the portable runtime contract.

## Free-Tier Operating Constraints

- cold starts are expected after inactivity
- the filesystem is ephemeral
- the Web Service has a single instance and no horizontal scaling
- the free PostgreSQL database has limited storage and expires after 30 days
- provider-managed database backups are unavailable on the free tier

Until migration to durable infrastructure, schedule encrypted `pg_dump`
exports to storage outside Render and regularly test restoration. A backup that
has not been restored in a test is not considered verified.

## Migration Triggers

Move away from this topology before any of the following:

- onboarding the first real client or storing real client data
- approaching free database storage or expiry limits
- requiring predictable response time without cold starts
- requiring multiple application instances, autoscaling, or an SLA
- requiring managed backups, point-in-time recovery, or stronger environment
  isolation

Migration should require only a new container target, secret mapping, DNS
change, and PostgreSQL data transfer. Application code must not change because
of the infrastructure provider.
