---
title: Use Case Pattern
doc-type: implementation-guide
role: source-of-truth
priority: high
canonical: docs/ai/architecture/use-case-pattern.md
related:
  - docs/ai/architecture/backend-architecture-overview.md
  - docs/ai/architecture/module-pattern.md
  - docs/ai/architecture/repository-pattern.md
  - docs/ai/architecture/external-integrations-pattern.md
  - docs/ai/api/error-handling-foundation.md
scope: application-layer, use-cases, business-rules, dependency-inversion
read-when:
  - creating a business action
  - deciding whether code belongs in controller or application layer
  - adding rules for reservations, payments, scheduling, finance, accounts, or tournaments
  - deciding how application errors should be thrown
do-not-read-when:
  - changing only Swagger metadata
  - changing only Prisma query syntax with no business behavior change
---

# Use Case Pattern

## Purpose

Use cases are the application layer.

Each use case represents one business action that the product understands.

Examples:

- `SignUpPlayerUseCase`
- `CreateReservationUseCase`
- `CancelReservationUseCase`
- `CreatePaymentIntentUseCase`
- `HandlePaymentWebhookUseCase`
- `RegisterPlayerInTournamentUseCase`

## Why Use Case Instead Of Generic Service

Use `UseCase` for business workflows.

Use `Service` for reusable capabilities.

Good services:

- `PasswordHasher`
- `AvailabilityCalculator`
- `ReservationPriceCalculator`
- `PaymentGateway`
- `CalendarSyncGateway`

Avoid one large `ReservationsService` with many unrelated commands. It hides business intent and tends to collect too many dependencies.

## Default Shape

Keep use case request and response types in a sibling `.types.ts` file.

```ts
// create-reservation.use-case.types.ts
type CreateReservationUseCaseRequest = {
  actorId: string;
  courtId: string;
  startsAt: Date;
  endsAt: Date;
};

type CreateReservationUseCaseResponse = {
  reservation: {
    id: string;
    status: ReservationStatus;
    startsAt: Date;
    endsAt: Date;
  };
};

export type {
  CreateReservationUseCaseRequest,
  CreateReservationUseCaseResponse,
};
```

```ts
// create-reservation.use-case.ts
import type {
  CreateReservationUseCaseRequest,
  CreateReservationUseCaseResponse,
} from './create-reservation.use-case.types';

@Injectable()
class CreateReservationUseCase {
  constructor(
    @Inject(RESERVATIONS_REPOSITORY)
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async execute(
    request: CreateReservationUseCaseRequest,
  ): Promise<CreateReservationUseCaseResponse> {
    // business workflow here
  }
}

export { CreateReservationUseCase };
```

Rules:

- expose one public `execute()` method
- receive one semantic request object
- return one semantic response object
- keep request and response types in a dedicated `.types.ts` file beside the use
  case implementation
- return only data intended for the API or next application boundary
- do not return raw Prisma records by accident

## Responsibilities

Use cases own:

- business rule checks
- permission checks specific to the action
- orchestration across repositories and gateways
- status transitions
- transaction boundaries when required
- mapping internal records to application response data
- expected application failures through `AppError`

Use cases do not own:

- HTTP status codes
- Swagger metadata
- Zod DTO classes
- Prisma client calls
- raw payment SDK calls
- raw Google Calendar SDK calls

## Errors

Use `AppError` for expected failures.

Examples:

- email already registered: `conflict`
- reservation slot unavailable: `business_rule_violation`
- player not found: `resource_not_found`
- partner user accessing another partner: `forbidden`

Do not throw Nest `HttpException` from a use case.

Prefer module-level reusable error factories over inline local functions when
the same error can occur in more than one use case.

Good:

```ts
import { invalidAccessToken } from '../../errors/auth-errors';

throw invalidAccessToken({
  action: 'sign_out',
  reason: 'missing_or_invalid_bearer_token',
});
```

Avoid:

```ts
function invalidAccessToken(): AppError {
  return new AppError('unauthorized', 'Invalid authentication credentials');
}
```

Do not catch an error only to log and rethrow it. The global exception filter and request logger already handle expected HTTP visibility. Add explicit logs only for high-value business events or unusual integration decisions.

## Observability

Good use case observability:

- semantic error messages
- exact public `AppError.code` values when the frontend needs to branch on a
  specific failure
- safe `details` in `AppError` for internal logs and observability
- explicit integration event records for webhooks and payments
- no secrets in errors or logs
- no duplicate logging for normal `4xx` business failures

Example:

```ts
throw new AppError('business_rule_violation', 'Court slot is unavailable', {
  details: {
    courtId: request.courtId,
    startsAt: request.startsAt,
    endsAt: request.endsAt,
  },
});
```

## Transactions

Start simple.

Use a transaction boundary when one business action must commit multiple state changes atomically.

Examples:

- create reservation and block slot
- confirm payment and confirm reservation
- register tournament participant and increment count

Do not expose Prisma transaction types to use cases. If transaction reuse becomes necessary, introduce a small application port such as `UnitOfWork`.

## Dependency Rules

Allowed dependencies:

- repository ports
- gateway ports
- small application services
- domain functions, value objects, and errors
- shared `AppError`

Avoid dependencies on:

- controllers
- DTO classes
- Nest HTTP exceptions
- Prisma repositories directly
- provider SDK clients directly

## Testing

Use case tests should mock or fake ports.

Focus tests on:

- successful workflow
- important business failures
- permission failures
- state transitions
- integration port calls when they define the workflow
