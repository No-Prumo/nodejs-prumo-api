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
4. Treat `docs/ai/` documents marked as `source-of-truth` as the operational project baseline.
5. If code and `docs/ai/` disagree, surface the conflict and update the relevant document in the same change when the task changes the project rule.
6. When a change alters behavior, setup, commands, environment variables, API contracts, architecture, database models, auth/session behavior, logging, CI/CD, or docs links that `README.md` explicitly describes, update `README.md` in the same change or state why no README change is needed.
7. Keep `.codex/skills/` for Codex operating instructions and `docs/ai/` for durable project context and decisions.
8. When changing repository skills, validate the edited skill folder with the skill validation script when available.

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
- Avoid copying full project rules into this skill when a `docs/ai/` document already owns them.
- Prefer small, task-focused project skills over broad generic instructions when this repository needs new Codex behavior.
- Do not read long specs just because they are related; read them only when the task needs their detailed sections.

## Current Project Skills

- `sandicts-project-context`: route Codex to the correct repository context.
- `sandicts-business-rules`: maintain and apply Sandicts domain and MVP rules.
- `jira-pr-commit-writer`: generate Jira task drafts, PR descriptions, and commit messages.

## Current Project Docs

Use `docs/ai/index.md` as the canonical catalog and reading router.

Main roots:

- `docs/ai/`: durable backend, product, business-rule, API, CI/CD, and AI-routing context.
- `docs/frontend/`: pointer to frontend docs now owned by the sibling
  `sandicts/reactjs-sandicts-web` repository.
- Frontend planning, stack, page, screen, delivery, and discovery docs are
  canonical in `sandicts/reactjs-sandicts-web:docs/frontend`.
