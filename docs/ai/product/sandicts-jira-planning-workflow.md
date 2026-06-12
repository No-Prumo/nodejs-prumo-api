---
title: Sandicts Jira Planning Workflow
doc-type: delivery-planning
role: source-of-truth
priority: high
canonical: docs/ai/product/sandicts-jira-planning-workflow.md
related:
  - docs/ai/product/sandicts-product-context.md
  - docs/ai/product/sandicts-mvp-scope.md
  - docs/ai/product/sandicts-v2-backlog.md
  - docs/ai/product/sandicts-scope-checklist.md
  - docs/ai/business/sandicts-business-rules.md
  - docs/frontend/sandicts-frontend-planning.md
  - docs/frontend/sandicts-frontend-tech-decisions.md
  - docs/frontend/sandicts-mvp-delivery-roadmap.md
  - docs/frontend/sandicts-page-functional-spec.md
scope: jira, roadmap, backlog, delivery-planning, issue-writing, mvp
read-when:
  - planning Jira epics, stories, tasks, subtasks, or bugs
  - turning Sandicts roadmap items into Jira backlog
  - deciding the next implementation module
  - creating or editing Jira issue titles, descriptions, labels, priorities, or statuses
  - preparing a Codex execution plan before implementation
do-not-read-when:
  - changing only low-level implementation details after a Jira issue already exists and scope is clear
  - writing only a commit message or PR description for an already completed change
---

# Sandicts Jira Planning Workflow

## Purpose

This document defines how Sandicts product scope becomes Jira work.

Use it to keep the Jira backlog readable, ordered, and connected to the MVP
source-of-truth documents. It is also the operating guide for Codex when the
user asks to plan, create, update, or move Jira issues.

The goal is not to create many tickets for the sake of process. The goal is to
make the next useful work obvious.

## Core Principle

Plan before implementation.

Before Codex creates Jira issues, changes Jira statuses, or starts a new module,
it should:

1. read the relevant product and business-rule docs
2. inspect the existing Jira backlog
3. propose a small, ordered batch of changes
4. wait for explicit user approval before mutating Jira
5. only then create, edit, transition, or implement

For Sandicts, planning quality matters because the product has many attractive
future ideas. The Jira backlog must protect the MVP from scope drift.

## Source Documents

Use these documents as the hierarchy of truth:

1. `docs/ai/product/sandicts-product-context.md`
2. `docs/ai/product/sandicts-mvp-scope.md`
3. `docs/ai/business/sandicts-business-rules.md`
4. `docs/ai/product/sandicts-v2-backlog.md`
5. `docs/ai/product/sandicts-scope-checklist.md`
6. `docs/frontend/sandicts-frontend-tech-decisions.md` for frontend stack
   decisions
7. `docs/frontend/sandicts-mvp-delivery-roadmap.md` for frontend/fullstack
   decision, prototype, docs, and delivery sequencing
8. `docs/frontend/sandicts-page-functional-spec.md` for page inventory and
   page-level behavior

Jira should reflect these docs. If Jira and the docs disagree, do not guess.
Surface the conflict and ask whether to update Jira, update docs, or preserve
the difference temporarily.

## Jira Project

Current Jira project key:

- `KAN`

Always re-check Jira before making a batch change. Issue statuses, parent links,
and available workflow transitions may change.

## Jira Hierarchy

Use this hierarchy:

```text
Epic
  Story or Task
    Subtask
Bug
```

### Epic

Use an Epic for a major product capability or delivery area.

Good Epic examples:

- `[MVP] Authentication and Account Access`
- `[MVP] Player Profile Foundation`
- `[MVP] Partner Onboarding`
- `[MVP] Court Management`
- `[MVP] Availability Calendar`
- `[MVP] Court Discovery`
- `[MVP] Reservations`
- `[MVP] Manual Payments`
- `[MVP] Open Matches`
- `[Platform] Backend Foundation`

Do not use an Epic for a single endpoint, one refactor, or one small technical
step.

### Story

Use a Story when the issue describes user-visible value.

Stories should be phrased around a user outcome, even when the implementation is
backend-heavy.

Good Story examples:

- `[Auth] Player signs in with Google`
- `[Players] Player manages a basic profile`
- `[Partners] Partner creates a venue profile`
- `[Courts] Partner creates a court`
- `[Availability] Partner publishes available time slots`
- `[Discovery] Player filters courts by sport`
- `[Reservations] Player requests a court reservation`
- `[Open Matches] Player joins an open match`

Avoid stories that are only implementation mechanics:

- `Create auth controller`
- `Add Prisma model`
- `Refactor module`

Those are Tasks or Subtasks.

### Task

Use a Task for technical, operational, documentation, or infrastructure work
that does not directly express a user story.

Good Task examples:

- `[Backend] Build auth module foundation`
- `[DB] Add reservation persistence model`
- `[API] Document reservation endpoints in Swagger`
- `[Docs] Align MVP backlog with Jira workflow`
- `[CI] Fix dependency audit vulnerabilities`
- `[DevOps] Configure deployment environments`

Tasks can live under an Epic when they support that Epic. A Task can also stand
alone for cross-cutting work such as security, CI, or repository maintenance.

### Subtask

Use a Subtask for a small, concrete implementation step inside a Story or Task.

Good Subtask examples:

- `[Backend] Add Google ID token verifier`
- `[Backend] Persist external auth identities`
- `[API] Expose Google sign-in endpoint`
- `[Tests] Cover Google sign-in failure cases`

Subtasks should be useful for execution tracking. Do not create subtasks far in
advance for every future module. Prefer detailed subtasks for the current module
and the next module only.

### Bug

Use a Bug when expected behavior is broken.

Good Bug examples:

- `[Auth] Refresh token reuse is not rejected`
- `[Reservations] Confirmed slot can be double-booked`
- `[Payments] Partner can see another partner payment`

Do not use Bug for missing planned functionality. Missing planned functionality
is usually a Story or Task.

### Spike

If discovery is needed, create a Task with a `[Spike]` prefix.

Good Spike examples:

- `[Spike] Decide reservation cancellation window`
- `[Spike] Compare payment provider options for V2`
- `[Spike] Decide frontend repository location`
- `[Spike] Decide OpenAPI client generator`

Every Spike must produce a decision, a written recommendation, or follow-up Jira
issues. Avoid open-ended research.

Prototype and documentation work should not be hidden inside implementation
issues. Use explicit Tasks such as:

- `[UX] Prototype player profile onboarding`
- `[UX] Prototype reservation request flow`
- `[Docs] Document frontend technology decisions`
- `[Docs] Capture approved discovery prototype decisions`

Every prototype task must produce a prototype, wireflow, screenshot, or written
UX decision that is usable by implementation work.

## Issue Type Decision Tree

Use this decision tree before creating an issue:

1. Is this a broad capability that will contain multiple stories or tasks?
   Create an Epic.
2. Does this describe value a player, partner, or internal operator receives?
   Create a Story.
3. Is this technical, documentation, CI, infrastructure, or internal setup work?
   Create a Task.
4. Is this a small step inside an already approved Story or Task?
   Create a Subtask.
5. Is something expected already broken?
   Create a Bug.
6. Is the team uncertain and needs a bounded investigation?
   Create a `[Spike]` Task.

## Title Standard

Default title format:

```text
[Area] Verb concrete outcome
```

Use English for Jira titles and descriptions unless the user explicitly asks
otherwise.

### Area Prefixes

Product prefixes:

- `[MVP]`
- `[Auth]`
- `[Players]`
- `[Partners]`
- `[Courts]`
- `[Availability]`
- `[Discovery]`
- `[Reservations]`
- `[Payments]`
- `[Open Matches]`
- `[Tournaments]`
- `[B2B]`

Technical prefixes:

- `[Backend]`
- `[Frontend]`
- `[Fullstack]`
- `[API]`
- `[DB]`
- `[UX]`
- `[Design]`
- `[E2E]`
- `[Docs]`
- `[CI]`
- `[DevOps]`
- `[Security]`
- `[Tests]`
- `[Refactor]`
- `[Spike]`

### Verb Style

Prefer concrete verbs:

- `Implement`
- `Create`
- `Expose`
- `Persist`
- `Validate`
- `Prevent`
- `Document`
- `Configure`
- `Refactor`
- `Fix`

Avoid vague verbs:

- `Handle`
- `Improve`
- `Update things`
- `Work on`
- `Support stuff`

### Title Examples

Good:

- `[Auth] Player signs in with Google`
- `[Backend] Implement auth session refresh`
- `[Reservations] Prevent duplicate confirmed reservations`
- `[Payments] Partner marks reservation payment as paid`
- `[Docs] Define Jira planning workflow`
- `[Frontend] Build player reservation request flow`
- `[E2E] Validate reservation happy path`

Weak:

- `Auth`
- `Reservations`
- `Do payment`
- `Backend stuff`
- `Fix bugs`

## Description Standards

Every Jira issue should explain enough context that future Codex sessions and
future humans can execute without reconstructing the product decision from chat
history.

Use concise sections. Long descriptions are fine when they prevent ambiguity.

### Epic Template

```md
Summary

<One paragraph describing the capability and why it matters for the MVP.>

Product outcome

<The product capability this epic unlocks for players, partners, or Sandicts operations.>

MVP scope

- <Included outcome 1>
- <Included outcome 2>
- <Included outcome 3>

Out of scope

- <Explicit exclusion 1>
- <Explicit exclusion 2>

Primary users

- <Player, Partner, Admin, or internal operator>

Success criteria

- <Observable end-state for the epic>
- <Observable end-state for the epic>

Related docs

- `docs/ai/product/sandicts-mvp-scope.md`
- `docs/ai/business/sandicts-business-rules.md`
```

### Story Template

```md
Summary

<One concise sentence describing the user outcome.>

User story

As a <user type>, I want <goal>, so that <benefit>.

Context

<Explain the product or workflow context. Reference current MVP rules when useful.>

Goal

<Describe the expected user-visible behavior after this story is complete.>

Scope

- <Included behavior 1>
- <Included behavior 2>
- <Included behavior 3>

How it works

- <Important flow detail 1>
- <Important flow detail 2>

Acceptance criteria

- <Observable criterion 1>
- <Observable criterion 2>
- <Observable criterion 3>

Technical notes

- <Relevant modules, endpoints, docs, schemas, or business rules>

Out of scope

- <Explicit non-goal 1>
- <Explicit non-goal 2>
```

### Task Template

```md
Summary

<One concise sentence describing the delivery goal.>

Context

<Explain why this technical or operational work is needed.>

Goal

<Describe the expected end state.>

Scope

- <Included area 1>
- <Included area 2>

How it works

- <Implementation or workflow expectation 1>
- <Implementation or workflow expectation 2>

Acceptance criteria

- <Observable criterion 1>
- <Observable criterion 2>
- <Observable criterion 3>

Technical notes

- <Relevant files, docs, commands, modules, or dependencies>

Out of scope

- <Explicit non-goal 1>
```

### Subtask Template

```md
Summary

<One sentence describing the small implementation step.>

Scope

- <Included work>
- <Included work>

Acceptance criteria

- <Observable criterion>
- <Observable criterion>

Technical notes

- <Relevant file, module, endpoint, or test area>
```

### Bug Template

```md
Summary

<What is broken and why it matters.>

Current behavior

<What happens now.>

Expected behavior

<What should happen.>

Impact

<Who is affected and how severe the issue is.>

Reproduction

1. <Step>
2. <Step>
3. <Step>

Acceptance criteria

- <The bug is fixed in the affected flow>
- <A regression test or equivalent validation exists when practical>

Technical notes

- <Relevant module, endpoint, log, or Jira context>
```

## Acceptance Criteria Rules

Acceptance criteria must be observable.

Good:

- `A player cannot create two active reservations for the same court and time.`
- `The Google sign-in endpoint returns a session token pair for a valid Google identity.`
- `A partner cannot read reservation data from another partner.`

Weak:

- `Auth works.`
- `Reservations are better.`
- `Add validations.`

Use acceptance criteria to protect the business rule, not to list every line of
code that might change.

## Labels

Labels are optional, but useful for filtering. Prefer lowercase kebab-case.

Suggested labels:

- `mvp`
- `v2`
- `future`
- `backend`
- `api`
- `db`
- `docs`
- `frontend`
- `ux`
- `e2e`
- `security`
- `ci`
- `auth`
- `players`
- `partners`
- `courts`
- `availability`
- `discovery`
- `reservations`
- `payments`
- `open-matches`
- `tech-debt`
- `blocked`

Do not use labels as a replacement for a clear title and parent Epic.

## Priorities

Use priority to express delivery impact, not personal interest.

### High

Use High for:

- MVP critical path work that blocks the next module
- security or cross-partner access risk
- CI or dependency issues that block delivery
- data integrity issues such as duplicate confirmed reservations

### Medium

Use Medium as the default for planned MVP work.

### Low

Use Low for:

- cleanup that is useful but not blocking
- future hardening
- non-critical documentation refinements

If the Jira project has different priority names, choose the closest available
priority.

## Status Workflow

Use the available Jira transitions for the issue. Current observed statuses
include:

- `A fazer`
- `Em Progresso`
- `In Review`
- `Concluido`
- `Canceled`

Status meaning:

- `A fazer`: backlog or ready, not actively being changed
- `Em Progresso`: active work is happening now
- `In Review`: implementation is complete and needs review, validation, or PR
  review
- `Concluido`: accepted and no remaining work is expected for that issue
- `Canceled`: intentionally abandoned or superseded

Prefer one active implementation issue at a time unless the user explicitly
starts parallel work.

## Definition Of Ready

An issue is ready when:

- the issue type is correct
- the title follows the naming standard
- the parent Epic or parent Task/Story is clear
- the scope is explicit
- out-of-scope items are explicit when scope drift is likely
- acceptance criteria are observable
- relevant docs are linked or named
- dependencies and open decisions are called out

If an issue lacks these, improve the issue before implementation.

## Definition Of Done

An implementation issue is done when:

- acceptance criteria are met
- relevant tests or validation have been run, or the missing validation is
  clearly stated
- docs are updated when behavior, scope, API contract, setup, or business rules
  changed
- the PR description and commit message reflect the actual change
- the Jira issue has an accurate status

## Backlog Planning Cadence

Use three planning levels.

### Roadmap Planning

Roadmap planning answers:

- What are the MVP Epics?
- What is explicitly V2 or future?
- What should be built after the current module?

Output:

- ordered Epic list
- high-level Story list for each Epic
- no implementation subtasks except for current or next module

### Module Planning

Module planning answers:

- What is the next module?
- What Stories and Tasks are needed for that module?
- What business rules or API contracts must be defined first?

Output:

- one module-level Epic or Task
- detailed Stories or Tasks
- implementation Subtasks for the next working batch

### Implementation Planning

Implementation planning answers:

- Which Jira issue is being implemented now?
- What files, modules, endpoints, schemas, and tests are likely involved?
- What is out of scope for this change?

Output:

- short execution plan
- Jira status update only after the user approves it
- code changes only after the plan is accepted or the user asks to proceed

## Codex Jira Operating Rules

When working with Jira, Codex should:

- search existing Jira issues before creating duplicates
- prefer editing or linking existing issues over creating parallel duplicates
- propose a batch before mutating Jira
- include issue type, parent, title, labels, priority, and description summary in
  the proposal
- wait for explicit user approval before creating or editing Jira issues
- never move an issue to `Concluido` unless the acceptance criteria are actually
  satisfied
- never mark a future/V2 item as MVP unless product docs are updated or the user
  explicitly changes scope
- keep implementation comments factual and concise
- mention validation results when adding delivery comments

## Current Jira Alignment Notes

These notes are a starting point, not a permanent Jira snapshot. Re-query Jira
before making changes.

Observed current structure:

- `KAN-4` is the existing `Backend Foundation` Epic.
- `KAN-37` is the existing `[Auth] Configure web authentication MVP` Epic.
- `KAN-36` is the existing `Auth Module` Task under the auth Epic.
- `KAN-33` tracks dependency audit vulnerabilities and is High priority.
- `KAN-9` tracks deployment environments.

Recommended cleanup approach:

1. Do not rewrite completed Jira history just for aesthetics.
2. Keep `KAN-4` for platform and foundation work.
3. Keep `KAN-37` as the auth Epic unless the user wants a broader rename.
4. Consider renaming `KAN-36` to `[Backend] Build auth module foundation`.
5. Complete the remaining auth subtasks before opening the next product module.
6. Treat `KAN-33` as an interrupt lane because dependency/security work can
   block delivery.

## Recommended MVP Roadmap

This is the recommended MVP delivery order based on the current product docs.

Frontend planning should start during the current auth work. Frontend
implementation should start when the auth API contract is stable enough to wire
real sign-in and the first post-auth profile contracts are drafted. From that
point forward, plan backend, frontend, and integrated validation together.

### Phase 0: Delivery And Backlog Hygiene

Purpose:

- make the work system reliable before adding many product tickets

Suggested issues:

- `[Docs] Define Jira planning workflow`
- `[Docs] Document frontend technology decisions`
- `[Docs] Create MVP delivery roadmap`
- `[Docs] Reconcile uncommitted MVP documentation`
- `[Frontend] Define frontend architecture and app shell rules`
- `[UX] Define Sandicts MVP navigation model`
- `[UX] Prototype public, player, and partner app shells`
- `[Jira] Normalize MVP backlog hierarchy`
- `[CI] Fix dependency audit vulnerabilities`
- `[DevOps] Configure deployment environments`

Why now:

- a clean backlog makes the solo workflow faster
- dependency and deployment issues can block later MVP delivery

### Phase 1: Authentication And Account Access

Purpose:

- let players access Sandicts and keep sessions secure

Existing Jira anchor:

- `KAN-37` `[Auth] Configure web authentication MVP`

Suggested Stories:

- `[Auth] Player signs in with Google`
- `[Auth] Player signs in with Google One Tap`
- `[Auth] Player refreshes an active session`
- `[Auth] Player signs out`

Suggested Tasks:

- `[Backend] Build auth module foundation`
- `[Backend] Persist auth sessions and refresh tokens`
- `[Backend] Persist external auth identities`
- `[API] Expose auth endpoints with documented contracts`
- `[Frontend] Create app foundation and auth shell`
- `[Frontend] Implement auth session state`
- `[E2E] Validate web auth happy path`
- `[Tests] Cover auth success and failure flows`

Out of scope:

- password login
- password recovery
- social account linking beyond the first required Google identity
- admin auth unless a real operational flow requires it

### Phase 2: Player Profile Foundation

Purpose:

- create the player identity needed by reservations and open matches

Suggested Epic:

- `[MVP] Player Profile Foundation`

Suggested Stories:

- `[Players] Player manages a basic profile`
- `[Players] Player selects a main sport`
- `[Players] Player sets simple level by sport`

Suggested Tasks:

- `[Backend] Model player profile persistence`
- `[API] Expose player profile endpoints`
- `[Frontend] Build player profile onboarding`
- `[E2E] Validate player profile onboarding`
- `[Tests] Cover player profile validation`

MVP rules:

- simple level is only a matchmaking and filtering attribute
- public profile is V2
- player photo, bio, nationality, and side of game are V2
- player evolution, overall, cards, and fundamentals are V2

Why after auth:

- player profile depends on account identity
- reservations and open matches need a player reference

### Phase 3: Partner Onboarding

Purpose:

- let the supply side exist before courts, availability, and reservations

Suggested Epic:

- `[MVP] Partner Onboarding`

Suggested Stories:

- `[Partners] Partner creates an account`
- `[Partners] Partner creates a venue profile`
- `[Partners] Partner edits venue profile details`

Suggested Tasks:

- `[Backend] Model partner ownership and access scope`
- `[API] Expose partner profile endpoints`
- `[Frontend] Build partner dashboard shell`
- `[Frontend] Build partner profile form`
- `[E2E] Validate partner profile setup`
- `[Security] Prevent cross-partner data access`
- `[Tests] Cover partner access boundaries`

MVP rules:

- `Partner` is the single concept for arena, school, club, or organizer
- cross-partner access must be forbidden
- admin users should not be introduced until a real operational flow needs them

Why after player profile:

- authentication and identity rules should be stable before adding partner
  authorization boundaries

### Phase 4: Court Management

Purpose:

- let partners publish the physical spaces that players can reserve

Suggested Epic:

- `[MVP] Court Management`

Suggested Stories:

- `[Courts] Partner creates a court`
- `[Courts] Partner configures supported sports`
- `[Courts] Partner defines court rules`
- `[Courts] Partner activates and deactivates a court`
- `[Courts] Partner defines basic pricing`

Suggested Tasks:

- `[Backend] Model court persistence`
- `[Backend] Model sport support for courts`
- `[API] Expose court management endpoints`
- `[Frontend] Build court management screens`
- `[E2E] Validate partner court setup`
- `[Tests] Cover inactive court reservation protection`

MVP rules:

- inactive courts cannot be reserved
- courts belong to a partner
- supported sports can be defined by partner or court
- simple court rules should be visible to players

Why before availability:

- availability slots must reference real courts

### Phase 5: Availability Calendar

Purpose:

- let partners publish and control available reservation time slots

Suggested Epic:

- `[MVP] Availability Calendar`

Suggested Stories:

- `[Availability] Partner publishes available time slots`
- `[Availability] Partner views agenda by day`
- `[Availability] Partner views agenda by week`
- `[Availability] Partner blocks unavailable time slots`

Suggested Tasks:

- `[Backend] Model availability slots`
- `[Backend] Validate slot time windows`
- `[API] Expose availability endpoints`
- `[Frontend] Build partner availability calendar`
- `[E2E] Validate availability publishing`
- `[Tests] Cover availability overlap rules`

MVP rules:

- partners are the source of truth for court availability
- a court can only be reserved in an available time slot
- availability must be compatible with reservations

Why before discovery and reservations:

- discovery needs availability filters
- reservations need valid available slots

### Phase 6: Court Discovery

Purpose:

- let players find courts before requesting reservations

Suggested Epic:

- `[MVP] Court Discovery`

Suggested Stories:

- `[Discovery] Player filters courts by sport`
- `[Discovery] Player filters courts by availability`
- `[Discovery] Player filters courts by price`
- `[Discovery] Player views partner profile`
- `[Discovery] Player views available courts`

Suggested Tasks:

- `[API] Expose court search endpoint`
- `[Backend] Compose discovery filters`
- `[Frontend] Build player discovery screen`
- `[E2E] Validate court discovery filters`
- `[Tests] Cover discovery filter combinations`

MVP rules:

- no nearby search by geolocation in MVP
- no ratings, reviews, rich photos, or local comparison in MVP
- discovery should work with simple filters first

Why before reservations:

- players need to find a valid place and slot before booking

### Phase 7: Reservations

Purpose:

- prove the marketplace booking flow

Suggested Epic:

- `[MVP] Reservations`

Suggested Stories:

- `[Reservations] Player requests a court reservation`
- `[Reservations] Partner confirms a reservation`
- `[Reservations] Player cancels a reservation`
- `[Reservations] Partner cancels a reservation`
- `[Reservations] Player views reservation history`
- `[Reservations] Partner views reservation agenda`

Suggested Tasks:

- `[Backend] Model reservation status lifecycle`
- `[Backend] Prevent duplicate confirmed reservations`
- `[Backend] Expire stale pending reservations`
- `[API] Expose reservation endpoints`
- `[Frontend] Build reservation request flow`
- `[Frontend] Build partner reservation management flow`
- `[E2E] Validate reservation happy path`
- `[E2E] Validate duplicate reservation prevention`
- `[Tests] Cover reservation business-rule failures`

MVP rules:

- reservation status must always be explicit
- statuses are `pending_payment`, `confirmed`, `canceled`, `expired`,
  `completed`
- a confirmed reservation blocks the court slot
- the same court slot cannot have two active confirmed reservations
- cancellation window is still an open business decision

Why after discovery:

- reservations need players, partners, courts, availability, and discovery paths

### Phase 8: Manual Payments

Purpose:

- let the MVP track money state without a gateway

Suggested Epic:

- `[MVP] Manual Payments`

Suggested Stories:

- `[Payments] Partner marks reservation payment as pending`
- `[Payments] Partner marks reservation payment as paid`
- `[Payments] Partner marks reservation payment as failed`
- `[Payments] Partner marks reservation payment as overdue`
- `[Payments] Partner views pending payments`

Suggested Tasks:

- `[Backend] Model payment records`
- `[Backend] Audit manual payment status changes`
- `[API] Expose manual payment update endpoints`
- `[Frontend] Build pending payments view`
- `[Frontend] Build manual payment status controls`
- `[E2E] Validate manual payment update`
- `[Tests] Cover payment status transitions`

MVP rules:

- payment statuses are `pending`, `paid`, `failed`, `overdue`
- `refunded` is V2 unless a real refund workflow exists
- gateway/provider details must not be required for MVP
- manual payment changes should be controlled and auditable

Why after reservations:

- MVP payments are attached to reservation operations first

### Phase 9: Open Matches

Purpose:

- let Sandicts feel like a playable community, not only a booking tool

Suggested Epic:

- `[MVP] Open Matches`

Suggested Stories:

- `[Open Matches] Player creates an open match`
- `[Open Matches] Player joins an open match`
- `[Open Matches] Player leaves an open match`
- `[Open Matches] Creator cancels an open match`
- `[Open Matches] Player filters open matches by sport and level`

Suggested Tasks:

- `[Backend] Model open match lifecycle`
- `[Backend] Prevent duplicate match participation`
- `[Backend] Prevent joining full matches`
- `[API] Expose open match endpoints`
- `[Frontend] Build open match list and detail`
- `[Frontend] Build create and join open match flows`
- `[E2E] Validate open match participation`
- `[Tests] Cover open match business-rule failures`

MVP rules:

- statuses are `open`, `full`, `canceled`, `completed`
- a player cannot join the same open match twice
- a player cannot join a full match
- a player cannot join a canceled or completed match
- match level is an expectation/filter, not a verified athlete identity proof
- partner-created open matches are V2

Why after reservations:

- open matches can reference partner/court or a simple place, but benefit from
  the same player and location vocabulary created earlier

### Phase 10: MVP Hardening

Purpose:

- prepare the MVP for real use

Suggested Epic:

- `[MVP] Launch Hardening`

Suggested Stories or Tasks:

- `[Security] Review cross-partner access boundaries`
- `[Tests] Add MVP critical flow coverage`
- `[API] Review Swagger contracts for MVP flows`
- `[Frontend] Review MVP responsive behavior`
- `[E2E] Run MVP critical path smoke suite`
- `[Docs] Update MVP operational documentation`
- `[DevOps] Validate deployment and environment configuration`

Why last:

- hardening should validate the real MVP surface after core flows exist

## Fullstack Parallelization Rules

Use frontend work to validate product slices early, not as a separate final
polish phase.

### When To Start Frontend

Start frontend planning immediately.

Start frontend implementation when:

- auth endpoint names and response shapes are stable
- local backend startup is predictable for frontend integration
- auth session, token, cookie, CORS, and refresh behavior are decided
- Swagger/OpenAPI or equivalent contracts exist for auth
- Player Profile API shape is drafted

Do not wait for reservations, payments, open matches, or the whole backend MVP
to finish before starting frontend implementation.

### Parallel Module Rhythm

For each MVP module, plan these together:

```text
Product Story
  -> Backend contract and behavior
  -> Frontend screen or flow
  -> Integrated validation gate
```

Recommended Jira shape:

```text
Epic: [MVP] Reservations
  Story: [Reservations] Player requests a court reservation
    Subtask: [Backend] Implement reservation request endpoint
    Subtask: [Frontend] Build reservation request flow
    Subtask: [E2E] Validate reservation request happy path
```

Backend-only completion is not product completion. A module becomes
product-complete only when the integrated gate is validated or the user
explicitly accepts backend-only completion for that stage.

### Fullstack Roadmap Overlay

| Backend phase | Frontend phase | Integration gate |
| --- | --- | --- |
| Auth | App shell, auth screen, session state | Sign in, preserve or refresh session, sign out |
| Player Profile | Profile onboarding UI | Create/update profile, main sport, simple level |
| Partner Onboarding | Partner dashboard shell and profile form | Create/update partner profile |
| Court Management | Court list, detail, creation, pricing, rules | Create court and see it in partner court list |
| Availability | Calendar and slot editor | Publish slot and expose it to discovery data |
| Discovery | Player discovery and filters | Filter courts by sport, availability, and price |
| Reservations | Request flow and partner reservation management | Request, confirm, cancel, and block duplicates |
| Manual Payments | Pending payments and payment status controls | Update payment state and reflect it in reservations |
| Open Matches | Match list, detail, create, join, leave | Create, join, leave, and block invalid joins |
| MVP Hardening | Responsive review and smoke suite | Critical path works end to end |

For detailed frontend planning, use
`docs/frontend/sandicts-frontend-planning.md`.

For page inventory, page behavior, permissions, route drafts, and page-level
open decisions, use `docs/frontend/sandicts-page-functional-spec.md`.

## Dependency Map

Recommended dependency order:

```text
Auth
  -> Frontend App Foundation
  -> Player Profile
  -> Partner Onboarding
  -> Court Management
  -> Availability
  -> Discovery
  -> Reservations
  -> Manual Payments
  -> Open Matches
  -> MVP Hardening
```

Important dependency notes:

- reservations require players, partners, courts, and availability
- frontend app foundation should begin after auth contracts stabilize
- payments should start with reservations before memberships or tournaments
- open matches require player identity and simple level
- tournaments are V2 and should not block MVP reservations or open matches
- B2B school management is V2 and should not block partner/court basics

## V2 And Future Backlog Rules

Do not create detailed MVP Jira issues for V2 features until the MVP core is
healthy.

Allowed:

- keep V2 ideas in `docs/ai/product/sandicts-v2-backlog.md`
- create a small number of V2 Epics if the user wants visibility
- create `[Spike]` Tasks for bounded decisions that affect MVP modeling

Avoid:

- detailed tournament subtasks before reservations exist
- player evolution implementation tasks before basic profile exists
- payment gateway subtasks before manual payments work
- geolocation subtasks before simple discovery works

## Batch Proposal Format

Before creating or editing Jira, Codex should propose a batch like this:

```md
Proposed Jira batch

Goal

<What this batch organizes or creates.>

Changes

| Action | Type | Parent | Title | Priority | Labels |
| ------ | ---- | ------ | ----- | -------- | ------ |
| Create | Epic | - | [MVP] Player Profile Foundation | Medium | mvp,players |
| Create | Story | Player Profile Foundation | [Players] Player manages a basic profile | Medium | mvp,players |
| Edit | Task | KAN-37 | [Backend] Build auth module foundation | Medium | mvp,auth,backend |

Notes

- <Assumption or dependency>
- <Out-of-scope note>
```

Only execute the batch after user approval.

## How To Ask Codex For Jira Work

Useful prompts:

- `Plan the next Jira batch after auth, but do not create anything yet.`
- `Create the approved Player Profile Jira batch.`
- `Normalize KAN-36 title and description using the planning workflow.`
- `Move KAN-40 to In Review and add a short validation comment.`
- `Create subtasks for the current Reservations story only.`
- `Audit Jira against the MVP docs and propose cleanup.`

## What To Do Next

Recommended immediate next steps:

1. finish the active auth work
2. clean up auth Jira titles and descriptions if needed
3. create the Player Profile Foundation Epic and its first Stories
4. create Partner Onboarding and Court Management Epics as roadmap anchors
5. defer detailed subtasks for later phases until each module is close to work

This keeps Jira organized without pretending the full MVP implementation plan is
already known in perfect detail.
