---
title: Nest Module Pattern
doc-type: architecture-guide
role: source-of-truth
priority: high
canonical: docs/ai/architecture/module-pattern.md
related:
  - docs/ai/architecture/backend-architecture-overview.md
  - docs/ai/architecture/controller-pattern.md
  - docs/ai/architecture/use-case-pattern.md
  - docs/ai/architecture/repository-pattern.md
scope: nestjs-modules, feature-modules, modular-monolith, dependency-injection
read-when:
  - creating a new Nest module
  - deciding feature folder structure
  - wiring providers for use cases, repositories, or gateways
  - deciding module exports and imports
do-not-read-when:
  - changing only an existing use case body
  - changing only an existing route schema
---

# Nest Module Pattern

## Purpose

Each Nest module should represent a product capability, not a technical category.

Good module names:

- `accounts`
- `establishments`
- `scheduling`
- `reservations`
- `billing`
- `finance`
- `tournaments`
- `social`
- `notifications`

Avoid module names that are only technical buckets:

- `repositories`
- `controllers`
- `services`
- `dtos`

## Feature Folder Layout

Default layout:

```txt
src/modules/reservations/
  reservations.module.ts

  presentation/http/
    create-reservation/
      create-reservation.controller.ts
      create-reservation.controller.spec.ts
      create-reservation.schemas.ts
    cancel-reservation/
      cancel-reservation.controller.ts
      cancel-reservation.controller.spec.ts
      cancel-reservation.schemas.ts
    shared/
      reservation-response.schemas.ts

  application/
    use-cases/
      create-reservation/
        create-reservation.use-case.ts
        create-reservation.use-case.spec.ts
      cancel-reservation/
        cancel-reservation.use-case.ts
        cancel-reservation.use-case.spec.ts
    services/
      pricing/
        reservation-price-calculator.ts
    ports/
      reservations.repository.ts
      payment-gateway.ts

  domain/
    reservation-status.ts
    errors/
    value-objects/

  infrastructure/
    persistence/prisma/
      prisma-reservations.repository.ts
```

Use one folder per action when the module has more than one controller or use
case, especially when tests and schemas live beside the implementation. Shared
HTTP fragments can live under `presentation/http/shared/`. Group reusable
application services by capability, such as `services/tokens/` or
`services/pricing/`, when more than one file shares the same vocabulary.

This layout can stay small. Do not create empty folders before they are needed.

## Provider Wiring

Use Nest dependency injection instead of manual factories.

Pattern:

```ts
const RESERVATIONS_REPOSITORY = Symbol('RESERVATIONS_REPOSITORY');

@Module({
  controllers: [ReservationsController],
  providers: [
    CreateReservationUseCase,
    CancelReservationUseCase,
    {
      provide: RESERVATIONS_REPOSITORY,
      useClass: PrismaReservationsRepository,
    },
  ],
})
class ReservationsModule {}

export { RESERVATIONS_REPOSITORY, ReservationsModule };
```

Rules:

- use cases are providers
- repository and gateway implementations are providers
- ports use explicit injection tokens
- the module decides which concrete adapter implements each port
- application code does not instantiate concrete infrastructure classes

## Module Exports

Export only what another module is allowed to use.

Usually export:

- public use cases needed by another module
- a small application facade if several use cases must be consumed together

Avoid exporting:

- Prisma repositories
- provider SDK clients
- internal controllers
- private helper services

## Cross-Module Access

Rules:

- one module should not read another module's tables directly to bypass its rules
- prefer calling a public use case or facade from the owning module
- avoid circular module imports
- if two modules constantly need each other, the boundary is probably wrong

Acceptable shared code:

- `shared/errors`
- framework-neutral primitives
- small reusable utilities
- observability helpers

Do not move domain-specific rules into `shared` just because two modules need similar behavior.

## Naming

Use semantic names:

- `CreateReservationUseCase`
- `CancelReservationUseCase`
- `ReservationsRepository`
- `PaymentGateway`
- `CalendarSyncGateway`

Avoid vague names:

- `ReservationsService` for many unrelated actions
- `Manager`
- `Helper`
- `Utils`
- `Processor` unless it truly processes a queue or stream

## When To Split A Module

Consider splitting when:

- the module has multiple independent business lifecycles
- controllers and use cases no longer share the same vocabulary
- tests require too much unrelated setup
- another module only needs one sub-area and the dependency becomes awkward

Example:

- `billing` and `finance` should stay separate because provider charge state and partner financial reporting evolve differently.

## When To Keep A Module Together

Keep a module together when:

- the concepts change together
- rules depend on the same aggregate or lifecycle
- separating would create cross-module calls for every normal operation

Example:

- reservation creation, cancellation, and participant handling can start in `reservations`.

