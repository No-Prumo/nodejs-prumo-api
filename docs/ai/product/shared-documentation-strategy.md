---
title: Shared Documentation Strategy
doc-type: product-architecture-decision
role: source-of-truth
priority: medium
canonical: docs/ai/product/shared-documentation-strategy.md
related:
  - docs/ai/product/sandicts-product-context.md
  - docs/ai/product/sandicts-mvp-scope.md
  - docs/ai/business/sandicts-business-rules.md
scope: documentation, product-rules, frontend-backend-alignment, source-of-truth
read-when:
  - deciding where product or business documentation should live
  - starting the frontend repository or app
  - moving docs out of the backend repository
  - preventing duplicated frontend/backend product rules
do-not-read-when:
  - changing only backend implementation details with no product-rule impact
---

# Shared Documentation Strategy

## Decision

For now, Sandicts product and business-rule documentation lives in this backend
repository under `docs/ai/`.

When frontend work becomes active, product and business-rule documentation should
move to a shared documentation location instead of being duplicated in frontend
and backend repositories.

## Why

Rules such as these must have one source of truth:

- a confirmed reservation blocks a court slot
- a player cannot join the same open match twice
- when tournaments are introduced, registration is allowed only while the tournament is open
- partner users must not access another partner's data

The backend enforces these rules, but the frontend also needs to understand them
to build the right user experience. Copying rules into both apps creates drift.

## Current Phase

Current phase:

- backend-only active development
- keep canonical docs in `docs/ai/`
- keep product scope and business rules close to backend implementation
- update docs in the same change when backend behavior changes a rule

Current canonical docs:

- `docs/ai/product/sandicts-product-context.md`
- `docs/ai/product/sandicts-mvp-scope.md`
- `docs/ai/product/sandicts-v2-backlog.md`
- `docs/ai/business/sandicts-business-rules.md`

## Future Shared Location

If Sandicts stays in a monorepo, prefer:

```txt
sandicts/
  apps/
    nodejs-sandicts-api/
    web-sandicts/
  docs/
    product/
    business-rules/
    api-contracts/
    decisions/
```

If frontend and backend are separate repositories, create a dedicated docs
repository:

```txt
sandicts-docs/
  product/
  business-rules/
  mvp/
  backlog/
  api-contracts/
  decisions/
```

## Ownership Rules

Shared docs should own:

- product context
- MVP and V2 scope
- business rules
- domain glossary
- product decisions
- cross-app API behavior expectations

Backend repo should own:

- backend architecture
- backend implementation patterns
- backend configuration
- backend logging and error handling
- generated OpenAPI source and backend API implementation

Frontend repo should own:

- frontend architecture
- UI/component decisions
- page-level UX implementation notes
- client state management

API contracts should come from the backend implementation whenever possible:

- Zod schemas define request and response contracts
- Swagger/OpenAPI is generated from those schemas
- frontend should consume or reference generated contracts rather than copying
  request/response shapes manually

## Migration Rule

When shared docs are introduced:

1. move product/business docs to the shared location
2. keep backend docs that are backend-specific in this repository
3. leave links or short pointers in the backend repo
4. do not maintain duplicate copies of the same product rules
5. update Codex/project context docs so future work reads the shared source
