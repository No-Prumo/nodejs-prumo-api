---
title: Repository Pattern
doc-type: implementation-guide
role: source-of-truth
priority: high
canonical: docs/ai/architecture/repository-pattern.md
related:
  - docs/ai/architecture/backend-architecture-overview.md
  - docs/ai/architecture/module-pattern.md
  - docs/ai/architecture/use-case-pattern.md
  - docs/ai/api/error-handling-foundation.md
scope: repositories, prisma, persistence, ports, adapters
read-when:
  - creating a repository port
  - implementing Prisma persistence
  - deciding whether a database query belongs in a use case or repository
  - testing use cases with fake persistence
do-not-read-when:
  - changing only controller route metadata
  - changing only external provider integration code
---

# Repository Pattern

## Purpose

Repositories are the persistence boundary.

The application layer defines what it needs. Infrastructure decides how that need is fulfilled with Prisma and the database.

## Port Location

Place repository ports in the application layer:

```txt
modules/reservations/application/ports/reservations.repository.ts
```

Pattern:

```ts
export const RESERVATIONS_REPOSITORY = Symbol('RESERVATIONS_REPOSITORY');

export type ReservationsRepository = {
  create(data: CreateReservationData): Promise<ReservationRecord>;
  findById(id: string): Promise<ReservationRecord | null>;
  findActiveByCourtAndRange(params: CourtRange): Promise<ReservationRecord[]>;
};
```

Rules:

- the port name uses domain language
- methods describe use case needs
- methods should not expose Prisma model types
- methods should not accept raw controller DTOs

## Adapter Location

Shared Prisma infrastructure lives in:

```txt
src/infra/prisma/
  prisma.module.ts
  prisma.service.ts
```

The shared module owns the Prisma client lifecycle and database adapter wiring.

Place Prisma implementation in infrastructure:

```txt
modules/reservations/infrastructure/persistence/prisma/
  prisma-reservations.repository.ts
```

Pattern:

```ts
@Injectable()
export class PrismaReservationsRepository implements ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.reservation.findUnique({
      where: { id },
    });
  }
}
```

## Method Semantics

Prefer meaningful query methods:

- `findByEmail`
- `findActiveByCourtAndRange`
- `findPendingPaymentById`
- `markAsConfirmed`
- `cancelById`

Avoid generic methods unless they are genuinely useful:

- `findMany`
- `update`
- `delete`
- `executeRaw`

Generic repository methods tend to push persistence details back into use cases.

## Business Rules

Repositories do not decide business workflows.

Good repository behavior:

- query records
- persist records
- map database fields to application records
- enforce low-level database constraints
- return `null`, `boolean`, or records so the use case can decide

Bad repository behavior:

- decide if a player can cancel a reservation
- decide if a payment should confirm a reservation
- call payment gateways
- create hidden side effects in other modules

## Prisma Boundaries

Keep Prisma client and Prisma-generated types out of controllers and use cases when possible.

Acceptable:

- Prisma types inside Prisma repositories
- injecting `PrismaService` into Prisma repository adapters
- internal mapping from Prisma records to application records
- Prisma unique constraints as final protection against race conditions

Avoid:

- injecting `PrismaService` into controllers or use cases
- returning raw Prisma records with sensitive fields to controllers
- requiring use cases to pass Prisma `where` objects
- leaking `Prisma.TransactionClient` into use case signatures

## Transactions

If one use case needs multiple repository writes to commit atomically, prefer one of these:

1. a repository method that performs the atomic operation when it belongs to one aggregate
2. a `UnitOfWork` port when multiple repositories must participate

Do not introduce a generic transaction abstraction until a real use case needs it.

## Errors

Repository implementations may translate known database failures when the meaning is clear.

Examples:

- unique email violation can become a `conflict`
- missing record during update can be surfaced so the use case returns `resource_not_found`

Do not expose raw database errors to public responses.

## Testing

Use in-memory fakes for use case tests.

Use integration tests for Prisma repository behavior that depends on:

- unique constraints
- transactions
- date range queries
- relation includes
- database-specific behavior

