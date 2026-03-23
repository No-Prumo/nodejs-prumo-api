---
title: CI Operational Rules
scope: github-actions, branch-validation, pr-validation
read-when:
  - implementing or editing GitHub Actions workflows
  - writing branch validation scripts
  - writing pull request validation scripts
do-not-read-when:
  - changing only business logic
  - changing only UI or backend features unrelated to CI
priority: high
---

# CI Operational Rules

This document contains only the operational rules that workflow code should implement directly.

For governance context and policy rationale, read:
- `docs/ai/ci-cd/ci-governance.md`

---

## Branch naming regex

Allowed source branch pattern:

```regex
^(feature|fix|hotfix|chore)\/KAN-[0-9]+-[a-z0-9]+(?:-[a-z0-9]+)*$
