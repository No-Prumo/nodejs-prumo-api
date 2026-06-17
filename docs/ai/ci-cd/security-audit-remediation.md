---
title: Security Audit Remediation
doc-type: remediation-workflow
role: source-of-truth
priority: high
canonical: docs/ai/ci-cd/security-audit-remediation.md
related:
  - docs/ai/ci-cd/ci-governance.md
  - docs/ai/ci-cd/ci-operational-rules.md
  - docs/ai/task-finalization-workflow.md
scope: npm-audit, dependency-security, dependency-overrides, pull-requests, jira
read-when:
  - fixing npm audit failures
  - updating dependency versions or overrides for security
  - documenting dependency vulnerability remediation
  - responding to dependency audit CI failures
do-not-read-when:
  - changing application code without dependency or CI security impact
  - updating documentation unrelated to security, CI, or dependencies
---

# Security Audit Remediation

## Purpose

Define the standard Sandicts workflow for resolving dependency audit failures
without hiding risk, weakening CI, or losing the reason behind a dependency
decision.

## Required workflow

When `npm audit --audit-level=moderate` fails:

1. Reproduce the failure locally with the same CI command.
2. Inspect the machine-readable report with `npm audit --json` when the cause is
   not obvious.
3. Identify dependency paths with `npm explain <package>`.
4. Prefer the smallest non-breaking remediation that makes the audit pass.
5. Validate with `npm audit --audit-level=moderate`.
6. Run additional validation that matches the dependency impact, such as lint,
   typecheck, tests, or build.
7. Document the remediation in the pull request and the related Jira issue.

## Fix selection

Preferred order:

1. Upgrade the direct dependency inside the current supported major range.
2. Refresh the lockfile when the existing semver range already allows a fixed
   transitive version.
3. Add or update a targeted `overrides` entry when an upstream package pins a
   vulnerable transitive dependency and a direct upgrade is unavailable or would
   introduce unrelated breaking changes.
4. Use `npm audit fix --force` only with explicit approval and a compatibility
   plan, because it can downgrade or major-upgrade packages outside the current
   architecture decision.

Do not remove the audit job, lower the audit threshold, or convert dependency
security failures into warnings just to make CI pass.

## Documentation requirements

Every vulnerability remediation must record:

- vulnerable package names and severities
- whether each package is direct or transitive
- the dependency path or tool that introduced it
- the chosen fix, including any `overrides`
- why the chosen fix is safer than the available alternative when the
  alternative is breaking or broad
- validation commands that passed
- any residual risk or follow-up needed

Put this in the PR description or a PR comment, and add the same decision trail
to the related Jira issue as a comment or description update.

## Commit isolation

Commit vulnerability remediation separately from unrelated feature, refactor, or
documentation changes whenever possible.

Preferred split:

- one `chore(security): ...` commit for `package.json`, lockfile, and dependency
  changes
- one `docs(security): ...` commit for process documentation, when process docs
  are changed at the same time

If a single commit is unavoidable, the commit message and PR body must make the
security scope explicit.

## Overrides

Overrides are acceptable when they are targeted, documented, and validated.

When adding an override:

- keep it as narrow as npm allows for the repository's dependency graph
- explain the upstream package that required the override
- validate that the application still builds and tests pass when the package can
  affect runtime or tooling behavior
- remove the override later when upstream releases make it unnecessary

