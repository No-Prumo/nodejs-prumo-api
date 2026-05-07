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

### Error codes

Current normalized codes are:

- `bad_request`
- `validation_error`
- `unauthorized`
- `forbidden`
- `resource_not_found`
- `conflict`
- `business_rule_violation`
- `internal_error`

Rules:

- `validation_error` is for HTTP validation failures, especially Zod input parsing
- domain and application should prefer `business_rule_violation` for expected business failures
- `internal_error` is reserved for unexpected or internal-only failures

### Logging policy

The request completion log produced by `nestjs-pino` remains the primary error log.

The global exception filter should:

- not emit extra logs for `AppError` mapped to `4xx`
- not emit extra logs for normal `HttpException` `4xx`
- emit an extra structured log only for unexpected or internal `5xx`

Reason:

- avoids logging the same client error twice
- keeps the main HTTP log as the canonical operational event
- still adds focused context when the failure is unexpected

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
- `forbidden` -> `403`
- `resource_not_found` -> `404`
- `conflict` -> `409`
- `business_rule_violation` -> `422`

### `HttpException`

Normalize framework and adapter exceptions to the same payload.

Default status mapping:

- `400` -> `bad_request`
- `401` -> `unauthorized`
- `403` -> `forbidden`
- `404` -> `resource_not_found`
- `409` -> `conflict`
- `422` -> `business_rule_violation`
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
