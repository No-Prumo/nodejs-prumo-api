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
3. Treat `docs/ai/` documents marked as `source-of-truth` as the operational project baseline.
4. If code and `docs/ai/` disagree, surface the conflict and update the relevant document in the same change when the task changes the project rule.
5. Keep `.codex/skills/` for Codex operating instructions and `docs/ai/` for durable project context and decisions.

## Boundaries

- Do not store tokens, credentials, secrets, private config, local absolute paths, or personal preferences in this repository.
- Keep personal and generic skills outside this repository.
- Avoid copying full project rules into this skill when a `docs/ai/` document already owns them.
- Prefer small, task-focused project skills over broad generic instructions when this repository needs new Codex behavior.

## Current Project Skills

- `sandicts-project-context`: route Codex to the correct repository context.
- `sandicts-business-rules`: maintain and apply Sandicts domain and MVP rules.
- `jira-pr-commit-writer`: generate Jira task drafts, PR descriptions, and commit messages.

## Current Project Docs

- `docs/ai/api/error-handling-foundation.md`
- `docs/ai/api/zod-swagger-foundation.md`
- `docs/ai/business/sandicts-business-rules.md`
- `docs/ai/config/configuration-foundation.md`
- `docs/ai/config/typescript-module-resolution.md`
- `docs/ai/ci-cd/ci-governance.md`
- `docs/ai/ci-cd/ci-operational-rules.md`
- `docs/ai/logging/logging-foundation.md`
- `docs/ai/product/sandicts-product-context.md`
- `docs/ai/codex-skills-strategy.md`
