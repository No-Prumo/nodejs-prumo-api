---
name: sandicts-business-rules
description: Use when working in the Sandicts API repository and the task involves documenting, reviewing, updating, or implementing Sandicts business rules for reservations, court availability, open matches, tournaments, payments, delinquency, partner management, marketplace MVP scope, or backend/API behavior tied to product decisions.
---

# Sandicts Business Rules

## Purpose

Keep Sandicts domain rules consistent across product documentation, backend behavior, API contracts, and error handling.

This skill is the Codex operating workflow. The source of truth is the repository documentation under `docs/ai/`.

## Required Context

Read these files when the task touches Sandicts business behavior:

- `docs/ai/business/sandicts-business-rules.md`
- `docs/ai/product/sandicts-product-context.md`
- `docs/ai/api/error-handling-foundation.md` when mapping business failures to API errors
- `docs/ai/api/zod-swagger-foundation.md` when changing request/response contracts

## Workflow

1. Identify whether the task is backend/domain, frontend-only, or mixed product scope.
2. Read the required context files before changing rules, API behavior, or backend implementation.
3. Treat `docs/ai/business/sandicts-business-rules.md` as the canonical backend-facing rule document.
4. Keep rules operational: affected entity, allowed state, forbidden transition, and expected API error when relevant.
5. Separate current MVP decisions from future options such as Web3, advanced rankings, recommendation engines, or partner ERP.
6. Preserve uncertain rules as open questions instead of inventing hidden policy.
7. When implementation changes a business rule, update the relevant `docs/ai/` document in the same change.

## Rule Style

Prefer direct rules:

- "A confirmed reservation blocks a court slot."
- "A player cannot join the same open match twice."
- "Tournament registration is allowed only while status is `open`."

Avoid weak or speculative rules:

- "The system may probably prevent conflicts."
- "Users should maybe see some kind of status."

## Error Guidance

Map expected backend failures consistently:

- invalid input shape: `validation_error`
- valid input that violates domain policy: `business_rule_violation`
- missing entity: `resource_not_found`
- cross-partner access: `forbidden`
- unexpected infrastructure/provider failure: `internal_error`

Use `AppError` for expected application/domain failures in the NestJS backend.

## Boundaries

- Do not duplicate the full business-rule catalog inside this skill.
- Do not create backend rules from frontend preference alone.
- Do not store secrets, credentials, provider tokens, or local machine details in business-rule docs or skills.
- Do not make blockchain/Web3 a dependency of core booking, payment, or tournament flows unless the user explicitly changes MVP scope.
