---
name: sandicts-project-context
description: Use when working in the Sandicts API repository and needing project-specific Codex context for architecture, API contracts, validation, error handling, logging, configuration, CI/CD, product/business rules, tests, debugging, pull requests, reviews, or changes to docs/ai or .codex/skills.
---

# Sandicts Project Context

## Purpose

Use this skill as the project-specific entry point for Codex work in this repository.

The canonical project context lives in `docs/ai/index.md` and the documents linked from it. This skill should route Codex to the right project documents without duplicating their content.

## Workflow

1. Start with `docs/ai/index.md` when the task touches architecture, API behavior, validation, errors, logging, configuration, CI/CD, product rules, or business rules.
2. Read only the documents whose frontmatter `read-when` entries match the current task.
3. Prefer smaller context docs before large functional, screen, roadmap, or Jira specs.
4. Treat backend `docs/ai/` source-of-truth documents as the backend implementation baseline.
5. Treat `fradelli/sandicts-docs` as the source of truth for shared product, entity, scope, Jira, and business-rule context.
6. If code and docs disagree, surface the conflict and update the owning document in the same change when the task changes the rule.
7. When a change alters behavior, setup, commands, environment variables, API contracts, architecture, database models, auth/session behavior, logging, CI/CD, or docs links that `README.md` explicitly describes, update `README.md` in the same change or state why no README change is needed.
8. Keep `.codex/skills/` for Codex operating instructions and `docs/ai/` for durable backend context and decisions.
9. Keep shared product and business-rule content in `fradelli/sandicts-docs`, not duplicated in this repository.
10. When changing repository skills, validate the edited skill folder with the skill validation script when available.
11. For dependency audit failures or vulnerability remediation, read `docs/ai/ci-cd/security-audit-remediation.md`.

## Jira Task Collaboration Contract

When the user asks Codex to work on a Jira issue in this repository or in the
Sandicts frontend repository, follow this collaboration sequence:

1. Inspect the Jira issue and relevant project docs.
2. Evaluate whether the issue is ready and aligned with architecture and scope.
3. Produce an execution plan and stop.
4. Start code changes only after the user explicitly authorizes implementation.
5. After implementation and validation, stop before commit, push, PR creation,
   or Jira transition so the user can review the local code.
6. Commit, push, open or update a PR, and move Jira only after the user gives
   explicit approval for that delivery step.

Do not infer approval for later delivery steps from implementation approval.
Treat planning approval, implementation approval, and PR/Jira approval as
separate gates.

Use these exact Portuguese trigger phrases when the user asks how to start each
gate:

- Planning: `Planeje a task KAN-XXX.`
- Implementation: `Aprovado: implemente o plano da KAN-XXX.`
- Delivery: `Aprovado: pode commitar, subir PR e mover a KAN-XXX para In Review.`

## Type Placement Contract

For Sandicts backend and frontend work, keep executable implementation and
module-specific type contracts separated:

- put use case request/response types, helper option types, adapter record
  shapes, service contracts, and component/view model types in sibling
  `.types.ts` files
- do not declare those types in the same file as the function, class, hook, or
  component that uses them
- files whose primary purpose is a type contract, such as repository ports or
  domain type catalogs, may contain types directly

## Error Handling Contract

For Sandicts backend work:

- prefer reusable module-level error factories over inline local error factory
  functions when an error can be reused
- return the most specific safe public error `code` so frontend code can handle
  exact failure cases
- centralize repeated internal `details.reason` values as module-level
  constants and reuse domain catalogs for repeated values such as auth providers
- keep raw tokens, cookies, provider credentials, and storage internals out of
  public responses and log details
- include safe internal `details` in `AppError` for pino logs and future
  observability tooling

## Import Alias Contract

For Sandicts backend work:

- keep sibling files, including `.types.ts`, on relative imports
- prefer approved `tsconfig.json` path aliases for frequently imported roots
  such as `@config`, `@shared/*`, `@infra/*`, `@generated/*`, `@auth/*`, and
  `@test-support/*`
- keep `tsc-alias` in the backend build path when production source uses these
  aliases
- validate typecheck, tests, lint, and build after alias changes

## Test Organization Contract

For Sandicts backend tests:

- keep `makeSut()` local when it clarifies a spec-specific dependency graph
- extract repeated fixtures and config builders to `test/support/`
- prefer builders over exported mutable fixture objects
- do not import `@test-support/*` from production `src/**/*.ts` files

## Semantic Constant Contract

For Sandicts backend and frontend work:

- avoid inline numeric literals when the value represents a domain rule, unit
  conversion, timeout, TTL, byte length, rate limit, status threshold, layout
  implementation value, or validation boundary
- prefer semantic constants or small helpers such as `millisecondsPerSecond`,
  `addSeconds(...)`, `minimumGoogleIdTokenLength`, or `sandictsMarkSizePx`
- keep obvious `0` and `1` counters, Tailwind utility scale classes, package
  versions, generated code, and literal fixture data inline when extraction
  would reduce readability
- document repeated conventions in
  `docs/ai/architecture/code-style-pattern.md`

## HTTP Decorator Contract

For Sandicts backend controllers:

- create reusable decorators for repeated, semantic HTTP metadata such as a
  required Bearer access token header
- keep one-off Swagger metadata in the controller
- place module-specific decorators in the module HTTP `shared/` folder until
  multiple modules use the same contract

## Security Audit Remediation Contract

For Sandicts backend dependency vulnerability fixes:

- reproduce the CI audit locally with `npm audit --audit-level=moderate`
- identify dependency paths with `npm explain <package>`
- prefer targeted non-breaking updates or `overrides` over broad forced fixes
- document the vulnerable packages, chosen fix, and validation in both the PR and
  Jira
- keep dependency remediation commits separate from unrelated code or docs
  commits whenever possible

## Jira Fast Path

When the user provides a concrete Jira key such as `KAN-61`, avoid broad Rovo
Search as the first step.

Use the direct Jira path instead:

1. get accessible Atlassian resources and use the `sandicts.atlassian.net`
   cloud id
2. call the direct Jira issue tool for the known key
3. use JQL only when a Jira list, parent issue set, or filtered backlog is
   needed
4. use direct transition/comment tools for approved status or comment updates

Use Rovo Search only for open-ended Jira/Confluence discovery where the target
issue, page, or JQL filter is not already known.

## Boundaries

- Do not store tokens, credentials, secrets, private config, local absolute paths, or personal preferences in this repository.
- Keep personal and generic skills outside this repository.
- Avoid copying full project rules into this skill when backend `docs/ai/` or shared `fradelli/sandicts-docs` already owns them.
- Prefer small, task-focused project skills over broad generic instructions when this repository needs new Codex behavior.
- Do not read long specs just because they are related; read them only when the task needs their detailed sections.

## Current Project Skills

- `sandicts-project-context`: route Codex to the correct repository context.
- `sandicts-business-rules`: maintain and apply Sandicts domain and MVP rules.
- `jira-pr-commit-writer`: generate Jira task drafts, PR descriptions, and commit messages.

## Current Project Docs

Use `docs/ai/index.md` as the canonical catalog and reading router.

Main roots:

- `docs/ai/`: durable backend architecture, API, config, CI/CD, testing, and AI-routing context.
- `fradelli/sandicts-docs:docs/`: shared product, business-rule, glossary, scope, and Jira planning context.
- `docs/frontend/`: pointer to frontend docs now owned by the sibling
  `fradelli/reactjs-sandicts-web` repository.
- Frontend planning, stack, page, screen, delivery, and discovery docs are
  canonical in `fradelli/reactjs-sandicts-web:docs/frontend`.
