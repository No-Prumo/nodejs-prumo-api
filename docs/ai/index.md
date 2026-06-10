# AI Context Index

Short catalog. Routing hints (`read-when`, `do-not-read-when`, `related`, `canonical`) live in each document’s YAML frontmatter.

| Document                                                                                                   | Role                                           |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [`docs/ai/api/error-handling-foundation.md`](api/error-handling-foundation.md)                             | Global HTTP error handling baseline            |
| [`docs/ai/api/zod-swagger-foundation.md`](api/zod-swagger-foundation.md)                                   | API validation and Swagger baseline            |
| [`docs/ai/architecture/authentication-session-pattern.md`](architecture/authentication-session-pattern.md) | Auth methods, sessions, and refresh tokens     |
| [`docs/ai/architecture/backend-architecture-overview.md`](architecture/backend-architecture-overview.md)   | Backend architecture source of truth           |
| [`docs/ai/architecture/controller-pattern.md`](architecture/controller-pattern.md)                         | Controller and HTTP boundary pattern           |
| [`docs/ai/architecture/external-integrations-pattern.md`](architecture/external-integrations-pattern.md)   | External gateway and webhook pattern           |
| [`docs/ai/architecture/module-pattern.md`](architecture/module-pattern.md)                                 | Nest feature module pattern                    |
| [`docs/ai/architecture/repository-pattern.md`](architecture/repository-pattern.md)                         | Repository port and Prisma adapter pattern     |
| [`docs/ai/architecture/use-case-pattern.md`](architecture/use-case-pattern.md)                             | Application use case pattern                   |
| [`docs/ai/business/sandicts-business-rules.md`](business/sandicts-business-rules.md)                       | Sandicts business rules and backend invariants |
| [`docs/ai/config/configuration-foundation.md`](config/configuration-foundation.md)                         | Backend config baseline, source of truth       |
| [`docs/ai/config/typescript-module-resolution.md`](config/typescript-module-resolution.md)                 | TypeScript/Nest module resolution decision     |
| [`docs/ai/ci-cd/ci-governance.md`](ci-cd/ci-governance.md)                                                 | Policy, source of truth                        |
| [`docs/ai/ci-cd/ci-operational-rules.md`](ci-cd/ci-operational-rules.md)                                   | Mechanical: regex, jobs, thresholds as in YAML |
| [`docs/ai/codex-skills-strategy.md`](codex-skills-strategy.md)                                             | Codex skills ownership and repository strategy |
| [`docs/ai/logging/logging-foundation.md`](logging/logging-foundation.md)                                   | Logging baseline with nestjs-pino              |
| [`docs/ai/product/sandicts-product-context.md`](product/sandicts-product-context.md)                       | Sandicts product context and MVP direction     |
| [`docs/ai/product/sandicts-mvp-scope.md`](product/sandicts-mvp-scope.md)                                   | Approved MVP scope and explicit exclusions     |
| [`docs/ai/product/sandicts-scope-checklist.md`](product/sandicts-scope-checklist.md)                       | Working checklist for MVP, V2, and backlog     |
| [`docs/ai/product/sandicts-v2-backlog.md`](product/sandicts-v2-backlog.md)                                 | V2 and later product backlog                   |
| [`docs/ai/product/shared-documentation-strategy.md`](product/shared-documentation-strategy.md)              | Shared product docs ownership decision         |

## Common AI Reading Paths

For a new feature module, read:

1. `docs/ai/product/sandicts-product-context.md`
2. `docs/ai/product/sandicts-mvp-scope.md`
3. `docs/ai/business/sandicts-business-rules.md`
4. `docs/ai/architecture/backend-architecture-overview.md`
5. `docs/ai/architecture/module-pattern.md`

For product scope decisions, read:

1. `docs/ai/product/sandicts-product-context.md`
2. `docs/ai/product/sandicts-mvp-scope.md`
3. `docs/ai/product/sandicts-v2-backlog.md`
4. `docs/ai/product/sandicts-scope-checklist.md`
5. `docs/ai/business/sandicts-business-rules.md`

For a new endpoint, read:

1. `docs/ai/architecture/controller-pattern.md`
2. `docs/ai/api/zod-swagger-foundation.md`
3. `docs/ai/architecture/use-case-pattern.md`
4. `docs/ai/api/error-handling-foundation.md`

For authentication work, read:

1. `docs/ai/architecture/authentication-session-pattern.md`
2. `docs/ai/architecture/controller-pattern.md`
3. `docs/ai/architecture/use-case-pattern.md`
4. `docs/ai/api/error-handling-foundation.md`

For persistence or providers, read:

1. `docs/ai/architecture/repository-pattern.md`
2. `docs/ai/architecture/external-integrations-pattern.md`
3. `docs/ai/logging/logging-foundation.md`

For Codex skills or AI operating instructions, read:

1. `docs/ai/codex-skills-strategy.md`
2. `.codex/skills/sandicts-project-context/SKILL.md`
