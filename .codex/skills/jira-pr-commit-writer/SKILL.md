---
name: jira-pr-commit-writer
description: Use when working in the Sandicts API repository and the user asks for a Jira task, issue text, task description, PR description, pull request body, commit message, release note, or a standard delivery summary after implementing or planning a change.
---

# Jira PR Commit Writer

## Purpose

Generate consistent Jira task drafts, pull request descriptions, and commit messages for Sandicts API work.

Use repository evidence first: the user request, changed files, `git diff`, `git status`, `docs/ai/index.md`, and any relevant source-of-truth document under `docs/ai/`.

When finishing a task, preparing commits, opening a PR, updating a PR title, or producing a delivery summary, read `docs/ai/task-finalization-workflow.md` first.

For Jira roadmap, backlog, Epic, Story, Task, Subtask, Bug, or issue-planning requests, read `docs/ai/product/sandicts-jira-planning-workflow.md` first. When frontend or fullstack Jira work is involved, also read `docs/frontend/sandicts-frontend-planning.md`; read `docs/frontend/sandicts-page-functional-spec.md` only when the issue depends on page, route, permission, or user-flow details. When the user asks for backlog planning instead of a single delivery artifact, follow that workflow and do not force PR description or commit message sections unless the user asks for them.

## Output Contract

Always return these sections in this order unless the user asks for only one artifact:

1. `Jira Task`
2. `PR Description`
3. `Commit Message`

Default language:

- Use English for all generated Jira titles, Jira descriptions, PR titles, PR descriptions, commit messages, release notes, and delivery summaries, even when the conversation is in another language.
- Only use another language when the user explicitly requests that language in the same message.
- Follow the repository PR template exactly for PR descriptions.
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

## PR Description

Always inspect and follow `.github/pull_request_template.md` before writing the PR description. Preserve the section names and order from the template exactly.

## PR Title

Use this format:

```text
[KAN-123] <type>(<scope>): <short summary>
```

Rules:

- Put the primary Jira key first.
- Use the same type vocabulary as commit messages.
- Use a scope when it improves scanning.
- If multiple Jira tasks are included, put the primary key in the title and list related keys in the PR body.
- Example: `[KAN-108] docs(process): define task finalization workflow`.

Current default project template:

```md
## Summary

<describe the PR change>

## Problem

<explain the bug, incorrect behavior, missing organization, or delivery problem>

## Root cause

<explain the cause identified in code, flow, docs, skills, or configuration>

## Changes

- <item 1>
- <item 2>
- <item 3>

## Files added or updated

- `path/to/file`
- `path/to/file`

## Impact

### Fixed

- <item>

### Not changed

- <item>

## Validation

- [ ] lint
- [ ] typecheck
- [ ] tests
- [ ] build
- [ ] dependency audit (CI: Dependency audit)
- [ ] manual validation completed

## Notes

- <relevant note>
```

Rules:

- PR descriptions must describe only the current PR/commit changes, not the full parent Jira task scope.
- Keep the template headings exactly as the repository defines them.
- For documentation-only changes, use `Problem` and `Root cause` to explain the documentation/workflow gap.
- Mark validation checkboxes as checked only for commands or manual validation actually completed.
- Leave unchecked any validations that were not run.
- Keep implementation details useful but not noisy.
- If the change modifies project rules, mention the updated `docs/ai/` or `.codex/skills/` file.
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
- Read relevant `docs/ai/` context when architecture, CI/CD, logging, config, API contracts, or business rules are involved.
- Separate facts from assumptions. Label assumptions explicitly when needed.
