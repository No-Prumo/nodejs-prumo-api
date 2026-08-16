<!--
Required title:
- [KAN-123] chore(release): Promote developer to staging
- [KAN-123] chore(release): Promote staging to master

Replace every REPLACE_WITH_ value. Governance rejects unresolved placeholders.
-->

## Summary

Promotes the reviewed release from `REPLACE_WITH_SOURCE_BRANCH` to
`REPLACE_WITH_TARGET_BRANCH`.

## Problem

The target environment must receive one auditable, immutable commit range only
after the source branch passes the complete repository CI.

## Root cause

The source branch contains changes approved for the next environment and the
target branch does not contain that release yet.

## Changes

- Release type: `REPLACE_WITH_standard_security_or_rollback`
- Promotion path: `REPLACE_WITH_developer_to_staging_or_staging_to_master`
- Source commit: `REPLACE_WITH_FULL_GIT_SHA`
- Target environment: `REPLACE_WITH_preview_or_production`
- Included Jira issues: `REPLACE_WITH_JIRA_KEYS_OR_RELEASE_TASK`

## Files added or updated

- Compare range: `REPLACE_WITH_COMPARE_URL_OR_GIT_RANGE`
- Application files are unchanged by this promotion PR; it promotes the exact
  source-branch state.

## Impact

### Fixed

- Delivers the approved source commit to the next environment.
- Preserves the `developer -> staging -> master` promotion order.

### Not changed

- No direct commit is made to the target branch.
- No deployment occurs before this PR is merged and post-merge CI succeeds.

## Validation

- [ ] branch governance (CI: Governance)
- [ ] lint (CI: Quality)
- [ ] typecheck (CI: Quality)
- [ ] tests (CI: Test)
- [ ] contract (CI: Contract)
- [ ] application build and Docker runtime (CI: Build)
- [ ] dependency audit (CI: Dependency audit)
- [ ] manual validation completed

## Notes

- Primary Jira: `KAN-123`
- Related Jira: `REPLACE_WITH_RELATED_JIRA_KEYS_OR_NONE`
- Jira status: keep release task `In Review` until post-deployment validation
- Tracking exception: none
- Rollback: `REPLACE_WITH_LAST_HEALTHY_DEPLOYMENT_OR_REVERT_PLAN`
- Preview deployment: `REPLACE_WITH_URL_OR_NOT_APPLICABLE_FOR_STAGING`
- Preview validation: `REPLACE_WITH_EVIDENCE_OR_NOT_APPLICABLE_FOR_STAGING`
- Merge method: merge commit; never squash a protected-branch promotion
- Branch cleanup: protected promotion branches are retained
- Known gaps or skipped validation: `REPLACE_WITH_GAPS_OR_NONE`
