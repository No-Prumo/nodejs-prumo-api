---
title: CI Governance
doc-type: policy
role: source-of-truth
priority: high
canonical: docs/ai/ci-cd/ci-governance.md
related:
  - docs/ai/ci-cd/ci-operational-rules.md
use-together-with:
  - docs/ai/ci-cd/ci-operational-rules.md
scope: github-actions, pull-requests, branch-policy
read-when:
  - editing files under .github/workflows
  - changing CI validation logic
  - changing branch or pull request governance
do-not-read-when:
  - changing only application business logic
  - changing only UI or backend features unrelated to CI
---

# CI Governance

## Purpose

Source of truth for:

- protected branches
- branch naming
- pull request validation
- CI required checks

If workflow code conflicts with this document, this document wins unless the user explicitly requests otherwise.

---

## Repository baseline

CI platform:

- GitHub Actions

Protected branches:

- `developer`
- `staging`
- `main`

Technical baseline:

- Node.js 22
- npm
- single repository

---

## Protected branch policy

The following rules apply to:

- `developer`
- `staging`
- `main`

Rules:

- direct push is forbidden
- changes must arrive only through pull requests
- required status checks must pass before merge
- squash merge only

CI does not replace branch protection / rulesets.
GitHub rulesets must enforce push and merge restrictions.

---

## Allowed branch names

Allowed branch formats:

- `feature/KAN-123-short-description`
- `fix/KAN-123-short-description`
- `hotfix/KAN-123-short-description`
- `chore/KAN-123-short-description`
- `rc/KAN-123-short-description`

Rules:

- prefix must be one of: `feature`, `fix`, `hotfix`, `chore`, `rc`
- Jira key must be uppercase
- Jira key format must be `KAN-<number>`
- slug must be lowercase kebab-case
- slug must not be empty

Examples of invalid names:

- `feature/test`
- `fix/bug`
- `rc/update`
- `feature/kan-123-invalid-case`
- `feature/KAN123-missing-dash`
- `feature/KAN-123_Invalid-Slug`

---

## Pull request policy

Any pull request targeting `developer`, `staging`, or `main` is allowed only if the source branch name is valid.

Allowed PR targets:

- `developer`
- `staging`
- `main`

Allowed PR sources:

- `feature/*`
- `fix/*`
- `hotfix/*`
- `chore/*`
- `rc/*`
- `developer`
- `staging`
- `main`

Rules:

- source branch must match the naming convention or be one of the protected branches
- target branch must be one of the protected branches
- the same source rules apply to every protected target (`developer`, `staging`, and `main`); there is no separate “promotion-only” path exclusive to `main`
- pull requests from invalid branch names must fail
- squash merge only

Preferred PR title format:

- `[KAN-123] implement google auth`
- `[KAN-456] fix payment validation`

---

## Required CI checks

Every pull request targeting a protected branch must run, at minimum:

- lint
- typecheck
- tests
- build
- dependency audit

The dependency audit blocking threshold must be explicit in workflow code.

---

## CI enforcement

CI must enforce:

1. Branch name validation
   - fail if source branch name is invalid

2. Pull request target validation
   - fail if target branch is not `developer`, `staging`, or `main`

3. Pull request title validation
   - fail if PR title does not follow the expected pattern when enabled

4. Required validation jobs
   - lint
   - typecheck
   - tests
   - build
   - dependency audit

---

## Safe workflow rules

When editing GitHub Actions workflows:

- preserve protected branch governance
- do not remove checks just to make CI pass
- do not replace failing validations with warnings
- prefer explicit validation scripts
- prefer small and isolated changes
- avoid secrets-dependent logic in pull request workflows unless explicitly required

If workflow job names change, document it because required status checks may break.

---

## Conflict resolution

If there is a conflict, follow this order:

1. explicit user instruction
2. this document
3. existing workflow implementation
4. historical behavior

---

## Non-negotiable rules

These rules must not be relaxed unless explicitly requested:

- `developer`, `staging`, and `main` do not allow direct push
- pull requests to protected branches require valid source branch names
- required validation includes lint, typecheck, tests, and build
- CI changes must not silently weaken governance
- `npm` remains the package manager
- Node.js version remains aligned with project baseline
