---
title: Configuration Foundation
doc-type: implementation-guide
role: source-of-truth
priority: high
canonical: docs/ai/config/configuration-foundation.md
related:
  - docs/ai/index.md
scope: nestjs-config, env-validation, zod, bootstrap, typed-config
read-when:
  - adding new environment variables
  - changing application bootstrap
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
  config/
    index.ts
    env.schema.ts
    app.config.ts
    database.config.ts
    logger.config.ts
    docs.config.ts
    observability.config.ts
```

## Responsibilities by file

### `src/config/env.schema.ts`

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

### `src/config/*.config.ts`

Owns:

- mapping validated env into small domain objects
- semantic names for app consumption

Rules:

- keep each domain flat and small
- do not add framework-specific logic here beyond config mapping
- do not couple to concrete adapters prematurely

### `src/app.module.ts`

Owns:

- global registration of `ConfigModule`
- loading all domain configs
- wiring custom validation

Current setup:

- `isGlobal: true`
- `cache: true`
- `expandVariables: true`
- `validate: validateEnv`

### `src/main.ts`

Owns:

- bootstrap consumption of typed `app` config
- `host`, `port`, and optional `globalPrefix`

Rule:

- never read `process.env` here

## Supported domains

### `app`

Purpose:

- bootstrap/runtime settings shared by the application itself

Current shape:

- `nodeEnv`
- `host`
- `port`
- `globalPrefix`
- `isProduction`
- `isDevelopment`
- `isTest`

### `database`

Purpose:

- database connection metadata without coupling to any ORM

Current shape:

- `url`
- `host`
- `port`
- `username`
- `password`
- `database`

Guideline:

- ORM modules may consume this domain later
- ORM-specific options should not be added here unless they are truly cross-cutting

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
PORT=3000
APP_HOST=0.0.0.0
APP_GLOBAL_PREFIX=

POSTGRES_USER=postgres
POSTGRES_PASSWORD=no-prumo
POSTGRES_DB=no-prumo
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:no-prumo@localhost:5432/no-prumo

LOG_LEVEL=log
LOG_PRETTY=true
DOCS_ENABLED=true
DOCS_PATH=docs
OBSERVABILITY_ENABLED=false
OBSERVABILITY_SERVICE_NAME=nodejs-prumo-api
```

Notes:

- `expandVariables: true` allows composed values in `.env`
- `DATABASE_URL` is validated as URL text
- booleans accept `true/false`, `1/0`, `yes/no`, `on/off`
- ports are coerced to integers and validated in range `1..65535`

## Consumption pattern

Recommended pattern:

```ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { appConfig } from '../config';

@Injectable()
export class ExampleService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appSettings: ConfigType<typeof appConfig>,
  ) {}

  getPort() {
    return this.appSettings.port;
  }
}
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
- do not couple `database` config to Prisma, TypeORM, Drizzle, or another ORM yet
- do not spread defaults across modules

## How to add a new env var

1. Add the variable to `src/config/env.schema.ts`
2. Choose the correct domain config file and expose it there
3. Export the domain/type from `src/config/index.ts` if needed
4. Consume the typed domain in the module/service that needs it
5. Add or update tests if parsing, coercion, or required-ness changed
6. Update this document if the contract or usage rule changed

## Testing policy

Current coverage:

- unit tests for env parsing and validation in `src/config/env.schema.spec.ts`

Why this is enough for now:

- the critical risk is invalid env and wrong coercion
- domain config files are thin mappings over validated env
- no integration-specific adapters exist yet

Add more tests when:

- a domain starts deriving non-trivial values
- config begins driving conditional module wiring
- environment-specific behavior becomes more complex

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
- an ORM-specific config before ORM adoption

## Invariants

These rules should continue to hold:

- `ConfigModule` stays global
- env validation happens at startup
- `process.env` access stays restricted to `src/config`
- config remains grouped by small domains
- `database` remains persistence-tool-agnostic until a real persistence decision exists
