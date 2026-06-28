---
title: AI Context Index
doc-type: ai-routing-index
role: routing-index
priority: high
canonical: docs/ai/index.md
scope: ai-routing, docs, skills, context-selection
read-when:
  - starting any Sandicts AI-assisted task
  - deciding which project docs to read
  - auditing docs or skills for AI context usage
do-not-read-when:
  - a more specific repository skill has already selected the exact docs needed
---

# AI Context Index

Short catalog. Routing hints (`read-when`, `do-not-read-when`, `related`, `canonical`) live in each document's YAML frontmatter.

## Reading Rules

- Start with this index or a repository skill, then open only docs whose `read-when` entries match the task.
- Prefer smaller context docs before large functional specs.
- Treat discovery docs as historical input unless the task explicitly asks for legacy comparison.
- Read long page, screen, roadmap, or Jira specs only when the task depends on their detailed sections.
- Do not load every related document just because it is listed in frontmatter.

| Document                                                                                                   | Role                                                        |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`docs/ai/api/error-handling-foundation.md`](api/error-handling-foundation.md)                             | Global HTTP error handling baseline                         |
| [`docs/ai/api/semantic-api-contracts.md`](api/semantic-api-contracts.md)                                   | Semantic statuses, public errors, and OpenAPI drift rules   |
| [`docs/ai/api/zod-swagger-foundation.md`](api/zod-swagger-foundation.md)                                   | API validation and Swagger baseline                         |
| [`docs/ai/architecture/authentication-session-pattern.md`](architecture/authentication-session-pattern.md) | Auth methods, sessions, and refresh tokens                  |
| [`docs/ai/architecture/backend-architecture-overview.md`](architecture/backend-architecture-overview.md)   | Backend architecture source of truth                        |
| [`docs/ai/architecture/code-style-pattern.md`](architecture/code-style-pattern.md)                         | Code style, semantic constants, and magic number rules      |
| [`docs/ai/architecture/controller-pattern.md`](architecture/controller-pattern.md)                         | Controller and HTTP boundary pattern                        |
| [`docs/ai/architecture/external-integrations-pattern.md`](architecture/external-integrations-pattern.md)   | External gateway and webhook pattern                        |
| [`docs/ai/architecture/module-pattern.md`](architecture/module-pattern.md)                                 | Nest feature module pattern                                 |
| [`docs/ai/architecture/repository-pattern.md`](architecture/repository-pattern.md)                         | Repository port and Prisma adapter pattern                  |
| [`docs/ai/architecture/transactional-email-provider-decision.md`](architecture/transactional-email-provider-decision.md) | Resend/Mailpit decision for magic link email delivery       |
| [`docs/ai/architecture/use-case-pattern.md`](architecture/use-case-pattern.md)                             | Application use case pattern                                |
| [`docs/ai/business/README.md`](business/README.md)                                               | Pointer to shared Sandicts business rules                   |
| [`docs/ai/config/configuration-foundation.md`](config/configuration-foundation.md)                         | Backend config baseline, source of truth                    |
| [`docs/ai/config/typescript-module-resolution.md`](config/typescript-module-resolution.md)                 | TypeScript/Nest module resolution decision                  |
| [`docs/ai/testing/test-organization.md`](testing/test-organization.md)                                     | Test fixtures, builders, and helper placement               |
| [`docs/ai/ci-cd/ci-governance.md`](ci-cd/ci-governance.md)                                                 | Policy, source of truth                                     |
| [`docs/ai/ci-cd/ci-operational-rules.md`](ci-cd/ci-operational-rules.md)                                   | Mechanical: regex, jobs, thresholds as in YAML              |
| [`docs/ai/ci-cd/security-audit-remediation.md`](ci-cd/security-audit-remediation.md)                       | Dependency vulnerability remediation workflow               |
| [`docs/ai/codex-skills-strategy.md`](codex-skills-strategy.md)                                             | Codex skills ownership and repository strategy              |
| [`docs/ai/task-finalization-workflow.md`](task-finalization-workflow.md)                                   | Task finish, commit, and PR title workflow                  |
| [`docs/ai/logging/logging-foundation.md`](logging/logging-foundation.md)                                   | Logging baseline with nestjs-pino                           |
| [`docs/ai/product/README.md`](product/README.md)                                                 | Pointer to shared product, scope, glossary, and Jira docs   |
| [`docs/frontend/README.md`](../frontend/README.md)                                                         | Pointer to frontend docs in `sandicts/reactjs-sandicts-web` |

## Common AI Reading Paths

Shared Sandicts docs live in the sibling `sandicts-docs` repository. Use these
repository locators when product, scope, glossary, Jira, or business-rule
context is needed:

- `sandicts/sandicts-docs:docs/ai/index.md`
- `sandicts/sandicts-docs:docs/glossary/domain-glossary.md`
- `sandicts/sandicts-docs:docs/product/sandicts-product-context.md`
- `sandicts/sandicts-docs:docs/product/sandicts-mvp-scope.md`
- `sandicts/sandicts-docs:docs/business-rules/sandicts-business-rules.md`

For a new feature module, read:

1. `sandicts/sandicts-docs:docs/product/sandicts-product-context.md`
2. `sandicts/sandicts-docs:docs/product/sandicts-mvp-scope.md`
3. `sandicts/sandicts-docs:docs/business-rules/sandicts-business-rules.md`
4. `docs/ai/architecture/backend-architecture-overview.md`
5. `docs/ai/architecture/module-pattern.md`

For product scope decisions, read:

1. `sandicts/sandicts-docs:docs/product/sandicts-product-context.md`
2. `sandicts/sandicts-docs:docs/product/sandicts-mvp-scope.md`
3. `sandicts/sandicts-docs:docs/product/sandicts-v2-backlog.md`
4. `sandicts/sandicts-docs:docs/product/sandicts-scope-checklist.md`
5. `sandicts/sandicts-docs:docs/business-rules/sandicts-business-rules.md`

For Jira roadmap, backlog, or issue planning, read:

1. `sandicts/sandicts-docs:docs/product/sandicts-product-context.md`
2. `sandicts/sandicts-docs:docs/product/sandicts-mvp-scope.md`
3. `sandicts/sandicts-docs:docs/product/sandicts-jira-planning-workflow.md`
4. `sandicts/reactjs-sandicts-web:docs/frontend/sandicts-mvp-delivery-roadmap.md` when frontend or fullstack sequencing is involved
5. `sandicts/reactjs-sandicts-web:docs/frontend/sandicts-page-functional-spec.md` only when the issue depends on page, route, permission, or user-flow details
6. `sandicts/sandicts-docs:docs/business-rules/sandicts-business-rules.md` only when the issue changes product/business behavior

For frontend planning, read:

1. `sandicts/reactjs-sandicts-web:docs/frontend/sandicts-frontend-context.md`
2. `sandicts/reactjs-sandicts-web:docs/frontend/sandicts-frontend-tech-decisions.md`
3. `sandicts/reactjs-sandicts-web:docs/frontend/sandicts-frontend-planning.md`
4. `sandicts/reactjs-sandicts-web:docs/frontend/sandicts-mvp-delivery-roadmap.md`
5. `sandicts/sandicts-docs:docs/product/sandicts-product-context.md`
6. `sandicts/sandicts-docs:docs/product/sandicts-mvp-scope.md`
7. `sandicts/reactjs-sandicts-web:docs/frontend/sandicts-page-functional-spec.md` only for page inventory, routes, permissions, or flow behavior
8. `sandicts/reactjs-sandicts-web:docs/frontend/sandicts-mvp-screens-spec.md` only for Figma or detailed screen-state work
9. `sandicts/sandicts-docs:docs/product/sandicts-jira-planning-workflow.md` only when creating or editing Jira issues

For a new endpoint, read:

1. `docs/ai/architecture/controller-pattern.md`
2. `docs/ai/api/semantic-api-contracts.md`
3. `docs/ai/api/zod-swagger-foundation.md`
4. `docs/ai/architecture/use-case-pattern.md`
5. `docs/ai/api/error-handling-foundation.md`

For authentication work, read:

1. `docs/ai/architecture/authentication-session-pattern.md`
2. `docs/ai/architecture/transactional-email-provider-decision.md` when changing magic link email delivery
3. `docs/ai/architecture/controller-pattern.md`
4. `docs/ai/architecture/use-case-pattern.md`
5. `docs/ai/api/error-handling-foundation.md`
6. `docs/ai/testing/test-organization.md` when adding or changing auth tests

For persistence or providers, read:

1. `docs/ai/architecture/repository-pattern.md`
2. `docs/ai/architecture/external-integrations-pattern.md`
3. `docs/ai/logging/logging-foundation.md`

For Codex skills or AI operating instructions, read:

1. `docs/ai/codex-skills-strategy.md`
2. `.codex/skills/sandicts-project-context/SKILL.md`

For finishing a Jira task, committing, or opening a PR, read:

1. `docs/ai/task-finalization-workflow.md`
2. `sandicts/sandicts-docs:docs/ai/pull-request-standard.md`
3. `.codex/skills/jira-pr-commit-writer/SKILL.md`
4. `.github/pull_request_template.md`

For dependency audit failures or vulnerability remediation, read:

1. `docs/ai/ci-cd/security-audit-remediation.md`
2. `docs/ai/ci-cd/ci-governance.md`
3. `docs/ai/ci-cd/ci-operational-rules.md`
4. `docs/ai/task-finalization-workflow.md`
