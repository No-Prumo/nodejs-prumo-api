---
title: Security Audit Remediation
doc-type: remediation-workflow
role: repository-guidance
priority: high
canonical: docs/ai/ci-cd/security-audit-remediation.md
related:
  - docs/ai/ci-cd/ci-governance.md
  - docs/ai/ci-cd/ci-operational-rules.md
  - docs/ai/task-finalization-workflow.md
  - sandicts/sandicts-docs:docs/ai/dependency-security-remediation.md
  - sandicts/reactjs-sandicts-web:docs/ai/ci-cd/security-audit-remediation.md
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

Apply the shared Sandicts dependency-security standard to the backend without
hiding risk, weakening CI, or mixing pre-existing vulnerabilities into an
unrelated delivery.

The cross-repository policy lives in
`sandicts/sandicts-docs:docs/ai/dependency-security-remediation.md`. Frontend
repository commands and dependency paths remain frontend-owned.

## Isolation rule

When an unrelated pull request exposes a dependency audit failure that already
exists on its base branch:

1. Confirm that the unrelated pull request does not change `package.json` or
   `package-lock.json`.
2. Create or reuse a dedicated security Jira task.
3. Create a `chore/KAN-*-...` branch from `developer`.
4. Remediate dependencies in a separate `chore(security)` commit and pull
   request.
5. Keep the audit job and its `moderate` threshold blocking.
6. Merge the security pull request before updating the blocked pull request
   from `developer`.
7. Confirm the blocked pull request has no dependency remediation in its own
   diff.

Do not add dependency or lockfile changes to the unrelated pull request merely
to make its CI green.

## Required workflow

When `npm audit --audit-level=moderate` fails:

1. Reproduce the failure locally with the same CI command.
2. Inspect the machine-readable report with `npm audit --json` when the cause is
   not obvious.
3. Identify dependency paths with `npm explain <package>`.
4. Prefer the smallest non-breaking remediation that makes the audit pass.
5. Validate with `npm audit --audit-level=moderate`.
6. Validate the lockfile from a clean install.
7. Run the complete backend validation matrix.
8. Document the remediation in the pull request and the related Jira issue.

## Backend validation

Run:

```bash
npm ci
npm audit --audit-level=moderate
npm run lint:ci
npm run typecheck
npm run test:ci
npm run openapi:check
npm run build
```

When a dependency update affects a CLI or generated artifact, also execute the
relevant command such as `npm run prisma:generate` and verify that it does not
create unrelated output drift.

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

