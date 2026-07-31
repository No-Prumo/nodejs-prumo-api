---
title: Configuration Foundation
doc-type: implementation-guide
role: source-of-truth
priority: high
canonical: docs/ai/config/configuration-foundation.md
related:
  - docs/ai/index.md
  - docs/ai/architecture/transactional-email-provider-decision.md
scope: nestjs-config, env-validation, zod, bootstrap, typed-config
read-when:
  - adding new environment variables
  - changing application bootstrap
  - adding transactional email provider config
  - integrating database, logger, docs, or observability settings
  - removing direct process.env access
  - implementing new infrastructure modules
do-not-read-when:
  - changing only business rules unrelated to environment/configuration
  - editing only controllers, services, or tests with no config impact
---

# Configuration Foundation

## Purpose

Source of truth for the backend configuration baseline.

This project uses:

- `@nestjs/config`
- custom `validate()` with Zod
- typed access through config domains
- no direct `process.env` usage outside `src/config`

If future code conflicts with this document, prefer this document unless the user explicitly requests a different direction.

## Design goals

- keep the structure small
- validate env early at startup
- centralize parsing and defaults
- expose config grouped by domain
- avoid premature coupling with ORM or observability vendors
- make growth easy without adding abstraction layers now

## Current file layout

```text
src/
  bootstrap/
    bootstrap.ts
    setup-cors.ts
    setup-docs.ts
    setup-global-prefix.ts
    setup-logger.ts
    setup-shutdown-hooks.ts

  config/
    index.ts
    configuration.module.ts
    app/
      app.config.ts
      app-environment.ts
      package-metadata.ts
    auth/
      auth.config.ts
    cors/
      cors-origin.ts
      cors.config.ts
    database/
      database.config.ts
    docs/
      docs.config.ts
    env/
      env.schema.ts
    logger/
      logger.config.ts
      logger-level.ts
    observability/
      observability.config.ts

  infra/
    prisma/
      prisma.module.ts
      prisma.service.ts

prisma/
  schema.prisma

prisma.config.ts
```

## Responsibilities by file

### `src/config/index.ts`

Owns:

- public exports for config domains and config types
- hiding the internal config folder layout from application consumers

Rules:

- modules outside `src/config` should prefer importing from `../config` or `../../config`
- do not make feature modules import from deep config paths unless there is a clear reason
- do not re-export `ConfigurationModule` from this barrel; import it directly from `src/config/configuration.module.ts` so importing config types or domains does not trigger environment validation in unit tests

### `src/config/env/env.schema.ts`

Owns:

- Zod schema for all supported env vars
- coercion of strings to numbers and booleans
- defaults
- validation error formatting
- cached parsing of `process.env` through `getEnv()`

Rules:

- this is the only place allowed to read `process.env`
- every new env var must be added here first
- defaults should live here, not scattered across consumers

### `src/config/<domain>/*.config.ts`

Owns:

- mapping validated env into small domain objects
- semantic names for app consumption

Rules:

- keep each domain flat and small
- do not add framework-specific logic here beyond config mapping
- do not couple to concrete adapters prematurely

Current domain folders:

- `app`: runtime app settings, app environment resolution, package metadata
- `auth`: token lifetimes, magic link lifetime, and refresh cookie settings
- `cors`: exact browser origins and scoped Vercel preview origin settings
- `database`: database connection metadata without ORM coupling
- `docs`: OpenAPI/docs toggles and pathing
- `email`: transactional email provider, sender identity, trusted frontend
  origin, Resend credential, and SMTP connection settings
- `logger`: neutral logging settings and level normalization
- `observability`: neutral observability toggles and service identity

Do not add Resend-specific settings to the `auth` config domain. Auth owns magic
link lifetime and session behavior; email owns delivery.

### `src/config/configuration.module.ts`

Owns:

- global registration of `ConfigModule`
- loading all domain configs
- wiring custom validation

Current setup:

- `isGlobal: true`
- `cache: true`
- `expandVariables: true`
- `validate: validateEnv`

### `prisma.config.ts`

Owns:

- Prisma CLI configuration
- Prisma schema path
- Prisma migrations path
- loading `.env` with expansion support for CLI commands

Rules:

- application runtime must still consume database settings through `src/config`
- `prisma.config.ts` exists for Prisma CLI commands only
- do not duplicate application config parsing in Prisma adapters

### `src/app.module.ts`

Owns:

- root Nest module composition
- importing `ConfigurationModule`
- importing platform infrastructure modules such as logging and HTTP platform setup
- importing product feature modules as they are created

Rules:

- do not place detailed logger, Swagger, validation, or persistence setup here
- keep product modules under `src/modules/`, not under `src/infra/`
- keep platform infrastructure modules small and focused

### `src/bootstrap/bootstrap.ts`

Owns:

- bootstrap consumption of typed `app` config
- `host`, `port`, and optional `globalPrefix`
- orchestration of bootstrap helpers for platform concerns such as logger, docs, global prefix, and shutdown hooks

Rule:

- never read `process.env` here
- keep bootstrap orchestration here, not in `main.ts`
- keep detailed setup in focused helper files under `src/bootstrap/`

### `src/main.ts`

Owns:

- importing and invoking `bootstrap()`

Bootstrap organization rule:

- `main.ts` stays minimal
- bootstrap helpers live in `src/bootstrap/` once global platform concerns exist
- Nest modules are used only for concerns that participate in dependency injection

## Supported domains

### `app`

Purpose:

- bootstrap/runtime settings shared by the application itself

Current shape:

- `environment`
- `nodeEnv`
- `version`
- `host`
- `port`
- `globalPrefix`
- `isDevelopmentRuntime`
- `isTestRuntime`
- `isProductionRuntime`
- `isLocalEnvironment`
- `isTestEnvironment`
- `isStagingEnvironment`
- `isProductionEnvironment`

### `database`

Purpose:

- database connection metadata consumed by infrastructure adapters

Current shape:

- `url`
- `host`
- `port`
- `username`
- `password`
- `database`

Guideline:

- `PrismaService` consumes this domain for the PostgreSQL connection URL
- keep this domain free of Prisma-specific options unless they are truly cross-cutting
- ORM-specific behavior belongs in `src/infra/prisma`

### `auth`

Purpose:

- authentication and session runtime settings

Current shape:

- `accessTokenSecret`
- `accessTokenTtlSeconds`
- `google.clientId`
- `magicLinkTtlSeconds`
- `refreshTokenIdleTtlSeconds`
- `refreshTokenAbsoluteTtlSeconds`
- `refreshTokenCookie.name`
- `refreshTokenCookie.path`
- `refreshTokenCookie.sameSite`
- `refreshTokenCookie.secure`
- `refreshTokenCookie.httpOnly`

### `cors`

Purpose:

- allow credentialed browser requests only from approved frontend origins
- keep local, staging, and production origins explicit
- optionally accept ephemeral preview URLs owned by one Sandicts Vercel project
  and team in staging

Current shape:

- `allowedOrigins`
- `allowedHeaders`
- `allowedMethods`
- `credentials`
- `vercelPreview.projectSlug`
- `vercelPreview.teamSlug`

Rules:

- never combine credentialed CORS with a wildcard origin
- require HTTPS non-local exact origins in staging and production
- require `WEB_APP_BASE_URL` to be included in the deployed allowlist
- require Vercel project and team slugs together
- reject Vercel pull request origins in production
- keep the browser-origin callback in `src/bootstrap/setup-cors.ts`

### `email`

Purpose:

- select the transactional auth email adapter
- provide sender and reply-to identity
- provide the trusted frontend origin used by magic link URLs
- keep Resend and SMTP settings inside infrastructure configuration

Provider policy:

- `local` -> `smtp`
- `test` -> `development` by default, with explicit `smtp` allowed for E2E
- `staging` and `production` -> explicit `resend`

### `logger`

Purpose:

- neutral logging settings that any logger adapter can consume later

Current shape:

- `level`
- `pretty`

### `docs`

Purpose:

- OpenAPI/docs feature toggles and pathing

Current shape:

- `enabled`
- `path`

### `observability`

Purpose:

- neutral observability toggles and service identity

Current shape:

- `enabled`
- `serviceName`

Guideline:

- vendor-specific config belongs only when an actual observability stack is adopted

## Environment variables

Current env contract:

```env
NODE_ENV=development
APP_ENV=local
APP_VERSION=0.0.1
PORT=3000
APP_HOST=0.0.0.0
APP_GLOBAL_PREFIX=

CORS_ALLOWED_ORIGINS=http://localhost:3001
CORS_VERCEL_PREVIEW_PROJECT_SLUG=
CORS_VERCEL_PREVIEW_TEAM_SLUG=

POSTGRES_USER=postgres
POSTGRES_PASSWORD=sandicts
POSTGRES_DB=sandicts
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:sandicts@localhost:5432/sandicts

LOG_LEVEL=debug
LOG_PRETTY=true
DOCS_ENABLED=true
DOCS_PATH=docs
OBSERVABILITY_ENABLED=false
OBSERVABILITY_SERVICE_NAME=sandicts-api

AUTH_ACCESS_TOKEN_SECRET=dev-only-auth-secret-minimum-32-chars-change-me
AUTH_ACCESS_TOKEN_TTL_SECONDS=900
AUTH_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
AUTH_MAGIC_LINK_TTL_SECONDS=900
AUTH_REFRESH_TOKEN_IDLE_TTL_SECONDS=1209600
AUTH_REFRESH_TOKEN_ABSOLUTE_TTL_SECONDS=2592000
AUTH_REFRESH_TOKEN_COOKIE_NAME=sandicts_refresh_token
AUTH_REFRESH_TOKEN_COOKIE_PATH=/auth/refresh
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_SECURE=false

EMAIL_DELIVERY_PROVIDER=smtp
EMAIL_FROM_ADDRESS=auth@sandicts.test
EMAIL_FROM_NAME=Sandicts
EMAIL_REPLY_TO_ADDRESS=
WEB_APP_BASE_URL=http://localhost:3001

RESEND_API_KEY=

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
```

Notes:

- `expandVariables: true` allows composed values in `.env`
- `APP_ENV` separates local/staging/production intent from `NODE_ENV`
- `APP_VERSION` may be omitted and falls back to `package.json`
- `CORS_ALLOWED_ORIGINS` is a comma-separated list of exact HTTP(S) origins
- staging and production CORS origins require HTTPS
- Vercel preview project/team slugs are paired and allowed only outside
  production
- `DATABASE_URL` is validated as URL text
- booleans accept `true/false`, `1/0`, `yes/no`, `on/off`
- ports are coerced to integers and validated in range `1..65535`
- `AUTH_ACCESS_TOKEN_SECRET` is required in production and falls back only for
  local/test development
- `AUTH_GOOGLE_CLIENT_ID` is required in production and is used to validate
  Google Sign-In and Google One Tap ID token audiences
- auth lifetimes are positive integer seconds
- `AUTH_COOKIE_SECURE` defaults to `true` for staging/production `APP_ENV` and
  otherwise follows the explicit env value or local default
- `AUTH_COOKIE_SAME_SITE=none` requires `AUTH_COOKIE_SECURE=true`
- `EMAIL_DELIVERY_PROVIDER=resend` is required for staging/production Resend
  delivery
- local defaults use `EMAIL_DELIVERY_PROVIDER=smtp` with Mailpit on port `1025`
- unit tests default to the in-memory `development` adapter
- `RESEND_API_KEY` is required only when the selected provider is Resend
- SMTP username and password must be configured together
- `WEB_APP_BASE_URL` must be an HTTP(S) origin without credentials, path, query,
  or hash and must use HTTPS in staging/production

## Consumption pattern

Recommended pattern:

```ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { appConfig } from '../config';

@Injectable()
class ExampleService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appSettings: ConfigType<typeof appConfig>,
  ) {}

  getPort() {
    return this.appSettings.port;
  }
}

export { ExampleService };
```

Bootstrap pattern:

```ts
const { host, port, globalPrefix } = app.get<AppConfig>(appConfig.KEY);
```

Rules:

- prefer domain config access over `ConfigService.get('SOME_KEY')`
- use exported config types when reading a domain
- do not duplicate parsing or fallback logic in consumers

## What not to do

- do not read `process.env` outside `src/config`
- do not create one provider per env variable
- do not add a custom config service wrapper unless there is a real repeated need
- do not add Prisma-specific behavior to `database` config
- do not spread defaults across modules

## How to add a new env var

1. Add the variable to `src/config/env/env.schema.ts`
2. Choose the correct domain folder and expose it through that domain config file
3. Export the domain/type from `src/config/index.ts` if needed
4. Consume the typed domain in the module/service that needs it
5. Add or update tests if parsing, coercion, or required-ness changed
6. Update this document if the contract or usage rule changed

## Testing policy

Current coverage:

- unit tests for env parsing and validation in `src/config/env/env.schema.spec.ts`

Why this is enough for now:

- the critical risk is invalid env and wrong coercion
- domain config files are thin mappings over validated env
- Prisma client generation and application build validate the shared Prisma adapter wiring

Add more tests when:

- a domain starts deriving non-trivial values
- config begins driving conditional module wiring
- environment-specific behavior becomes more complex
- Prisma-specific runtime options are added beyond the database URL

## Extension guidance

When the project grows, keep this order:

1. add env var to schema
2. expose it in an existing domain if it still fits
3. create a new domain only when the config has a clear bounded context

Good reasons to add a new domain:

- auth
- cache
- queue
- mail

Bad reasons to add a new domain:

- a single one-off variable with no real grouping yet
- ORM-specific options that only one infrastructure adapter needs

## Invariants

These rules should continue to hold:

- `ConfigModule` stays global
- env validation happens at startup
- application runtime `process.env` access stays restricted to `src/config`
- config remains grouped by small domains
- `database` remains Prisma-option-neutral; Prisma-specific behavior belongs in `src/infra/prisma`
