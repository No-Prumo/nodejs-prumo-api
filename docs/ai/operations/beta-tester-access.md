---
title: Beta Tester Access Operations
doc-type: operations-guide
role: source-of-truth
priority: high
canonical: docs/ai/operations/beta-tester-access.md
related:
  - docs/ai/architecture/authentication-session-pattern.md
scope: beta, authentication, invitations, privacy, data-deletion
read-when:
  - adding or removing a Beta tester
  - locating or deleting Beta tester data
---

# Beta Tester Access Operations

## Purpose

This procedure manages the closed Beta allowlist without storing tester emails
in Git, public environment variables, or application logs. Invitations are kept
in PostgreSQL as normalized emails with an optional revocation timestamp.

The command reads the email interactively and never prints it back. Do not pass
tester emails as command-line arguments, paste command transcripts into tickets,
or capture the interactive input in operational logs.

## Prerequisites

- run from a trusted checkout of the API repository
- configure `DATABASE_URL` for the intended environment through its protected
  secret mechanism
- deploy the `20260829120000_beta_invite_only_access` migration first
- confirm the target environment before changing access or deleting data

## Add Or Reactivate A Tester

```bash
npm run beta:testers -- invite
```

Enter the tester email only at the interactive prompt. The command normalizes
the email and creates the invitation or clears its previous revocation. It does
not create an account or session. A reactivated tester must authenticate again;
old sessions and magic links remain revoked.

## Remove Access

```bash
npm run beta:testers -- revoke
```

Removal is transactional. It marks the invitation revoked, revokes pending
magic link challenges, and revokes active sessions plus their refresh tokens for
the matching account. Current protected requests stop succeeding because the
session is checked server-side; already issued access tokens are not otherwise
placed on a separate denylist.

The public magic link request response remains `202 Accepted` with
`{ "status": "accepted" }`. Google and magic link consumption use generic auth
failures and do not reveal invitation state.

## Locate Beta Data

```bash
npm run beta:testers -- locate
```

The command reports only record counts. It checks the invitation, magic link
challenges, account, sessions, external identities, and player profile without
printing the email or record contents.

## Delete Beta Data

First run `locate`, confirm the request and target environment, then run:

```bash
npm run beta:testers -- delete-data
```

Type `DELETE` at the second prompt. The command deletes matching invitations,
magic link challenges, and the account in one transaction. Database cascades
remove the account's external identities, sessions, refresh tokens, and player
profile. Run `locate` again and confirm all reported counts are zero.

Deletion is permanent. Preserve only separately required legal or security
records when a documented retention obligation exists; this MVP flow does not
collect payments, identity documents, health data, or other sensitive product
data.

## Verification

After an access change:

1. confirm an invited tester can request and consume a new magic link
2. confirm Google sign-in works for that same active invitation
3. after revocation, confirm magic link requests keep the generic response but
   no email is delivered
4. confirm old refresh tokens and protected sessions no longer work
5. never attach tester emails, raw tokens, database rows, or command input to
   Jira, pull requests, or logs
