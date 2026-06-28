---
title: Semantic API Contracts
doc-type: implementation-guide
role: source-of-truth
priority: high
canonical: docs/ai/api/semantic-api-contracts.md
related:
  - docs/ai/api/error-handling-foundation.md
  - docs/ai/api/zod-swagger-foundation.md
  - sandicts/sandicts-docs:docs/decisions/api-contract-governance.md
  - sandicts/reactjs-sandicts-web:docs/frontend/sandicts-frontend-tech-decisions.md
scope: http-status, public-errors, openapi, compatibility, contract-testing
read-when:
  - adding or changing an endpoint
  - adding or changing a public error code
  - changing OpenAPI generation
  - reviewing backend/frontend API compatibility
do-not-read-when:
  - changing implementation with no HTTP contract impact
---

# Semantic API Contracts

## Purpose

Keep runtime HTTP behavior, Zod-backed response shapes, Swagger/OpenAPI, tests,
and generated frontend contracts aligned.

The backend runtime and generated OpenAPI document are the exact contract
source. Shared docs own cross-app compatibility expectations. Frontend code
consumes generated contracts and must not copy public error catalogs manually.

## Success Status Rules

- `200 OK`: successful read or synchronous command that returns a body
- `201 Created`: successful resource creation that returns the created resource
  or a stable reference
- `202 Accepted`: command accepted for deferred processing or delivery
- `204 No Content`: successful command with no response body

Do not introduce a universal success envelope. Endpoint-specific bodies remain
clearer and generate better client types.

## Error Status Rules

- `400 Bad Request`: malformed input or `validation_error`
- `401 Unauthorized`: missing, invalid, expired, or revoked authentication
  credential
- `403 Forbidden`: authenticated identity or account cannot perform the action
- `404 Not Found`: current resource does not exist or is intentionally hidden
- `409 Conflict`: request conflicts with current resource state
- `410 Gone`: a previously valid one-time resource has expired or is no longer
  usable
- `422 Unprocessable Entity`: valid input rejected by a domain/business rule
- `429 Too Many Requests`: throttling or abuse-prevention limit
- `500 Internal Server Error`: unexpected failure
- `503 Service Unavailable`: expected temporary dependency outage

The exact mapping is executable in
`src/infra/http/errors/http-error-contract.ts`.

## Public Error Envelope

Every JSON error response uses:

```json
{
  "statusCode": 409,
  "code": "magic_link_already_used",
  "message": "Magic link has already been used",
  "path": "/auth/magic-link/consume",
  "timestamp": "2026-06-28T00:00:00.000Z",
  "requestId": "req-123"
}
```

`issues` is optional and reserved for structured validation feedback.

Rules:

- `statusCode` and `code` are stable machine-readable behavior
- `message` is safe human-readable context, not a frontend branching key
- `requestId` is safe diagnostic context
- internal details, causes, credentials, cookies, and tokens are never public

The reusable schema lives in
`src/infra/http/openapi/api-error-response.schemas.ts`.

## Controller Rule

Every controller must declare:

1. one explicit success status and response schema
2. every predictable error status and exact public code
3. `429 rate_limited` when the route is throttled
4. `500 internal_error`
5. dependency-specific `503` responses when applicable

Use `ApiErrorResponses` from
`src/infra/http/openapi/api-error-responses.decorator.ts`. Its type constraints
prevent documenting a code under a status that differs from the executable
HTTP mapping.

## Current Auth Matrix

| Endpoint | Success | Expected errors |
| --- | --- | --- |
| `POST /auth/google/sign-in` | `200` | `400`, `401`, `403`, `409`, `429`, `500` |
| `POST /auth/refresh` | `200` | `401`, `403`, `429`, `500` |
| `POST /auth/magic-link/request` | `202` | `400`, `429`, `500`, `503` |
| `POST /auth/magic-link/consume` | `200` | `400`, `401`, `403`, `409`, `410`, `429`, `500` |
| `POST /auth/sign-out` | `204` | `401`, `429`, `500` |
| `POST /auth/sign-out-all` | `204` | `401`, `429`, `500` |
| `GET /auth/me` | `200` | `401`, `403`, `429`, `500` |

Exact codes are asserted by
`src/infra/http/openapi/openapi-contract.spec.ts`.

## OpenAPI Artifact

The canonical generated artifact is:

```text
openapi/sandicts-api.json
```

Commands:

```bash
npm run openapi:generate
npm run openapi:check
```

`openapi:check` regenerates the document and fails when the committed artifact
is stale. Pull request CI runs this as the `Contract` job.

The frontend Orval configuration consumes the local sibling artifact when
available and falls back to the canonical backend `developer` artifact in CI.

## Change Rule

Before merging a public contract change:

1. update the runtime behavior and Zod schemas
2. update exact controller error declarations
3. update focused runtime and contract tests
4. regenerate the OpenAPI artifact
5. regenerate and validate the frontend client when the change affects it
6. classify compatibility using the shared API contract governance decision
