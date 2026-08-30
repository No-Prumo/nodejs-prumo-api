---
name: jira-pr-commit-writer
description: Use when working in the Sandicts API repository and the user asks for a Jira task, issue text, task description, PR description, pull request body, commit message, release note, or a standard delivery summary after implementing or planning a change.
---

# Jira PR Commit Writer

## Purpose

Generate consistent Jira task drafts, pull request descriptions, and commit messages for Sandicts API work.

Use repository evidence first: the user request, changed files, `git diff`, `git status`, `docs/ai/index.md`, and any relevant source-of-truth document in either backend `docs/ai/` or shared `fradelli/sandicts-docs`.

When finishing a task, preparing commits, opening a PR, updating a PR title, or
producing a delivery summary, read `docs/ai/task-finalization-workflow.md` and
`fradelli/sandicts-docs:docs/ai/pull-request-standard.md` first.

For Jira roadmap, backlog, Epic, Story, Task, Subtask, Bug, or issue-planning requests, read `fradelli/sandicts-docs:docs/product/sandicts-jira-planning-workflow.md` first. When frontend or fullstack Jira work is involved, read the canonical frontend planning docs from the sibling `fradelli/reactjs-sandicts-web` repository, especially `fradelli/reactjs-sandicts-web:docs/frontend/sandicts-frontend-planning.md`; read `fradelli/reactjs-sandicts-web:docs/frontend/sandicts-page-functional-spec.md` only when the issue depends on page, route, permission, or user-flow details. When the user asks for backlog planning instead of a single delivery artifact, follow that workflow and do not force PR description or commit message sections unless the user asks for them.

## Output Contract

Always return these sections in this order unless the user asks for only one artifact:

1. `Jira Task`
2. `PR Description`
3. `Commit Message`

Default language:

- Use English for all generated Jira titles, Jira descriptions, PR titles, PR descriptions, commit messages, release notes, and delivery summaries, even when the conversation is in another language.
- Only use another language when the user explicitly requests that language in the same message.
- Follow the repository PR template and
  `fradelli/sandicts-docs:docs/ai/pull-request-standard.md` exactly for PR
  descriptions.
- Follow the Jira task template in this skill exactly for Jira descriptions.

Copy/paste formatting:

- When the user asks for PR text, a PR description, a commit message, a Jira description, or any similar paste-ready artifact, return the requested artifact inside a fenced code block.
- Use `md` for PR and Jira descriptions, and `text` for commit messages.
- If returning multiple artifacts, keep the section labels outside the fences and put each artifact in its own fenced block.
- Do not add explanatory prose inside the fenced artifact unless it belongs in the artifact itself.

## Jira Task

Do not claim that a Jira issue was created unless a Jira connector/tool actually created it. When no Jira key exists, provide a draft that can be pasted into Jira.

Use this structure exactly. Use plain Jira-friendly headings and keep this order:

```md
Type: Task
Title: [Backend] <short action-oriented title>

Summary

<one concise sentence describing the parent task or delivery goal>

Context

<explain the current project situation, including existing docs, skills, agents metadata, or workflow context when relevant>

Goal

<explain the target organization or expected end state>

Scope

- <included area 1>
- <included area 2>

How it works

- <describe how the docs, skills, agents metadata, code, or workflow should operate after the task>
- <include relationships between folders when relevant>

Acceptance criteria

- <observable criterion 1>
- <observable criterion 2>
- <observable criterion 3>

Technical notes

- <relevant files, directories, modules, commands, or docs>

Out of scope

- <what this task does not cover>
```

Rules:

- Use this Jira structure for parent tasks and implementation tasks.
- For a parent documentation/skills task, describe the whole intended operating model, not only the files changed in the current PR.
- Use `Bug` instead of `Task` only when the Jira issue is specifically about broken behavior.
- Keep the title action-oriented and concise.
- Make acceptance criteria observable and testable.
- Include links or paths to relevant docs when they materially affect the task.
- Do not include secrets, tokens, credentials, local machine paths, or private details.

## PR Title

Use this format:

```text
[KAN-123] <type>(<scope>): <short summary>
```

Rules:

- Put the primary Jira key first.
- The primary Jira key must be the first characters in the PR title.
- Never use `[codex]`, a branch name, or a title without a Jira key.
- If a generic publishing tool suggests another title, override it with this
  Sandicts format before opening or updating the PR.
- Do not rely on `gh pr create --fill` or optional connector fields to infer a
  compliant PR title.
- Follow the same PR title format in every Sandicts repository.
- Use the same type vocabulary as commit messages.
- Use a scope when it improves scanning.
- If multiple Jira tasks are included, put the primary key in the title and list related keys in the PR body.
- Example: `[KAN-108] docs(process): define task finalization workflow`.

## PR Description

Always inspect `.github/pull_request_template.md` and preserve the template
headings and order exactly.

Use the same PR body structure across Sandicts repositories. Repository-specific
differences belong in the `Validation` and `Notes` sections, not in a different
template shape.

Never create or leave a PR with a blank body, omitted body, raw template
placeholders, or a shortened alternative body.

Backend validation defaults:

- docs-only: `git diff --check`
- backend app/API: `npm run typecheck`, `npm run test:ci`,
  `npm run lint:ci`, `npm run build`
- dependency/security: run the repository dependency audit command or document
  why it was not applicable
- smoke validation: run when the task changes public API contracts,
  Swagger/OpenAPI, auth/session behavior, or startup-sensitive configuration

Rules:

- PR descriptions must describe only the current PR/commit changes, not the full parent Jira task scope.
- Keep the template headings exactly as the repository defines them.
- For documentation-only changes, use `Problem` and `Root cause` to explain the documentation/workflow gap.
- Mark validation checkboxes as checked only for commands or manual validation actually completed.
- Leave unchecked any validations that were not run.
- Keep implementation details useful but not noisy.
- If the change modifies project rules, mention the updated owning document in backend `docs/ai/`, shared `fradelli/sandicts-docs`, or `.codex/skills/`.
- If there are known gaps, call them out under `Notes` or the most relevant template section.

## Commit Message

Use Conventional Commits:

```text
<type>(<scope>): <short summary>
```

Types:

- `feat`: user-visible behavior or capability
- `fix`: bug fix
- `refactor`: code restructuring without behavior change
- `docs`: documentation-only change
- `test`: test-only change
- `ci`: CI/CD change
- `chore`: repository maintenance

Scopes:

- Prefer concrete project areas such as `api`, `config`, `logging`, `ci`, `docs`, `skills`, `business`, `product`, or the affected domain/module.
- Omit the scope only when no clear scope exists.

Rules:

- Use imperative mood.
- Keep the first line under 72 characters when practical.
- The PR title carries the Jira key by default.
- Do not include a Jira key in a commit unless the user explicitly asks for it, the key is part of the requested commit style, or the commit will be consumed outside the PR context.

## Evidence Checklist

Before generating final text:

- Inspect `git status --short` and `git diff --stat` when changes exist locally.
- Inspect relevant file diffs when the task depends on exact implementation details.
- Read relevant backend `docs/ai/` context for architecture, CI/CD, logging, config, or API contracts.
- Read relevant `fradelli/sandicts-docs` context for product scope, Jira planning, entity naming, or business rules.
- Separate facts from assumptions. Label assumptions explicitly when needed.
