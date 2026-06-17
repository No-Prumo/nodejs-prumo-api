---
title: Controller Pattern
doc-type: implementation-guide
role: source-of-truth
priority: high
canonical: docs/ai/architecture/controller-pattern.md
related:
  - docs/ai/architecture/backend-architecture-overview.md
  - docs/ai/architecture/use-case-pattern.md
  - docs/ai/api/zod-swagger-foundation.md
  - docs/ai/api/error-handling-foundation.md
scope: nestjs-controllers, http-contracts, zod, swagger, status-codes
read-when:
  - adding a controller
  - adding or changing an endpoint
  - deciding HTTP status codes
  - wiring request DTOs to use cases
do-not-read-when:
  - changing only repository implementation details
  - changing only a domain calculation with no HTTP surface change
---

# Controller Pattern

## Purpose

Controllers are the HTTP boundary.

They should translate HTTP input into an application call and return the application result as the documented HTTP response.

## Responsibilities

Controllers own:

- route path and HTTP method
- route tags and operation metadata
- auth guards and request context extraction
- Zod-backed params, query, body, and response DTOs
- correct status code
- calling the intended use case

Controllers do not own:

- business rule decisions
- Prisma queries
- payment or calendar SDK calls
- password hashing
- transaction orchestration
- provider-specific error handling

## Default Pattern

```ts
@ApiTags('Reservations')
@Controller('reservations')
class ReservationsController {
  constructor(private readonly createReservation: CreateReservationUseCase) {}

  @Post()
  @ZodResponse({
    status: 201,
    description: 'Reservation created',
    type: CreateReservationResponseDto,
  })
  createReservation(
    @Body() body: CreateReservationBodyDto,
  ): Promise<CreateReservationResponseDto> {
    return this.createReservation.execute(body);
  }
}

export { ReservationsController };
```

Rules:

- the response status in `@ZodResponse` must match the real HTTP status
- use `@HttpCode(...)` when Nest's default status is not the desired status
- use DTO classes created with `createZodDto()`
- return the use case result directly when it already matches the response schema

## Controller Granularity

Prefer one small controller per endpoint or command when a module has many
independent actions.

This project uses one use case per business action. Keeping the matching HTTP
controller small makes each endpoint easier to maintain, test, and review as the
module grows.

Recommended shape for action-heavy modules:

```txt
presentation/http/
  request-magic-link/
    request-magic-link.controller.ts
    request-magic-link.controller.spec.ts
    request-magic-link.schemas.ts
  consume-magic-link/
    consume-magic-link.controller.ts
    consume-magic-link.controller.spec.ts
    consume-magic-link.schemas.ts
  shared/
    auth-session-response.schemas.ts
```

Rules:

- keep related endpoints grouped in Swagger with the same `@ApiTags(...)`
- keep route prefixes consistent with `@Controller(...)` and method decorators
- use shared schema files only for small response fragments reused by multiple
  endpoints
- keep each action's controller, schema, and focused controller test in the same
  action folder once a module has more than one action
- avoid a large controller that accumulates unrelated endpoint dependencies
- avoid extracting endpoint functions into a central controller file; prefer
  Nest controller classes so dependency injection stays explicit

## Status Code Rules

Default choices:

- `201`: resource or workflow created
- `200`: successful read or command returning a response body
- `204`: successful command with no response body
- `400`: invalid request shape, handled by Zod validation
- `401`: missing or invalid authentication
- `403`: authenticated user cannot perform the action
- `404`: requested resource not found
- `409`: conflict with existing state, such as duplicate unique data
- `422`: valid request shape but invalid business operation

Do not return `200` for creation just because it is easy.

## Request Context

The controller may extract:

- authenticated account id
- partner id from auth context
- route params
- query filters
- body payload

Then it should pass a single semantic request object to the use case.

Example:

```ts
return this.createReservation.execute({
  actorId: currentUser.id,
  partnerId: params.partnerId,
  courtId: body.courtId,
  startsAt: body.startsAt,
});
```

## Schema Placement

Put route schemas near the HTTP controller:

```txt
presentation/http/create-reservation/create-reservation.schemas.ts
presentation/http/create-reservation/create-reservation.controller.ts
```

Reason:

- schemas describe HTTP contracts
- use cases should not depend on HTTP DTO classes
- use cases may use inferred input types only when that does not create a framework dependency
- reusable response fragments belong in `presentation/http/shared/`, not in the
  application layer

## Reusable HTTP Decorators

Create a reusable decorator when route metadata is repeated and carries the same
semantic meaning across endpoints.

Good examples:

- required Bearer access token header metadata
- common auth error response metadata
- repeated pagination query metadata once pagination exists

Avoid decorators for:

- one-off Swagger metadata
- route-specific operation summaries
- metadata that would hide important controller behavior

Place module-specific decorators in the module HTTP `shared/` folder. Move a
decorator to `src/infra/http/decorators/` only after multiple modules use the
same contract.

## Response Shape

The controller should not leak internal records.

Good response:

```json
{
  "reservation": {
    "id": "res_123",
    "status": "pending_payment",
    "startsAt": "2026-06-10T18:00:00.000Z",
    "endsAt": "2026-06-10T19:00:00.000Z"
  }
}
```

Bad response:

- raw Prisma model with internal columns
- password hash
- provider secrets
- internal reconciliation data

## Error Behavior

Controllers should not catch expected application errors.

Use cases throw `AppError`; the global exception filter maps it to the HTTP response.

Only catch in controllers when the controller is handling a transport-specific concern, such as raw webhook signature extraction.
