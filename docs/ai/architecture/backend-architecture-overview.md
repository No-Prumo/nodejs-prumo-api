---
title: Backend Architecture Overview
doc-type: architecture-guide
role: source-of-truth
priority: high
canonical: docs/ai/architecture/backend-architecture-overview.md
related:
  - docs/ai/architecture/module-pattern.md
  - docs/ai/architecture/controller-pattern.md
  - docs/ai/architecture/use-case-pattern.md
  - docs/ai/architecture/repository-pattern.md
  - docs/ai/architecture/external-integrations-pattern.md
  - docs/ai/api/zod-swagger-foundation.md
  - docs/ai/api/error-handling-foundation.md
scope: nestjs, modular-monolith, clean-architecture, clean-code, feature-boundaries
read-when:
  - creating a new backend feature
  - deciding where a file should live
  - deciding whether to add a new abstraction
  - changing module boundaries
  - evaluating future microservice extraction
do-not-read-when:
  - changing only a narrow validation rule already covered by a route schema
  - changing only CI, formatting, logger configuration, or environment parsing
---

# Backend Architecture Overview

## Purpose

This is the source of truth for the Sandicts backend architecture.

The project should use a practical Clean Architecture style inside a NestJS modular monolith:

- strong feature module boundaries
- semantic use cases for business actions
- Zod-backed HTTP contracts
- dependency inversion for repositories and external providers
- no early microservice split
- no abstractions that do not protect a real boundary

## Architecture Style

Use a modular monolith first.

Each product capability lives in a Nest feature module. The module can contain its HTTP controllers, application use cases, domain rules, repository ports, and infrastructure adapters.

This keeps deployment simple now and preserves the option to extract a module later if the domain proves it needs independent scaling, ownership, or release cadence.

## Source Layout

Default top-level layout:

```txt
src/
  bootstrap/
  config/
  generated/
  infra/
  modules/
  shared/

prisma/
  models/
prisma.config.ts
```

Responsibilities:

- `bootstrap`: create and configure the Nest application instance
- `config`: validate env and expose typed configuration domains
- `generated`: generated code such as the Prisma client; generated files are not committed
- `infra`: shared platform modules such as HTTP platform setup, logging, Prisma, cache, queues, or external SDK clients
- `modules`: product capability modules such as accounts, establishments, reservations, billing, and finance
- `prisma`: Prisma schema configuration, domain-grouped model files, and future migrations
- `shared`: framework-neutral primitives and cross-cutting application types

Rules:

- keep product modules out of `infra`
- keep feature-specific adapters inside their owning product module
- use `infra` for shared platform concerns only
- keep the shared Prisma client lifecycle in `src/infra/prisma`
- keep `prisma/schema.prisma` as the main Prisma file for generator and datasource blocks
- group Prisma models by domain under `prisma/models/*.prisma` instead of placing every model in one large schema file
- keep Prisma repository implementations inside the owning product module
- do not create empty feature folders before a real feature needs them

## Dependency Direction

Default dependency direction:

```txt
presentation/http
  -> application/use-cases
    -> application/ports
    -> domain

infrastructure
  -> application/ports
  -> domain
```

Rules:

- controllers call use cases
- use cases depend on ports, domain objects, and small application services
- repositories and gateways implement ports
- infrastructure is wired by Nest modules
- domain and application code do not import Nest HTTP classes
- controllers do not import Prisma, payment SDKs, or calendar SDKs

## Request Flow

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

Expected failures use `AppError`.

Unexpected failures bubble to the global exception filter and are logged through the existing observability stack.

## Initial Feature Modules

Recommended modules:

- `accounts`: players, Organization users, staff users, roles, authentication-facing account flows
- `establishments`: Organizations, courts, sports, opening hours, Organization profile
- `scheduling`: availability, blocks, calendar views, Google Calendar sync
- `reservations`: booking lifecycle, participants, cancellation, no-show, reservation state
- `billing`: payment intents, provider checkout, webhooks, refunds, provider state
- `finance`: receivables, payouts, statements, reconciliation, Organization financial views
- `tournaments`: tournament creation, registrations, brackets, matches, results
- `social`: invites, open matches, contacts, player-to-player coordination
- `notifications`: email, WhatsApp, push, templates, delivery state

Keep billing and finance separate:

- billing answers "how money is charged"
- finance answers "how money is reported, reconciled, and paid out"

## Layer Responsibilities

Controller:

- HTTP route
- auth and route metadata
- Zod-backed input/output contracts
- status code
- call exactly the intended use case

Use case:

- business workflow
- permissions that are specific to the action
- domain rule checks
- transaction boundary when needed
- calls to repositories and gateways through ports
- return only data intended for the API response

Repository:

- persistence access
- Prisma queries and commands
- database mapping
- no business workflow decisions

Gateway adapter:

- external SDK/API access
- provider-specific request signing, parsing, retries, and mapping
- no product workflow decisions

Domain:

- names, invariants, value objects, status transitions, domain errors
- no Nest, Prisma, or provider SDK imports

## Practical SOLID Rules

Apply SOLID where it protects clarity:

- use dependency inversion for database, payment, calendar, email, storage, and other external boundaries
- keep one use case focused on one business action
- keep controllers thin
- avoid generic service classes that become large procedural bags
- avoid interfaces for things that are not replaceable or not on a boundary
- avoid inheritance-heavy designs

## TypeScript Export Style

Use named exports at the end of source files.

Rules:

- declare constants, classes, and functions without inline `export`
- export all public symbols from a final export block
- use a separate final `export type { ... }` block for type-only exports
- avoid `export default`
- keep type aliases and interfaces in dedicated `.types.ts` files next to the
  implementation that owns them; do not declare module-specific request,
  response, helper, adapter, or service types in the same file as executable
  functions/classes
- files whose primary purpose is a type contract, such as repository ports or
  domain type catalogs, may contain types directly

Example:

```ts
const THINGS_REPOSITORY = Symbol('THINGS_REPOSITORY');

class ThingService {}

export { THINGS_REPOSITORY, ThingService };
```

```ts
// things.types.ts
type ThingRecord = {
  id: string;
};

type ThingsRepository = {
  findById(id: string): Promise<ThingRecord | null>;
};

export type { ThingRecord, ThingsRepository };
```

## Microservice Readiness

A module is easier to extract later when:

- it owns its own application use cases
- other modules do not query its tables directly
- external communication happens through public use cases, domain events, or explicit ports
- its schemas and error behavior are documented
- infrastructure concerns stay inside the module

Do not create microservices until there is real pressure from scale, team ownership, deployment independence, or isolation needs.

## Do Not

- do not put Prisma calls in controllers
- do not put HTTP status or `HttpException` inside use cases
- do not create a `BaseRepository` before repeated behavior proves it is useful
- do not add CQRS, event sourcing, or a message broker by default
- do not split modules by technical layer only, such as one global `controllers/` folder and one global `repositories/` folder
- do not create one abstraction per class just to satisfy a textbook rule

## Default Decision

When unsure, choose:

```txt
feature module
  -> thin controller
  -> Zod contract
  -> semantic use case
  -> port
  -> Prisma or provider adapter
```
