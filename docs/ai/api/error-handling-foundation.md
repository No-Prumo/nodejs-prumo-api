---
title: HTTP Error Handling Foundation
doc-type: implementation-guide
role: source-of-truth
priority: high
canonical: docs/ai/api/error-handling-foundation.md
related:
  - docs/ai/api/zod-swagger-foundation.md
  - docs/ai/logging/logging-foundation.md
scope: nestjs, exception-filters, app-errors, http-error-contracts
read-when:
  - adding new application or domain errors
  - changing HTTP exception handling
  - adjusting error logging policy
  - integrating validation errors into the public API contract
do-not-read-when:
  - changing business rules with no HTTP surface impact
  - editing persistence internals unrelated to request handling
---

# HTTP Error Handling Foundation

## Purpose

Source of truth for error handling across controller, application, domain, and HTTP boundaries.

This project uses:

- one global Nest exception filter
- one shared `AppError` for expected application and domain failures
- one normalized HTTP error payload
- `nestjs-pino` as the primary logging stack

Implementation location:

- `src/infra/http/filters/global-exception.filter.ts`
- global registration through `src/infra/http/http-platform.module.ts`

## Design goals

- keep domain and application free from `HttpException`
- keep the error model small
- normalize all HTTP error responses
- avoid duplicate logging
- stay ready for Zod validation issues without exposing internal details

## Current strategy

### Shared error model

Use one concrete `AppError` with:

- `code`
- `message`
- optional `details`
- optional `cause`

Do not create a large exception hierarchy now.

For expected application failures, prefer reusable module-level error factory
functions instead of creating one-off `new AppError(...)` calls inside use
cases. Place those factories in the module application layer, for example
`src/modules/auth/application/errors/auth-errors.ts`.

For repeated internal error details, centralize stable values instead of using
string literals in multiple files. In the auth module, shared `details.reason`
values live in `src/modules/auth/application/errors/auth-error-reasons.ts`, and
provider values should reuse the auth domain catalog instead of new strings.

### Error codes

Current normalized codes are:

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

Rules:

- use the most specific safe public `code` available so the frontend can branch
  on exact failure cases
- `validation_error` is for HTTP validation failures, especially Zod input parsing
- `invalid_access_token`, `invalid_refresh_token`, and related auth/session
  codes are safe public auth failures that still avoid exposing raw token or
  storage internals
- `invalid_google_credential` is for invalid Google Sign-In or One Tap ID tokens
- `invalid_magic_link_token` is for a token that does not identify a challenge
- `magic_link_expired`, `magic_link_already_used`, and
  `magic_link_superseded` expose safe lifecycle states needed by the frontend
- `email_delivery_unavailable` means the configured email dependency could not
  accept delivery; it never exposes provider errors or payloads
- `external_identity_conflict` is for safe auth-provider linking conflicts
- domain and application should prefer `business_rule_violation` for expected business failures
- `internal_error` is reserved for unexpected or internal-only failures
- `rate_limited` is for HTTP throttling failures such as auth endpoint abuse

### Logging policy

The request completion log produced by `nestjs-pino` remains the primary error log.

The global exception filter should:

- emit a structured warning for `AppError` mapped to `4xx` when the error has
  internal `details`
- not emit extra logs for normal `HttpException` `4xx`
- emit a structured warning for safe expected dependency failures such as
  `email_delivery_unavailable`
- emit an error log for unexpected or internal `5xx`

Reason:

- keeps normal framework `4xx` responses quiet
- lets application errors carry internal reason, actor, session, and security
  context into pino and future observability tools
- keeps public responses free of sensitive details

### Public vs internal error data

Public payload fields:

- `statusCode`
- `code`
- `message`
- `path`
- `timestamp`
- `requestId`
- optional `issues`

Internal-only fields:

- `details`
- stack traces
- raw `cause`

Rule:

- `issues` is for public validation feedback
- `details` is for internal debugging and logs only
- never put raw access tokens, refresh tokens, cookies, provider credentials, or
  magic link tokens in `details`

## HTTP contract

Normalized error response shape:

```json
{
  "statusCode": 422,
  "code": "business_rule_violation",
  "message": "Cannot cancel a paid order",
  "path": "/orders/123/cancel",
  "timestamp": "2026-04-19T18:30:00.000Z",
  "requestId": "req-123"
}
```

Validation example:

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

## Mapping rules

### `AppError`

Map known codes in the filter:

- `unauthorized` -> `401`
- `invalid_google_credential` -> `401`
- `invalid_magic_link_token` -> `401`
- `magic_link_expired` -> `410`
- `magic_link_already_used` -> `409`
- `magic_link_superseded` -> `409`
- `email_delivery_unavailable` -> `503`
- `invalid_access_token` -> `401`
- `invalid_refresh_token` -> `401`
- `refresh_token_expired` -> `401`
- `refresh_token_reused` -> `401`
- `refresh_token_revoked` -> `401`
- `auth_session_inactive` -> `401`
- `forbidden` -> `403`
- `account_auth_forbidden` -> `403`
- `resource_not_found` -> `404`
- `conflict` -> `409`
- `external_identity_conflict` -> `409`
- `business_rule_violation` -> `422`

### `HttpException`

Normalize framework and adapter exceptions to the same payload.

Default status mapping:

- `400` -> `bad_request`
- `401` -> `unauthorized`
- `403` -> `forbidden`
- `404` -> `resource_not_found`
- `409` -> `conflict`
- `410` -> `resource_not_found`
- `429` -> `rate_limited`
- `422` -> `business_rule_violation`
- `503` -> `internal_error`
- `500+` -> `internal_error`

### Zod exceptions

- `ZodValidationException` -> `400 validation_error` with public `issues`
- `ZodSerializationException` -> `500 internal_error`
- `ZodSchemaDeclarationException` -> `500 internal_error`

## What not to do

- do not throw `HttpException` from domain or application code
- do not create one exception class per HTTP status
- do not expose `details` or stack traces in the public response
- do not turn the exception filter into a second full logging pipeline
- do not add separate factories and mappers unless repeated complexity appears

## Extension guidance

Good second-step improvements when the project grows:

- add Swagger documentation for common error responses
- add integration tests for real controller failures
- refine validation issue formatting if the API needs a stricter public schema

Avoid until there is real pressure:

- multiple abstract base exception classes
- module-specific error catalogs
- transport-specific exceptions inside use cases or entities
