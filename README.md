# Sandicts API Backend

Backend API for Sandicts, a marketplace and community platform for sand sports
such as footvolley, beach tennis, beach volleyball, and similar court-based
sports.

The backend is intended to support the operational core of the product:
organization onboarding, court availability, reservations, open matches,
tournaments, payment state, future Academy management, and a secure authentication
foundation for web first and mobile later.

## Table of Contents

- [Product Context](#product-context)
- [Current Status](#current-status)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [API Contracts](#api-contracts)
- [Current Endpoints](#current-endpoints)
- [Database And Prisma](#database-and-prisma)
- [Authentication And Sessions](#authentication-and-sessions)
- [Logging](#logging)
- [Error Handling](#error-handling)
- [Testing And Quality](#testing-and-quality)
- [CI/CD](#cicd)
- [Development Guidelines](#development-guidelines)
- [Internal Documentation](#internal-documentation)
- [README Maintenance](#readme-maintenance)
- [Troubleshooting](#troubleshooting)

## Product Context

Sandicts is a marketplace for sand sports.

Core user groups:

- `Player`: books courts, joins open matches, enters tournaments, and builds a
  sports profile over time.
- `Organization`: courts, venues, arenas, clubs, or organizers that manage
  availability, reservations, courts, events, and financial visibility.
- `Academy`: training, coaches, classes, students, and plans context.
- `Admin App`: internal Sandicts operator context, introduced only when real operational
  flows require manual review, support, moderation, or controlled status
  changes.

Main product areas:

- court and organization discovery
- court availability and reservations
- open match creation and joining
- tournament registration and operation
- basic payment state tracking
- future Academy management for students, memberships, classes, and coaches

The MVP bias is a useful marketplace core. Blockchain/Web3 rewards may be added
later, but booking, payment, tournament, and authentication flows must not
depend on blockchain in the first version unless product direction explicitly
changes.

## Current Status

The repository is currently in backend foundation stage.

Implemented:

- NestJS application bootstrap
- typed configuration with Zod validation
- PostgreSQL local setup with Docker Compose
- Prisma 7 setup with domain-grouped schema files
- generated Prisma Client under `src/generated/prisma`
- global HTTP platform module with Zod validation and response serialization
- global HTTP rate limiting with stricter magic link endpoint throttles
- Swagger/OpenAPI generated from Zod-backed DTOs
- global exception filter with normalized public error responses
- structured logging with request correlation
- authentication/session domain foundation
- public email magic link request and consume controllers
- Google Sign-In and Google One Tap backend authentication endpoint
- refresh token rotation endpoint
- sign-out and sign-out-all endpoints
- current auth session inspection endpoint
- unit and integration coverage for configuration, logging, error handling,
  refresh token hashing, access token issuing, session creation, and Google
  authentication
- a complete repository README and README maintenance workflow

Not implemented yet:

- reservation, organization, court, match, tournament, payment, and finance modules
- complete product API surface
- E2E test suite

Current public auth routes include magic link, Google authentication, refresh,
sign-out, sign-out-all, and current-session inspection.

## Tech Stack

Runtime and framework:

- Node.js 22
- npm
- NestJS 11
- TypeScript
- Express platform adapter through NestJS
- `@nestjs/throttler` for HTTP rate limiting

Data:

- PostgreSQL 16
- Prisma 7
- `@prisma/adapter-pg`
- `pg`

API contracts:

- Zod
- `nestjs-zod`
- `@nestjs/swagger`
- Swagger/OpenAPI 3.1

Observability and errors:

- `nestjs-pino`
- `pino`
- `pino-http`
- global Nest exception filter

Quality:

- Vitest
- ESLint
- Prettier
- TypeScript typecheck

Local infrastructure:

- Docker Compose
- Bitnami PostgreSQL 16 image

## Prerequisites

Install:

- Node.js 22
- npm
- Docker and Docker Compose

Recommended checks:

```bash
node --version
npm --version
docker --version
docker compose version
```

CI uses Node.js 22, so local development should use the same major version.

## Quick Start

### 1. Install Dependencies

```bash
npm ci
```

### 2. Create `.env`

Create a local `.env` file in the repository root:

```env
NODE_ENV=development
APP_ENV=local
APP_VERSION=0.0.1
PORT=3000
APP_HOST=0.0.0.0
APP_GLOBAL_PREFIX=

POSTGRES_USER=postgres
POSTGRES_PASSWORD=sandicts
POSTGRES_DB=sandicts
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

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

- `.env` is ignored by Git.
- Do not commit real secrets.
- `dotenv-expand` is enabled, so `DATABASE_URL` can reference the PostgreSQL
  variables shown above.
- In production, `AUTH_ACCESS_TOKEN_SECRET` is required and must be a real
  secret with at least 32 characters.
- In production, `AUTH_GOOGLE_CLIENT_ID` is required and must be the Google web
  OAuth client ID used by Google Sign-In and Google One Tap.

### 3. Start PostgreSQL And Mailpit

```bash
docker compose up -d postgres mailpit
```

The local PostgreSQL service uses:

- image: `bitnami/postgresql:16`
- container: `sandicts-postgres`
- volume: `sandicts-postgres-data`
- healthcheck: `pg_isready`

Mailpit captures local email without delivering it to a real inbox:

- SMTP: `localhost:1025`
- web UI: `http://localhost:8025`

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Apply Local Migrations

```bash
npm run prisma:migrate:dev
```

### 6. Start The API

```bash
npm run start:dev
```

Default local URLs:

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`

If `APP_GLOBAL_PREFIX` is set, API routes use that prefix.

### 7. Smoke Test The API

```bash
curl -X POST "http://localhost:3000/auth/magic-link/request" \
  -H "Content-Type: application/json" \
  -d '{"email":"player@example.com"}'
```

Expected response:

```json
{
  "status": "accepted"
}
```

The endpoint returns `202 Accepted`. Inspect the captured email at
`http://localhost:8025`.

## Environment Variables

All runtime environment variables are validated in
`src/config/env/env.schema.ts` at startup.

Rules:

- Application runtime code should not read `process.env` outside `src/config`.
- New variables must be added to `src/config/env/env.schema.ts` first.
- Defaults should live in the env schema or typed config domains, not scattered
  across consumers.
- Boolean values accept `true/false`, `1/0`, `yes/no`, and `on/off`.
- Ports are coerced to integers and validated in the `1..65535` range.

### Application

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | Runtime mode: `development`, `test`, or `production`. |
| `APP_ENV` | No | derived from `NODE_ENV` | Product environment: `local`, `test`, `staging`, or `production`. |
| `APP_VERSION` | No | `package.json` version | Application version used in config/log metadata. |
| `PORT` | No | `3000` | HTTP port. |
| `APP_HOST` | No | `0.0.0.0` | Host passed to `app.listen`. |
| `APP_GLOBAL_PREFIX` | No | empty string | Optional global route prefix. |

`APP_ENV` fallback behavior:

- `NODE_ENV=development` -> `APP_ENV=local`
- `NODE_ENV=test` -> `APP_ENV=test`
- `NODE_ENV=production` -> `APP_ENV=production`

### Database

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | - | PostgreSQL URL used by Prisma runtime and Prisma CLI. |
| `POSTGRES_HOST` | Yes | - | PostgreSQL host. |
| `POSTGRES_PORT` | No | `5432` | PostgreSQL port. |
| `POSTGRES_USER` | Yes | - | PostgreSQL user. |
| `POSTGRES_PASSWORD` | Yes | - | PostgreSQL password. |
| `POSTGRES_DB` | Yes | - | PostgreSQL database name. |

### Logging And Docs

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `LOG_LEVEL` | No | by `APP_ENV` | Pino log level. Also accepts Nest aliases `log` and `verbose`. |
| `LOG_PRETTY` | No | `true` for `local`, otherwise `false` | Enables pretty logs. |
| `DOCS_ENABLED` | No | `true` | Enables Swagger UI. |
| `DOCS_PATH` | No | `docs` | Swagger UI path. |

Default log levels:

- `local`: `debug`
- `test`: `warn`
- `staging`: `info`
- `production`: `info`

### Observability

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `OBSERVABILITY_ENABLED` | No | `false` | Reserved switch for future observability integrations. |
| `OBSERVABILITY_SERVICE_NAME` | No | package name | Service name included in operational metadata. |

### Authentication

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `AUTH_ACCESS_TOKEN_SECRET` | Required in production | local development fallback | HMAC secret used to sign access tokens. Must be at least 32 characters when provided. |
| `AUTH_ACCESS_TOKEN_TTL_SECONDS` | No | `900` | Access token lifetime. |
| `AUTH_GOOGLE_CLIENT_ID` | Required in production | none | Google web OAuth client ID used to validate Google Sign-In and One Tap ID tokens. |
| `AUTH_MAGIC_LINK_TTL_SECONDS` | No | `900` | Magic link token lifetime. |
| `AUTH_REFRESH_TOKEN_IDLE_TTL_SECONDS` | No | `1209600` | Refresh token idle lifetime, 14 days by default. |
| `AUTH_REFRESH_TOKEN_ABSOLUTE_TTL_SECONDS` | No | `2592000` | Refresh token absolute lifetime, 30 days by default. |
| `AUTH_REFRESH_TOKEN_COOKIE_NAME` | No | `sandicts_refresh_token` | Refresh token cookie name. |
| `AUTH_REFRESH_TOKEN_COOKIE_PATH` | No | `/auth/refresh` | Refresh token cookie path. |
| `AUTH_COOKIE_SAME_SITE` | No | `lax` | Cookie SameSite policy: `lax`, `strict`, or `none`. |
| `AUTH_COOKIE_SECURE` | No | `true` when `NODE_ENV=production` | Cookie `Secure` attribute. |

### Transactional Email

Resend is the staging/production provider and SMTP/Mailpit is the local/E2E
delivery path. Both adapters are selected behind `EMAIL_GATEWAY`.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `EMAIL_DELIVERY_PROVIDER` | Staging/production | Environment-specific | `smtp` locally, `development` in unit tests, and `resend` in staging/production. |
| `EMAIL_FROM_ADDRESS` | Staging/production | `auth@sandicts.test` locally | Sender address used for auth emails. |
| `EMAIL_FROM_NAME` | No | `Sandicts` | Human-readable sender name. |
| `EMAIL_REPLY_TO_ADDRESS` | No | none | Optional reply-to address. |
| `WEB_APP_BASE_URL` | Staging/production | `http://localhost:3001` locally | Trusted frontend origin used to build `/sign-in/magic-link`. |
| `RESEND_API_KEY` | When provider is Resend | none | Resend API credential. |
| `SMTP_HOST` | SMTP outside local defaults | `localhost` | SMTP host, usually Mailpit locally. |
| `SMTP_PORT` | No | `1025` | SMTP port. |
| `SMTP_SECURE` | No | `false` | Whether SMTP uses immediate TLS. |
| `SMTP_USER` | No | none | SMTP username; must be paired with `SMTP_PASSWORD`. |
| `SMTP_PASSWORD` | No | none | SMTP password; must be paired with `SMTP_USER`. |

`WEB_APP_BASE_URL` must be an origin without path, query, hash, or credentials
and must use HTTPS in staging/production. Raw magic link tokens and provider
payloads must not be logged.

## Scripts

| Script | Description |
| --- | --- |
| `npm run start` | Generates Prisma Client and starts Nest. |
| `npm run start:dev` | Generates Prisma Client and starts Nest in watch mode. |
| `npm run start:debug` | Starts Nest in debug watch mode. |
| `npm run start:prod` | Runs `node dist/main.js`. |
| `npm run build` | Generates Prisma Client and compiles the app. |
| `npm run format` | Runs Prettier on TypeScript source and test files. |
| `npm run lint` | Generates Prisma Client and runs ESLint with `--fix`. |
| `npm run lint:ci` | Generates Prisma Client and runs ESLint without writing fixes. |
| `npm run typecheck` | Generates Prisma Client and runs `tsc --noEmit`. |
| `npm run test` | Generates Prisma Client and runs Vitest once. |
| `npm run test:ci` | Generates Prisma Client and runs Vitest with `--passWithNoTests`. |
| `npm run test:watch` | Runs Vitest in watch mode. |
| `npm run test:cov` | Runs Vitest with coverage. |
| `npm run test:debug` | Runs Vitest with Node inspector enabled. |
| `npm run test:e2e` | Placeholder. E2E tests are not configured yet. |
| `npm run prisma:generate` | Generates Prisma Client. |
| `npm run prisma:migrate:dev` | Creates/applies development migrations. |
| `npm run prisma:migrate:deploy` | Applies migrations in deploy environments. |
| `npm run prisma:studio` | Opens Prisma Studio. |

## Project Structure

```txt
.
  .codex/
    skills/
  .github/
    workflows/
  docs/
    ai/
    frontend/
  prisma/
    migrations/
    models/
    schema.prisma
  src/
    bootstrap/
    config/
    generated/
    infra/
    modules/
    shared/
```

Main responsibilities:

| Path | Responsibility |
| --- | --- |
| `.codex/skills` | Repository-owned Codex instructions for this project. |
| `.github/workflows` | CI/CD workflows. |
| `docs/ai` | Durable project context and source-of-truth technical/product docs. |
| `docs/frontend` | Pointer to frontend docs now owned by `sandicts/reactjs-sandicts-web`. |
| `prisma/schema.prisma` | Main Prisma generator and datasource configuration. |
| `prisma/models` | Domain-grouped Prisma models. |
| `prisma/migrations` | Database migrations. |
| `src/bootstrap` | Nest application creation and platform setup helpers. |
| `src/config` | Env validation and typed config domains. |
| `src/generated` | Generated code such as Prisma Client. Not committed. |
| `src/infra` | Shared infrastructure modules such as HTTP platform, logging, and Prisma. |
| `src/modules` | Product feature modules. |
| `src/shared` | Framework-neutral shared primitives. |

## Architecture

The backend follows a practical Clean Architecture style inside a NestJS
modular monolith.

Default request flow:

```txt
HTTP request
  -> Controller
  -> Zod DTO validation
  -> UseCase.execute()
  -> Repository or Gateway port
  -> Infrastructure adapter
  -> Use case result
  -> Zod response validation
  -> HTTP response
```

Dependency direction:

```txt
presentation/http
  -> application/use-cases
    -> application/ports
    -> domain

infrastructure
  -> application/ports
  -> domain
```

Layer rules:

- Controllers own HTTP routes, route metadata, and request/response DTOs.
- Controllers call the intended use case.
- Use cases own the application workflow and domain rule checks.
- Use cases depend on repository/gateway ports, not concrete adapters.
- Repositories own persistence queries and database mapping.
- Infrastructure adapters implement ports.
- Domain and application code do not import Nest HTTP classes.
- Controllers do not call Prisma, payment SDKs, calendar SDKs, or provider SDKs
  directly.
- `src/infra` is for shared platform infrastructure only.
- Feature-specific adapters stay inside the owning feature module.

Default decision when adding a backend capability:

```txt
feature module
  -> thin controller
  -> Zod contract
  -> semantic use case
  -> port
  -> Prisma or provider adapter
```

Avoid:

- Prisma calls in controllers
- `HttpException` in domain or application code
- one global `controllers/` folder and one global `repositories/` folder
- generic base repositories before repeated behavior proves useful
- CQRS, event sourcing, or message brokers by default
- microservice splits before there is real product, scaling, ownership, or
  deployment pressure

## API Contracts

HTTP contracts use one source of truth:

- Zod schema defines request and response shape.
- `createZodDto()` bridges the schema into Nest controller signatures.
- Global `ZodValidationPipe` validates `params`, `query`, and `body`.
- `@ZodResponse()` validates outgoing responses and feeds Swagger docs.
- Swagger/OpenAPI is generated from the same Zod-backed DTOs.

Global HTTP setup lives in:

- `src/infra/http/http-platform.module.ts`
- `src/bootstrap/setup-docs.ts`

Current global HTTP providers:

- `APP_PIPE` using `createZodValidationPipe({ strictSchemaDeclaration: true })`
- `APP_GUARD` using `ThrottlerGuard`
- `APP_INTERCEPTOR` using `ZodSerializerInterceptor`
- `APP_FILTER` using `GlobalExceptionFilter`

Endpoint rules:

- Create one Zod schema for each external input source that exists.
- Wrap schemas with `createZodDto()`.
- Use DTOs in `@Param()`, `@Query()`, and `@Body()`.
- Define a response schema and DTO.
- Annotate successful responses with `@ZodResponse(...)`.
- Use `.meta({ id: 'StableSchemaName' })` for stable OpenAPI schema names.
- Do not duplicate contracts with class-validator DTOs.

Example pattern:

```ts
const CreateThingSchema = z
  .object({
    name: z.string().min(2),
  })
  .meta({ id: 'CreateThing' });

class CreateThingDto extends createZodDto(CreateThingSchema) {}

export { CreateThingDto, CreateThingSchema };
```

## Current Endpoints

### `POST /auth/magic-link/request`

Accepts a one-time email magic link request without revealing whether an account
exists. Operational failures still return semantic error statuses.

```bash
curl -X POST "http://localhost:3000/auth/magic-link/request" \
  -H "Content-Type: application/json" \
  -d '{"email":"player@example.com"}'
```

Request contract:

| Source | Field | Rules |
| --- | --- | --- |
| body | `email` | string, trimmed, lowercased, valid email |

Response contract:

```json
{
  "status": "accepted"
}
```

Status contract:

| Status | Code | Meaning |
| --- | --- | --- |
| `202` | success | Request accepted for delivery. |
| `400` | `validation_error` | Request body is invalid. |
| `429` | `rate_limited` | Request rate limit exceeded. |
| `503` | `email_delivery_unavailable` | Configured email delivery is temporarily unavailable. |
| `500` | `internal_error` | Unexpected internal failure. |

### `POST /auth/magic-link/consume`

Consumes a valid one-time magic link token, creates the internal auth session,
sets the refresh token cookie, and returns account/session access data.

```bash
curl -X POST "http://localhost:3000/auth/magic-link/consume" \
  -H "Content-Type: application/json" \
  -d '{"token":"magic-link-token-from-email"}'
```

Request contract:

| Source | Field | Rules |
| --- | --- | --- |
| body | `token` | string, trimmed, min 32, max 256 |

Response contract:

```json
{
  "account": {
    "id": "account-id",
    "email": "player@example.com",
    "displayName": null
  },
  "session": {
    "id": "session-id"
  },
  "accessToken": "access.token.signature",
  "accessTokenExpiresAt": "2026-01-01T00:15:00.000Z"
}
```

Status contract:

| Status | Code | Meaning |
| --- | --- | --- |
| `200` | success | Internal auth session created. |
| `400` | `validation_error` | Request body is invalid. |
| `401` | `invalid_magic_link_token` | Token does not identify a challenge. |
| `403` | `account_auth_forbidden` | Account cannot authenticate. |
| `409` | `magic_link_already_used` | Token was already consumed. |
| `409` | `magic_link_superseded` | A newer request replaced this link. |
| `410` | `magic_link_expired` | Token lifetime ended. |
| `429` | `rate_limited` | Consume rate limit exceeded. |
| `500` | `internal_error` | Unexpected internal failure. |

### `POST /auth/google/sign-in`

Validates a Google Sign-In or Google One Tap ID token, resolves or creates the
Sandicts account, stores Google `sub` as the external provider subject, creates
the internal auth session, sets the refresh token cookie, and returns
account/session access data.

```bash
curl -X POST "http://localhost:3000/auth/google/sign-in" \
  -H "Content-Type: application/json" \
  -d '{"credential":"google-identity-services-credential"}'
```

Request contract:

| Source | Field | Rules |
| --- | --- | --- |
| body | `credential` | optional string, trimmed, min 10, max 4096; Google Identity Services credential/ID token |
| body | `idToken` | optional string, trimmed, min 10, max 4096; accepted alias for ID token clients |

At least one of `credential` or `idToken` is required. If both are provided,
`credential` is used.

Response contract:

```json
{
  "account": {
    "id": "account-id",
    "email": "player@example.com",
    "displayName": "Player Name"
  },
  "session": {
    "id": "session-id"
  },
  "accessToken": "access.token.signature",
  "accessTokenExpiresAt": "2026-01-01T00:15:00.000Z"
}
```

Security behavior:

- The backend validates the Google token server-side with `AUTH_GOOGLE_CLIENT_ID`.
- Invalid tokens and unverified Google emails return `401 invalid_google_credential`.
- Blocked or disabled accounts return `403 account_auth_forbidden`.
- Google `sub` is the provider identity key; Google email is never used as the
  provider identity key.
- Google Calendar scopes are not part of sign-in.

### `POST /auth/refresh`

Rotates the backend-owned refresh token cookie and returns a new access token
with the same public account/session shape used by Google sign-in and magic link
consume.

```bash
curl -X POST "http://localhost:3000/auth/refresh" \
  -H "Cookie: sandicts_refresh_token=opaque-refresh-token"
```

Request contract:

| Source | Field | Rules |
| --- | --- | --- |
| cookie | `sandicts_refresh_token` | opaque refresh token set by the backend |

Response contract:

```json
{
  "account": {
    "id": "account-id",
    "email": "player@example.com",
    "displayName": "Player Name"
  },
  "session": {
    "id": "session-id"
  },
  "accessToken": "new.access.token",
  "accessTokenExpiresAt": "2026-01-01T00:15:00.000Z"
}
```

Security behavior:

- The raw refresh token is never returned in the response body.
- The previous refresh token is marked rotated and replaced on every successful
  refresh.
- Reusing a rotated token revokes the token family and returns
  `401 refresh_token_reused`.
- Invalid, expired, revoked, or inactive refresh state returns a specific safe
  `401` auth code such as `invalid_refresh_token`,
  `refresh_token_expired`, `refresh_token_revoked`, or
  `auth_session_inactive`.

### `POST /auth/sign-out`

Revokes the current auth session identified by the Bearer access token and
clears the refresh token cookie for the current browser.

```bash
curl -X POST "http://localhost:3000/auth/sign-out" \
  -H "Authorization: Bearer access.token.signature"
```

Request contract:

| Source | Field | Rules |
| --- | --- | --- |
| header | `Authorization` | `Bearer <accessToken>` |

Response contract:

```txt
204 No Content
```

Invalid or missing Bearer access tokens return `401 invalid_access_token`.

### `POST /auth/sign-out-all`

Revokes all active auth sessions for the authenticated account and clears the
refresh token cookie for the current browser.

```bash
curl -X POST "http://localhost:3000/auth/sign-out-all" \
  -H "Authorization: Bearer access.token.signature"
```

Request contract:

| Source | Field | Rules |
| --- | --- | --- |
| header | `Authorization` | `Bearer <accessToken>` |

Response contract:

```txt
204 No Content
```

Invalid or missing Bearer access tokens return `401 invalid_access_token`.

### `GET /auth/me`

Returns the current authenticated account and active auth session for frontend
session hydration. This endpoint does not issue or rotate tokens.

```bash
curl "http://localhost:3000/auth/me" \
  -H "Authorization: Bearer access.token.signature"
```

Request contract:

| Source | Field | Rules |
| --- | --- | --- |
| header | `Authorization` | `Bearer <accessToken>` |

Response contract:

```json
{
  "account": {
    "id": "account-id",
    "email": "player@example.com",
    "displayName": "Player Name"
  },
  "session": {
    "id": "session-id"
  }
}
```

Security behavior:

- The response never includes a refresh token or a new access token.
- Invalid or expired access tokens return `401 invalid_access_token`.
- Valid access tokens for inactive sessions return `401 auth_session_inactive`.
- Blocked or disabled accounts return `403 account_auth_forbidden`.

## Database And Prisma

The project uses PostgreSQL and Prisma 7.

Key files:

| File | Purpose |
| --- | --- |
| `prisma/schema.prisma` | Prisma generator and datasource blocks. |
| `prisma/models/auth.prisma` | Authentication-related Prisma models. |
| `prisma/migrations` | SQL migration history. |
| `prisma.config.ts` | Prisma CLI config, schema path, migration path, and `.env` loading. |
| `src/infra/prisma/prisma.module.ts` | Shared Nest Prisma module. |
| `src/infra/prisma/prisma.service.ts` | Prisma Client lifecycle and PostgreSQL adapter wiring. |

Prisma Client output:

```txt
src/generated/prisma
```

`src/generated/` is ignored by Git. Regenerate it with:

```bash
npm run prisma:generate
```

Current models:

- `Account`
- `ExternalIdentity`
- `AuthSession`
- `AuthRefreshToken`
- `MagicLinkChallenge`

Current enums:

- `AuthProvider`
- `AccountStatus`
- `AuthSessionStatus`
- `AuthSessionCreationSource`

Prisma workflow:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:studio
```

Deployment migration command:

```bash
npm run prisma:migrate:deploy
```

Modeling rules:

- Keep `prisma/schema.prisma` focused on generator and datasource.
- Group domain models under `prisma/models/*.prisma`.
- Keep Prisma repository implementations inside the owning product module.
- Keep the shared Prisma lifecycle in `src/infra/prisma`.
- Do not put product business workflow decisions in repositories.

## Authentication And Sessions

The `auth` module currently contains the internal session foundation.

Current files include:

- `src/modules/auth/auth.module.ts`
- `src/modules/auth/domain/*`
- `src/modules/auth/application/use-cases/<action>/*`
- `src/modules/auth/application/services/tokens/*`
- `src/modules/auth/application/ports/*`
- `src/modules/auth/infrastructure/persistence/prisma/*`
- `src/modules/auth/infrastructure/persistence/in-memory/*`
- `src/modules/auth/presentation/http/<action>/*`
- `src/modules/auth/presentation/http/shared/*`

Current capabilities:

- account lookup through repository ports
- Prisma repositories for accounts and auth sessions
- in-memory repositories for tests
- internal auth session creation
- opaque refresh token generation
- refresh token hashing
- access token issuing
- public magic link request and consume endpoints
- Google sign-in endpoint
- refresh token rotation endpoint
- current-session and sign-out endpoints
- refresh token cookie option helpers
- IP-based HTTP rate limiting through `@nestjs/throttler`
- Resend and SMTP email adapters selected through typed configuration
- Mailpit capture in the local Docker Compose stack
- semantic magic link success and failure contracts in Swagger/OpenAPI

MVP authentication direction:

- email magic link
- Google sign-in
- one internal session system for every sign-in method
- short-lived access token
- opaque refresh token stored only as a hash in the database
- refresh token sent to browsers as `HttpOnly` cookie
- refresh token rotation on every refresh
- revocation by session, account, and token family

Magic link delivery direction:

- Resend is the chosen MVP provider for staging/production transactional auth
  email
- Mailpit SMTP capture is the implemented local/E2E delivery path
- `EMAIL_GATEWAY` remains the application boundary so Resend can be replaced in
  a future migration
- provider payloads, API keys, internal errors, and raw magic link tokens must
  not leak through controllers, public responses, or logs

Current HTTP endpoints:

```txt
POST /auth/magic-link/request
POST /auth/magic-link/consume
POST /auth/google/sign-in
POST /auth/refresh
POST /auth/sign-out
POST /auth/sign-out-all
GET  /auth/me
```

The source-of-truth design is
`docs/ai/architecture/authentication-session-pattern.md`.
The source-of-truth provider decision is
`docs/ai/architecture/transactional-email-provider-decision.md`.

Security rules:

- Do not log raw passwords, refresh tokens, magic link tokens, Google ID tokens,
  or authorization codes.
- Do not store refresh tokens in localStorage.
- Do not add password login, SMS login, passkeys, MFA, Facebook login, or Apple
  login for the passwordless web MVP unless product direction changes.
- If cookies become cross-site with `SameSite=None`, revisit CSRF protection
  before public launch.
- Frontend integration still needs an explicit CORS/credentials follow-up so
  the browser can send backend-owned refresh cookies safely between the local
  web app and API origins.
- Move rate-limit storage to a distributed backend and add normalized-email
  tracking before running multiple API instances in production.

## Logging

The backend uses `nestjs-pino` as the single logging stack.

Key files:

- `src/infra/logging/logging.module.ts`
- `src/infra/logging/pino-logger.factory.ts`
- `src/bootstrap/setup-logger.ts`

Current behavior:

- structured logs by default
- pretty logs for local development by default
- one request completion log per request through `pino-http`
- canonical `requestId`
- accepts incoming `x-request-id`
- accepts incoming `x-correlation-id`
- mirrors the selected id in `X-Request-Id` and `X-Correlation-Id`
- includes `service`, `env`, and `version` metadata
- includes `traceId` and `spanId` when a valid W3C `traceparent` header exists
- redacts common sensitive paths
- does not log request bodies by default

Logging rules:

- Use structured fields over interpolated message-only logs.
- Do not add a second HTTP logging interceptor.
- Do not mix in another logger stack such as Winston.
- Use Nest `Logger` from `@nestjs/common` in application classes unless native
  Pino behavior is specifically needed.
- Avoid logging secrets even when redaction exists.

## Error Handling

The backend uses one global exception filter:

```txt
src/infra/http/filters/global-exception.filter.ts
```

Public error response shape:

```json
{
  "statusCode": 422,
  "code": "business_rule_violation",
  "message": "Cannot reserve unavailable slot",
  "path": "/reservations",
  "timestamp": "2026-04-19T18:30:00.000Z",
  "requestId": "req-123"
}
```

Validation errors may include public `issues`:

```json
{
  "statusCode": 400,
  "code": "validation_error",
  "message": "Validation failed",
  "path": "/orders",
  "timestamp": "2026-04-19T18:30:00.000Z",
  "requestId": "req-123",
  "issues": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

Normalized error codes:

- `bad_request`
- `validation_error`
- `rate_limited`
- `unauthorized`
- `invalid_google_credential`
- `invalid_magic_link_token`
- `magic_link_expired`
- `magic_link_already_used`
- `magic_link_superseded`
- `email_delivery_unavailable`
- `invalid_access_token`
- `invalid_refresh_token`
- `refresh_token_expired`
- `refresh_token_reused`
- `refresh_token_revoked`
- `auth_session_inactive`
- `forbidden`
- `account_auth_forbidden`
- `external_identity_conflict`
- `resource_not_found`
- `conflict`
- `business_rule_violation`
- `internal_error`

Mapping highlights:

- `ZodValidationException` -> `400 validation_error`
- `ZodSerializationException` -> `500 internal_error`
- `ZodSchemaDeclarationException` -> `500 internal_error`
- throttled HTTP requests -> `429 rate_limited`
- `AppError('unauthorized')` -> `401`
- `AppError('invalid_google_credential')` -> `401`
- `AppError('invalid_magic_link_token')` -> `401`
- `AppError('magic_link_expired')` -> `410`
- `AppError('magic_link_already_used')` -> `409`
- `AppError('magic_link_superseded')` -> `409`
- `AppError('email_delivery_unavailable')` -> `503`
- `AppError('invalid_access_token')` -> `401`
- `AppError('invalid_refresh_token')` -> `401`
- `AppError('refresh_token_expired')` -> `401`
- `AppError('refresh_token_reused')` -> `401`
- `AppError('refresh_token_revoked')` -> `401`
- `AppError('auth_session_inactive')` -> `401`
- `AppError('forbidden')` -> `403`
- `AppError('account_auth_forbidden')` -> `403`
- `AppError('resource_not_found')` -> `404`
- `AppError('conflict')` -> `409`
- `AppError('external_identity_conflict')` -> `409`
- `AppError('business_rule_violation')` -> `422`

Rules:

- Use `AppError` for expected application/domain failures.
- Do not throw `HttpException` from domain or application code.
- Do not expose stack traces, raw causes, provider details, or internal
  `details` in public responses.
- The global exception filter should not become a second full logging pipeline.

## Testing And Quality

Recommended local verification before opening a PR:

```bash
npm run lint:ci
npm run typecheck
npm run test:ci
npm run build
```

Current test coverage includes:

- environment parsing and validation
- app and logger config derivation
- Pino logger factory
- Pino HTTP integration behavior
- global exception filter behavior
- refresh token hashing
- access token issuing
- auth session creation use case

Testing policy:

- Keep tests focused for narrow changes.
- Broaden coverage when touching shared behavior, cross-module contracts, or
  user-facing workflows.
- Add or update tests when changing env parsing, config defaults, error
  behavior, auth/session lifetimes, repository behavior, or HTTP contracts.

E2E tests are not configured yet. `npm run test:e2e` currently prints a
placeholder message.

## CI/CD

Main workflow:

```txt
.github/workflows/ci-pr.yml
```

The workflow runs on pull requests targeting:

- `developer`
- `staging`
- `master`

Jobs:

| Job | Purpose |
| --- | --- |
| `governance` | Validates source branch naming and allowed target branch. |
| `quality` | Runs `npm run lint:ci` and `npm run typecheck`. |
| `test` | Runs `npm run test:ci`. |
| `build` | Runs `npm run build`. |
| `security` | Runs `npm audit --audit-level=moderate`. |

Allowed temporary branch pattern:

```txt
(feature|fix|hotfix|docs|refactor|test|ci|chore|rc|codex)/KAN-123-short-description
```

Use `codex/KAN-123-short-description` only for AI-agent-created branches.

Protected branch names allowed as PR sources:

```txt
developer
staging
master
```

Allowed PR targets:

```txt
developer
staging
master
```

CI uses:

- Ubuntu latest runners
- Node.js 22
- npm cache
- `npm ci`

## Development Guidelines

### Add A New Endpoint

1. Read `docs/ai/architecture/controller-pattern.md`.
2. Read `docs/ai/api/zod-swagger-foundation.md`.
3. Define Zod schemas for params, query, body, and response as needed.
4. Wrap schemas with `createZodDto()`.
5. Add `@ZodResponse(...)` to the route.
6. Keep controller logic thin.
7. Call a semantic use case.
8. Use `AppError` for expected application/domain failures.
9. Add or update tests for validation, use case behavior, and error mapping as
   appropriate.
10. Update `README.md` if the route is public or explicitly documented here.

### Add A New Feature Module

1. Read `sandicts/sandicts-docs:docs/product/sandicts-product-context.md`.
2. Read `sandicts/sandicts-docs:docs/business-rules/sandicts-business-rules.md`.
3. Read `docs/ai/architecture/backend-architecture-overview.md`.
4. Read `docs/ai/architecture/module-pattern.md`.
5. Create the module under `src/modules/<feature>`.
6. Keep HTTP, application, domain, and infrastructure responsibilities
   separated.
7. Keep feature-specific repositories/adapters inside the owning module.
8. Add the module to `src/app.module.ts` only when it is real and needed.
9. Update `README.md` if the module changes documented project capabilities,
   structure, scripts, setup, or public API.

### Add A New Environment Variable

1. Add it to `src/config/env/env.schema.ts`.
2. Add it to the correct typed config domain under `src/config/<domain>`.
3. Export config types from `src/config/index.ts` when needed.
4. Consume the typed config domain through Nest injection.
5. Add or update tests for parsing, defaults, coercion, and required-ness.
6. Update this README if the variable is part of local setup or operational
   configuration.
7. Update `docs/ai/config/configuration-foundation.md` if the config contract or
   rule changes.

### Add Or Change Prisma Models

1. Keep generator and datasource in `prisma/schema.prisma`.
2. Add domain models under `prisma/models/*.prisma`.
3. Generate a migration with `npm run prisma:migrate:dev`.
4. Regenerate Prisma Client with `npm run prisma:generate`.
5. Keep Prisma access inside repositories/adapters.
6. Update tests around affected repositories/use cases.
7. Update this README if documented models, setup, or database workflow changes.

### Change Business Rules

1. Read `sandicts/sandicts-docs:docs/business-rules/sandicts-business-rules.md`.
2. Read the relevant product or architecture docs linked from `docs/ai/index.md`.
3. Implement the backend behavior.
4. Use `business_rule_violation` for valid requests that break domain policy.
5. Update the relevant `docs/ai/` source-of-truth document in the same PR.
6. Update this README if the changed rule is explicitly described here.

## Internal Documentation

Project documentation for architecture, product rules, backend conventions, and
AI/Codex operation lives under `docs/ai`.

Start here:

- `docs/ai/index.md`

Common reading paths:

| Task | Read |
| --- | --- |
| New feature module | `product/sandicts-product-context.md`, `business/sandicts-business-rules.md`, `architecture/backend-architecture-overview.md`, `architecture/module-pattern.md` |
| New endpoint | `architecture/controller-pattern.md`, `api/zod-swagger-foundation.md`, `architecture/use-case-pattern.md`, `api/error-handling-foundation.md` |
| Authentication work | `architecture/authentication-session-pattern.md`, `architecture/transactional-email-provider-decision.md` for magic link email delivery, `architecture/controller-pattern.md`, `architecture/use-case-pattern.md`, `api/error-handling-foundation.md` |
| Persistence/provider work | `architecture/repository-pattern.md`, `architecture/external-integrations-pattern.md`, `logging/logging-foundation.md` |
| Config changes | `config/configuration-foundation.md`, `config/typescript-module-resolution.md` |
| Logging changes | `logging/logging-foundation.md` |
| CI/CD changes | `ci-cd/ci-governance.md`, `ci-cd/ci-operational-rules.md` |
| Codex/project instructions | `codex-skills-strategy.md`, `.codex/skills/sandicts-project-context/SKILL.md` |

Current source-of-truth docs:

- `docs/ai/api/error-handling-foundation.md`
- `docs/ai/api/zod-swagger-foundation.md`
- `docs/ai/architecture/authentication-session-pattern.md`
- `docs/ai/architecture/backend-architecture-overview.md`
- `docs/ai/architecture/controller-pattern.md`
- `docs/ai/architecture/external-integrations-pattern.md`
- `docs/ai/architecture/module-pattern.md`
- `docs/ai/architecture/repository-pattern.md`
- `docs/ai/architecture/transactional-email-provider-decision.md`
- `docs/ai/architecture/use-case-pattern.md`
- `sandicts/sandicts-docs:docs/business-rules/sandicts-business-rules.md`
- `docs/ai/config/configuration-foundation.md`
- `docs/ai/config/typescript-module-resolution.md`
- `docs/ai/ci-cd/ci-governance.md`
- `docs/ai/ci-cd/ci-operational-rules.md`
- `docs/ai/codex-skills-strategy.md`
- `docs/ai/logging/logging-foundation.md`
- `sandicts/sandicts-docs:docs/product/sandicts-product-context.md`

Repository-owned Codex skills live under `.codex/skills`:

- `sandicts-project-context`
- `sandicts-business-rules`
- `jira-pr-commit-writer`

## README Maintenance

Keep this README aligned with the backend.

Whenever a change alters something explicitly described in this README, update
the README in the same PR.

This includes:

- product/backend status
- setup steps
- prerequisites
- Docker Compose behavior
- scripts and commands
- environment variables
- public routes and API contracts
- architecture and folder organization
- Prisma schema, migrations, models, or database workflow
- authentication, sessions, tokens, and cookies
- logging, error handling, observability, and CI/CD behavior
- links to `docs/ai` or repository-owned Codex skills

If a relevant change does not require a README update, say why in the PR
description.

The same rule is documented for Codex in:

```txt
.codex/skills/sandicts-project-context/SKILL.md
```

## Troubleshooting

### `Invalid environment variables`

The application failed env validation.

Check:

- required variables in `.env`
- URL format for `DATABASE_URL`
- boolean values such as `DOCS_ENABLED`, `LOG_PRETTY`, and
  `AUTH_COOKIE_SECURE`
- port values for `PORT` and `POSTGRES_PORT`
- `AUTH_ACCESS_TOKEN_SECRET` in production

Reference:

```txt
src/config/env/env.schema.ts
```

### Prisma Client Cannot Be Found

Regenerate it:

```bash
npm run prisma:generate
```

Generated files should appear under:

```txt
src/generated/prisma
```

### PostgreSQL Refuses Connections

Check container status:

```bash
docker compose ps
```

Start PostgreSQL if needed:

```bash
docker compose up -d postgres
```

Check that `.env` values match the Docker Compose service:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_PORT`
- `DATABASE_URL`

### Migrations Fail Locally

Common checks:

- PostgreSQL container is healthy.
- `DATABASE_URL` points to the local database.
- Prisma Client has been regenerated.
- The migration SQL under `prisma/migrations` matches the intended schema
  change.

Useful commands:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

### Swagger Does Not Open

Check:

- `DOCS_ENABLED=true`
- `DOCS_PATH=docs`
- the API is running on the configured `PORT`
- `APP_GLOBAL_PREFIX`, if set, is not being confused with the docs path

Default URL:

```txt
http://localhost:3000/docs
```

### Validation Fails For A Controller Parameter

The project uses strict Zod DTO declarations.

Check that external input uses DTO classes created with `createZodDto()`:

- `@Param() params: SomeParamsDto`
- `@Query() query: SomeQueryDto`
- `@Body() body: SomeBodyDto`

Avoid raw primitive controller parameters for validated external input.

### Response Serialization Fails

`@ZodResponse(...)` validates outgoing data.

Check:

- the returned object matches the response schema
- optional fields are modeled correctly
- dates and enums are serialized in the expected shape
- the route is annotated with the intended response DTO
