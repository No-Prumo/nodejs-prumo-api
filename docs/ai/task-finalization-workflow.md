---
title: Task Finalization Workflow
doc-type: delivery-workflow
role: source-of-truth
priority: high
canonical: docs/ai/task-finalization-workflow.md
related:
  - sandicts/sandicts-docs:docs/ai/pull-request-standard.md
  - .codex/skills/jira-pr-commit-writer/SKILL.md
  - .github/pull_request_template.md
  - docs/ai/ci-cd/ci-governance.md
  - docs/ai/ci-cd/security-audit-remediation.md
scope: git, github, jira, commits, pull-requests, task-finalization
read-when:
  - finishing a Jira task
  - preparing commits for a completed task
  - opening or updating a pull request
  - writing a PR title, PR description, commit message, or delivery summary
  - auditing GitHub pull request naming conventions
do-not-read-when:
  - planning Jira backlog before implementation
  - changing product or business rules without preparing a commit or PR
---

# Task Finalization Workflow

## Purpose

Define the standard Sandicts workflow for finishing a Jira task, committing the
right files, and opening a pull request with a clear Jira link.

This document is the source of truth for end-of-task delivery conventions.

## Finalization Checklist

Before committing:

1. Identify the active Jira key and intended delivery scope.
2. Confirm the user has reviewed the local implementation and explicitly
   approved commit, push, PR, and Jira delivery.
3. Check the current branch name.
4. Inspect `git status --short`.
5. Inspect `git diff --stat`.
6. Inspect relevant file diffs when the change is not trivial.
7. Confirm changed files belong to the active task.
8. Leave unrelated user or local changes unstaged.
9. Run validation that matches the risk of the change.
10. Stage only the files that belong to the task.
11. Commit with the standard commit message format.
12. Push the branch.
13. Open or update the pull request and enable delete branch after merge.
14. Watch CI until the relevant checks finish.
15. Move delivered Jira issue(s) to `In Review`.

If unrelated local changes are present, do not include them in the commit. Ask
for direction only when the unrelated changes block the task.

## Human Review Gate

After implementation and local validation, Codex must stop and report what
changed, what validation ran, and what still needs review. Do not stage,
commit, push, open a pull request, or move Jira to `In Review` until the user
explicitly approves that delivery step.

Preferred approval phrase:

```text
Implementation approved. Commit, push, open the PR, and move KAN-123 to In Review.
```

If the user approves only part of the delivery, do only that part.

## Branch Rule

Use the project branch naming policy from `docs/ai/ci-cd/ci-governance.md`.

Preferred human branch examples:

- `feature/KAN-123-create-login-flow`
- `fix/KAN-123-correct-timeout`
- `docs/KAN-123-update-api-docs`
- `ci/KAN-123-update-pr-checks`

Preferred Codex branch example:

- `codex/KAN-123-task-finalization-workflow`

## Commit Message Standard

Use Conventional Commits:

```text
<type>(<scope>): <imperative summary>
```

Examples:

```text
docs(process): define task finalization workflow
ci: allow codex Jira branch prefix
feat(auth): implement magic link authentication
fix(auth): reject expired magic links
refactor(api): reorganize controller schemas
test(auth): add refresh token coverage
```

Allowed types:

- `feat`: user-visible behavior or capability
- `fix`: bug fix
- `refactor`: code restructuring without behavior change
- `docs`: documentation-only change
- `test`: test-only change
- `ci`: CI/CD change
- `chore`: repository maintenance

Scope rules:

- Prefer concrete scopes such as `auth`, `api`, `config`, `ci`, `docs`,
  `process`, `skills`, `frontend`, `product`, or `business`.
- Omit the scope only when there is no clear useful scope.
- Keep the first line under 72 characters when practical.
- Use imperative mood.

Jira key rule:

- The pull request title must carry the Jira key.
- Regular commit messages can omit the Jira key when the branch or PR title
  already carries it.
- Include the Jira key in a commit only when the user explicitly asks for it or
  when the commit is intentionally consumed outside the PR context.

## Pull Request Title Standard

Follow `sandicts/sandicts-docs:docs/ai/pull-request-standard.md`.

Use the Jira key first:

```text
[KAN-123] <type>(<scope>): <short summary>
```

Examples:

```text
[KAN-108] docs(process): define task finalization workflow
[KAN-107] docs(planning): organize MVP docs and AI routing
[KAN-40] feat(auth): implement Google Sign-In and One Tap
[KAN-44] refactor(api): reorganize initial API structure
[KAN-35] chore(security): fix PostCSS vulnerability CVE-2026-41305
```

Rules:

- Put the primary Jira key at the start of the title.
- The primary Jira key must be the first characters in the title.
- Never open or leave a Sandicts PR titled with `[codex]`, only a branch name,
  or no Jira key.
- If a publishing helper or GitHub UI proposes a different title, rewrite it to
  the Sandicts format before creating the PR.
- Do not rely on `gh pr create --fill` or optional connector fields to infer a
  compliant PR title.
- Use the same title format in the frontend, backend, and shared docs
  repositories.
- Use the same type vocabulary as commit messages.
- Use a clear scope when it helps scanning.
- Use lowercase summaries except for product names, acronyms, and proper nouns.
- If a PR includes multiple Jira tasks, put the primary key in the title and
  list related Jira keys in the PR body.
- Do not use branch names as PR titles.

## Pull Request Description Standard

Follow `sandicts/sandicts-docs:docs/ai/pull-request-standard.md` and always
use `.github/pull_request_template.md`.

Rules:

- Keep the template headings and order unchanged.
- Describe only the current PR changes, not the full parent epic.
- Mark validation checkboxes only for commands or checks that actually ran.
- Include the primary Jira key and related Jira keys under `Notes`.
- Confirm GitHub is set to delete the source branch after the PR is merged.
- Mention known gaps, skipped validations, or docs-only rationale explicitly.
- Update the PR body if the scope changes after opening the PR.
- Keep the same PR body section structure across Sandicts repositories.
  Repository-specific differences belong in `Validation` and `Notes`.
- Do not create or leave a PR with a blank body, omitted body, raw placeholders,
  or a shortened alternative body.

## Validation Rule

Validation should match risk:

- Backend docs-only: run `git diff --check` and inspect rendered or structured
  docs when relevant.
- Skills/docs affecting agent behavior: verify routing metadata and read paths.
- Backend API, application, auth, persistence, or config behavior: run
  `npm run typecheck`, `npm run test:ci`, `npm run lint:ci`, and
  `npm run build`.
- Swagger/OpenAPI or startup-sensitive changes: add a smoke check when
  practical.
- Security/dependency changes: run the repository dependency audit command or
  document why it was not applicable.
- Frontend repository changes: follow
  `sandicts/reactjs-sandicts-web:docs/ai/task-finalization-workflow.md`.
- Shared docs repository changes: run `git diff --check` and inspect changed
  docs or skill metadata; do not mark lint, typecheck, tests, build, or
  dependency audit complete unless that repository has those commands configured
  and they actually ran.

Do not mark a validation as complete in the PR unless it actually ran.

## Security Remediation Rule

When a task fixes dependency vulnerabilities, follow
`docs/ai/ci-cd/security-audit-remediation.md`.

Rules:

- keep dependency vulnerability remediation in a separate commit whenever
  possible
- document the vulnerable package, dependency path, chosen fix, and validation in
  both the PR and the related Jira issue
- prefer targeted non-breaking updates or overrides before broad forced audit
  fixes
- do not weaken the audit threshold or remove the dependency audit job

## Jira Status Rule

After the pull request is opened or updated for the delivered work, move the
primary Jira task to `In Review`.

Rules:

- Only move Jira to `In Review` after the user explicitly approves delivery.
- Move every Jira issue actually delivered by the PR to `In Review`.
- If a PR references multiple Jira issues, only move the issues whose scope is
  implemented, documented, or otherwise completed by that PR.
- Leave follow-up, next-batch, or planning-only issues in their current workflow
  status unless the user explicitly asks to move them.
- Do not move the issue to `Concluído`; that happens only after review and
  merge are complete.
- Mention the Jira status move in the final delivery summary.

## Historical PR Titles

Closed PR titles can be normalized when explicitly requested. Do not rewrite
historical PR titles silently as part of unrelated work.
