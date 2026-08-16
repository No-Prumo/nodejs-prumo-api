---
title: CI Operational Rules
doc-type: operational
role: mechanical-reference
priority: medium
canonical: docs/ai/ci-cd/ci-governance.md
use-together-with:
  - docs/ai/ci-cd/ci-governance.md
related:
  - docs/ai/ci-cd/render-free-deployment.md
scope: github-actions, branch-validation, pr-validation, preview-deployment
read-when:
  - implementing or editing GitHub Actions workflows
  - writing branch or pull request validation scripts
  - changing Preview migration, deployment, health, or rollback automation
do-not-read-when:
  - deciding policy
  - changing only application business logic
---

# CI/CD Operational Rules

Mechanical facts from repository workflows. Normative policy lives in
`ci-governance.md`.

## Reusable CI workflow

| Item               | Value                                              |
| ------------------ | -------------------------------------------------- |
| File               | `.github/workflows/ci-pr.yml`                      |
| Workflow name      | `CI PR`                                            |
| Triggers           | PR to protected branches; reusable `workflow_call` |
| Node               | `.nvmrc` (`24`)                                    |
| npm                | major version `11`                                 |
| Database during CI | non-secret placeholder URL; no connection required |

Reusable calls are accepted only when the caller event is a push to `staging`
or `master`. PR-only governance is skipped for reusable post-merge calls.

### Job IDs and stable display names

| Job ID       | Display name     |
| ------------ | ---------------- |
| `governance` | Governance       |
| `quality`    | Quality          |
| `test`       | Test             |
| `contract`   | Contract         |
| `build`      | Build            |
| `security`   | Dependency audit |

Do not rename display names without updating GitHub required status checks.

### Commands

| Job              | Command / validation                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Quality          | `npm run lint:ci`; `npm run typecheck`                                                         |
| Test             | `npm run test:ci`                                                                              |
| Contract         | `npm run openapi:check`                                                                        |
| Build            | `npm run build`; build Docker image; start it; check `/health/live`; assert Docker user `node` |
| Dependency audit | `npm audit --audit-level=moderate`                                                             |

All Node jobs verify Node 24 and npm 11 before installing dependencies.

## Governance mechanics

Temporary branch regex:

```regex
^(feature|fix|hotfix|docs|refactor|test|ci|chore|rc|codex)/KAN-[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$
```

PR title regex:

```regex
^\[KAN-[0-9]+\] (feat|fix|hotfix|docs|refactor|test|ci|chore|build|perf|style|revert)\([a-z0-9-]+\): .+$
```

Direction matrix:

| Target      | Accepted source        | Merge method |
| ----------- | ---------------------- | ------------ |
| `developer` | valid temporary branch | squash       |
| `staging`   | `developer` only       | merge commit |
| `master`    | `staging` only         | merge commit |

Promotion titles are exact and descriptions must contain `Release type`,
`Promotion path`, `Source commit`, `Target environment`, and `Rollback`.
Production additionally requires `Preview deployment` and `Preview validation`.

## Preview CD workflow

| Item        | Value                                                       |
| ----------- | ----------------------------------------------------------- |
| File        | `.github/workflows/cd-preview.yml`                          |
| Trigger     | push to `staging`                                           |
| Concurrency | one `cd-preview-api` execution, queued rather than canceled |
| Environment | GitHub `preview`                                            |

Order:

1. call the complete reusable CI for the pushed SHA
2. check out and verify the immutable SHA
3. run `prisma migrate deploy` with `PREVIEW_DATABASE_DIRECT_URL`
4. call the Render deploy hook with the exact SHA
5. poll the Render API until that deploy is `live`
6. verify Render reports the same commit SHA
7. check `/health/ready` and `/health/live`

Required GitHub environment secrets:

- `PREVIEW_DATABASE_DIRECT_URL`
- `RENDER_PREVIEW_DEPLOY_HOOK_URL`
- `RENDER_API_KEY`

Required GitHub environment variables:

- `RENDER_PREVIEW_SERVICE_ID`
- `PREVIEW_API_BASE_URL`

## Preview rollback workflow

`.github/workflows/rollback-preview.yml` is manual and must be dispatched from
`staging`. It requires a full 40-character healthy commit SHA and a reason. It
uses the same deployment concurrency group and post-deploy checks as normal CD.

Rollback never reverses Prisma migrations. Database changes must remain
backward compatible or be repaired with a forward migration first.

## GitHub rulesets

The repository default branch is `master`. Configure rulesets for `developer`,
`staging`, and `master` with the stable check names listed above. CI validates
policy but does not replace ruleset enforcement for direct pushes and merge
methods.
