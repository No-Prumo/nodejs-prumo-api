---
title: CI Governance
scope: github-actions, pull-requests, branch-policy
read-when:
  - editing files under .github/workflows
  - changing CI validation logic
  - changing branch or pull request governance
do-not-read-when:
  - changing only application business logic
  - working only on UI or backend features unrelated to CI
priority: high
---

# CI Governance

## Purpose

This document is the source of truth for branch flow, pull request governance, branch naming, and CI validation behavior.

If existing workflow code conflicts with this document, this document takes precedence unless the user explicitly requests otherwise.

---

## Repository context

CI platform:
- GitHub Actions

Main branches:
- `develop`: integration branch
- `staging`: pre-production validation branch
- `production`: production branch

Temporary branches:
- `feature/<jira-key>-<slug>`
- `fix/<jira-key>-<slug>`
- `hotfix/<jira-key>-<slug>`
- `chore/<jira-key>-<slug>`

Technical baseline relevant to CI:
- Node.js 22
- npm
- single repository application

---

## Branch creation rules

Branches must be created from these base branches:

- `feature/*` from `develop`
- `fix/*` from `develop`
- `chore/*` from `develop`
- `hotfix/*` from `production`

---

## Allowed pull request flows

Only these pull request flows are valid:

- `feature/*` -> `develop`
- `fix/*` -> `develop`
- `chore/*` -> `develop`
- `develop` -> `staging`
- `staging` -> `production`
- `hotfix/*` -> `production`
- `hotfix/*` -> `staging`
- `hotfix/*` -> `develop`

Hotfixes merged into `production` must be back-merged into:
- `staging`
- `develop`

This is a mandatory follow-up step.

---

## Forbidden pull request flows

The following pull request flows must not be allowed unless the user explicitly requests an exception in the current task:

- `feature/*` -> `staging`
- `feature/*` -> `production`
- `fix/*` -> `staging`
- `fix/*` -> `production`
- `chore/*` -> `staging`
- `chore/*` -> `production`
- `develop` -> `production`

---

## Branch naming rules

Allowed branch formats:

- `feature/KAN-123-short-description`
- `fix/KAN-123-short-description`
- `hotfix/KAN-123-short-description`
- `chore/KAN-123-short-description`

Rules:

- prefix must be one of: `feature`, `fix`, `hotfix`, `chore`
- Jira key must be uppercase
- Jira key format must be `KAN-<number>`
- slug must be lowercase kebab-case
- slug must not be empty

Examples of invalid names:

- `feature/test`
- `fix/bug`
- `chore/update`
- `feature/kan-123-invalid-case`
- `feature/KAN123-missing-dash`
- `feature/KAN-123_Invalid-Slug`

---

## Pull request rules

Expected pull request sources by target branch:

### Target: `develop`
Allowed sources:
- `feature/*`
- `fix/*`
- `chore/*`

### Target: `staging`
Allowed sources:
- `develop`
- `hotfix/*`

### Target: `production`
Allowed sources:
- `staging`
- `hotfix/*`

Merge strategy:
- squash merge only

Preferred PR title format:
- `[KAN-123] implement google auth`
- `[KAN-456] fix payment validation`

---

## Required CI checks

The main pull request validation workflow must include, at minimum:

- lint
- typecheck
- tests
- build

These checks must remain required unless the user explicitly requests a different policy with an equivalent replacement.

---

## Enforcement boundaries

The following rules can be enforced in GitHub Actions:

- branch naming validation
- pull request source and target flow validation
- required validation jobs on pull requests

The following rules should be enforced with GitHub branch protection or rulesets when available:

- blocking direct pushes to protected branches
- requiring pull requests before merge
- requiring required status checks before merge

CI alone is not sufficient to prevent direct pushes to protected branches.

---

## Enforcement rules

CI must enforce at least the following:

1. Pull request validation
   - lint
   - typecheck
   - tests
   - build

2. Branch naming validation
   - validate branch names against the naming convention

3. Pull request flow validation
   - fail if source and target branches do not match the allowed pull request flows

4. Production PR source validation
   - fail if a pull request targeting `production` does not come from `staging` or `hotfix/*`

5. Security baseline
   - dependency audit is required
   - the blocking severity threshold must be explicit in workflow code

---

## Safe workflow change rules

When editing GitHub Actions workflows:

- preserve current governance rules
- do not remove checks only to make CI pass
- do not weaken production validation
- do not replace failure-based rules with logs or warnings
- prefer explicit scripts over implicit behavior
- prefer small and isolated changes
- avoid changing multiple workflows at once unless necessary
- avoid introducing secrets-dependent logic in pull request workflows unless explicitly required

If a change renames workflow jobs or required checks, document it explicitly because it may break required status checks.

---

## Conflict resolution

If there is a conflict between this document and existing workflow implementation, follow this order unless the user explicitly requests otherwise:

1. explicit user instruction
2. this document
3. existing workflow implementation
4. historical behavior

---

## Non-negotiable rules

These rules must not be relaxed unless the user explicitly requests it:

- `production` only accepts pull requests from `staging` or `hotfix/*`
- required validation must include lint, typecheck, tests, and build
- CI changes must not silently weaken governance
- `npm` remains the package manager
- Node.js version remains aligned with the project baseline

---

## Non-goals

The following are out of scope unless explicitly requested:

- deployment automation
- multi-node test matrix
- unnecessary workflow fragmentation
- changing package manager
- changing branch strategy
- adding complex release orchestration
