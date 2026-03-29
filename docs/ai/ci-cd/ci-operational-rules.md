---
title: CI Operational Rules
doc-type: operational
role: mechanical-reference
priority: medium
canonical: docs/ai/ci-cd/ci-governance.md
use-together-with:
  - docs/ai/ci-cd/ci-governance.md
related:
  - docs/ai/ci-cd/ci-governance.md
scope: github-actions, branch-validation, pr-validation
read-when:
  - implementing or editing GitHub Actions workflows
  - writing branch validation scripts
  - writing pull request validation scripts
  - looking up job display names, regex, or audit thresholds as implemented in YAML
do-not-read-when:
  - deciding policy (branch naming rules, merge policy, non-negotiables)
  - changing only application business logic
  - changing only UI or backend features unrelated to CI
---

# CI Operational Rules

Mechanical facts from repository workflows. Normative policy lives in `ci-governance.md`. If YAML and policy diverge, follow the conflict order in governance.

## Active PR workflow

| Item | Value |
|------|--------|
| File | `.github/workflows/ci-pr.yml` |
| Workflow name | `CI PR` |
| Node (jobs) | `22` |
| Package manager | `npm` (`npm ci`) |

### PR event branches (`on.pull_request.branches`)

- `developer`
- `staging`
- `main`

### Job IDs and display names (required check labels)

| Job ID | `name:` (GitHub UI / branch protection) |
|--------|----------------------------------------|
| `governance` | Governance |
| `quality` | Quality |
| `test` | Test |
| `build` | Build |
| `security` | Dependency audit |

Dependency order: `quality`, `test`, `build`, and `security` each `needs: governance`.

### Commands run

| Job | Step | Command |
|-----|------|---------|
| Quality | Lint | `npm run lint:ci` |
| Quality | Typecheck | `npm run typecheck` |
| Test | Tests | `npm run test:ci` |
| Build | Build | `npm run build` |
| Security | Audit | `npm audit --audit-level=moderate` |

## Regex and branch logic (Governance job)

Source branch pattern for temporary branches (inline in `ci-pr.yml`):

```regex
^(feature|fix|hotfix|chore|rc)/KAN-[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$
```

Allowed source branches that skip the temp-branch regex (exact match):

- `developer`
- `staging`
- `main`

Target validation: `BASE` must be one of `developer`, `staging`, `main`. There is no per-target promotion `case`; the same source rules apply to all targets.

## GitHub branch protection (manual)

Configure rulesets or branch protection on `developer`, `staging`, and `main` to match policy in `ci-governance.md`. Required status checks should include the job display names above (`Governance`, `Quality`, `Test`, `Build`, `Dependency audit`) so merges are blocked until CI passes.

## Other workflow files

| File | Status |
|------|--------|
| `.github/workflows/validate-branch-name.yml` | Commented out (inactive) |
| `.github/workflows/validate-production-pr-source.yml` | Commented out (inactive) |
| `.github/workflows/ci-push-guard.yml` | Commented out (inactive) |
| `.github/workflows/security.yml` | Commented out (inactive); duplicate of audit logic in `ci-pr.yml` |

## Thresholds

| Check | Active in repo | Notes |
|-------|----------------|--------|
| Dependency audit | Yes | `npm audit --audit-level=moderate` — job fails on moderate or higher (see `ci-pr.yml` security job). |
