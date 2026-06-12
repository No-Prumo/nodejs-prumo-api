---
title: Sandicts MVP Delivery Roadmap
doc-type: frontend-delivery-roadmap
role: working-draft
priority: high
canonical: docs/frontend/sandicts-mvp-delivery-roadmap.md
related:
  - docs/frontend/sandicts-frontend-tech-decisions.md
  - docs/frontend/sandicts-frontend-planning.md
  - docs/frontend/sandicts-page-functional-spec.md
  - docs/frontend/sandicts-mvp-screens-spec.md
  - docs/ai/product/sandicts-mvp-functional-spec.md
  - docs/ai/product/sandicts-jira-planning-workflow.md
scope: roadmap, frontend, fullstack, docs, ux, figma, mvp, jira
read-when:
  - planning the final Sandicts MVP delivery roadmap
  - creating frontend or fullstack Jira batches
  - deciding what needs a prototype before implementation
  - deciding documentation tasks for MVP delivery
  - choosing the next frontend or fullstack implementation slice
do-not-read-when:
  - implementing a small backend-only fix with no roadmap or UI impact
---

# Sandicts MVP Delivery Roadmap

## Purpose

This document starts the delivery roadmap for the final Sandicts MVP.

It turns frontend decisions, business rules, screen specs, documentation work,
prototype work, and implementation work into explicit roadmap categories.

The key rule:

> Do not treat research, decisions, prototypes, docs, architecture, and
> integration gates as invisible work. They are part of MVP delivery.

## Roadmap Principles

- build the MVP in vertical slices after auth
- keep backend and frontend work connected through API contracts
- create roadmap anchors for the whole MVP, but detail only the current and next
  module
- do not implement a page before its first shippable prototype or wireflow is
  approved enough to build
- do not mark a module complete until its integration gate is validated
- keep docs aligned with product decisions instead of relying on chat history
- keep V2 ideas documented, but prevent them from expanding MVP scope

## Work Types

Use these work types in Jira and roadmap planning.

### Decision Task

Use when the product, UX, architecture, or API shape is not decided.

Title examples:

- `[Spike] Decide frontend repository location`
- `[UX] Decide player and partner navigation model`
- `[Spike] Decide reservation cancellation window`
- `[Frontend] Decide OpenAPI client generator`

Output:

- decision recorded in the relevant doc
- follow-up tasks created only when needed

### Prototype Task

Use before implementing a page, major component, or unclear flow.

Title examples:

- `[UX] Prototype player profile onboarding`
- `[UX] Prototype court discovery mobile flow`
- `[UX] Prototype partner agenda day and week views`
- `[UX] Prototype reservation request and status flow`

Output:

- Figma, wireflow, screenshot, or documented prototype direction
- open decisions resolved or listed
- page spec updated when behavior changes

### Documentation Task

Use when docs need to capture a decision, spec, or delivery rule.

Title examples:

- `[Docs] Document frontend technology decisions`
- `[Docs] Align MVP frontend roadmap`
- `[Docs] Capture approved discovery prototype decisions`
- `[Docs] Reconcile uncommitted MVP documentation`

Output:

- updated docs in `docs/frontend` or `docs/ai`
- links added to index or related docs when needed
- unresolved decisions kept visible

### Foundation Task

Use for setup that supports many features but is not a user story.

Title examples:

- `[Frontend] Create Next.js app foundation`
- `[Frontend] Configure shadcn/ui and Tailwind tokens`
- `[Frontend] Configure TanStack Query`
- `[Frontend] Configure generated OpenAPI client`
- `[Frontend] Configure Playwright and Vitest`

Output:

- runnable frontend foundation
- repeatable scripts
- baseline architecture rules
- first reusable states/components

### Feature Story

Use when the issue delivers visible user value.

Title examples:

- `[Players] Player manages a basic profile`
- `[Courts] Partner creates a court`
- `[Reservations] Player requests a court reservation`
- `[Open Matches] Player joins an open match`

Output:

- backend behavior when needed
- frontend behavior when needed
- docs updated when behavior changes
- integration gate validated

## Pre-Implementation Rule For Pages

Before starting any MVP page or major component, create or complete this chain:

1. decision task for unresolved product/UX/API questions
2. prototype task for the page or flow
3. documentation task to capture approved behavior
4. API contract task or mock-contract task
5. frontend implementation task
6. integrated validation task

This rule applies to:

- sign-in
- player home
- player profile onboarding/editing
- discovery
- court detail
- reservation request
- reservation history/detail
- open match list/detail/create
- partner setup
- partner dashboard
- court management
- availability calendar
- agenda day/week
- partner reservation detail
- manual payments

## Phase 0: Documentation And Roadmap Foundation

Purpose:

- make the MVP delivery system explicit before creating many implementation
  issues

Suggested tasks:

- `[Docs] Document frontend technology decisions`
- `[Docs] Align MVP frontend roadmap`
- `[Docs] Reconcile uncommitted MVP documentation`
- `[Docs] Update AI index with frontend roadmap docs`
- `[Jira] Create MVP roadmap anchor epics`
- `[Jira] Add decision, prototype, docs, and integration task conventions`

Exit criteria:

- frontend stack decisions are documented
- roadmap includes decision/prototype/docs tasks
- docs list the main open decisions
- Jira workflow can represent non-feature work clearly

## Phase 1: Frontend App Foundation

Purpose:

- create the base app that all MVP pages will use

Decision tasks:

- `[Spike] Decide frontend repository location`
- `[Frontend] Decide package manager and Node.js version`
- `[Frontend] Decide OpenAPI client generator`
- `[DevOps] Decide frontend deployment target`
- `[UX] Decide player and partner navigation model`
- `[UX] Decide mobile navigation model`

Prototype tasks:

- `[UX] Prototype public, player, and partner app shells`
- `[Design] Prototype Sandicts visual tokens and base components`
- `[UX] Prototype global loading, empty, error, forbidden, and not-found states`

Implementation tasks:

- `[Frontend] Create Next.js App Router project`
- `[Frontend] Configure TypeScript, lint, format, and path aliases`
- `[Frontend] Configure Tailwind CSS and shadcn/ui`
- `[Frontend] Configure lucide-react icon usage`
- `[Frontend] Configure TanStack Query`
- `[Frontend] Configure generated OpenAPI client workflow`
- `[Frontend] Configure React Hook Form and Zod patterns`
- `[Frontend] Configure Zustand local UI state boundary`
- `[Frontend] Configure Playwright`
- `[Frontend] Configure Vitest and Testing Library`
- `[Frontend] Build public, player, and partner layout shells`
- `[Frontend] Build reusable base states and status badges`

Exit criteria:

- frontend runs locally
- backend URL and credentials behavior are configurable
- base app areas exist
- base state components exist
- test commands exist
- architecture rules are documented

## Phase 2: Auth Integration

Purpose:

- prove real backend and frontend session integration

Decision tasks:

- `[Frontend] Decide auth session hydration flow`
- `[UX] Decide expired session experience`
- `[UX] Decide post-login routing`
- `[UX] Decide Google One Tap placement and fallback behavior`

Prototype tasks:

- `[UX] Prototype sign-in screen`
- `[UX] Prototype expired session state`
- `[UX] Prototype auth error state`

Implementation tasks:

- `[Frontend] Build sign-in screen`
- `[Frontend] Integrate Google Sign-In`
- `[Frontend] Integrate Google One Tap`
- `[Frontend] Implement auth session query`
- `[Frontend] Implement protected route behavior`
- `[Frontend] Implement sign-out flow`
- `[E2E] Validate web auth happy path`
- `[E2E] Validate expired session handling`

Exit criteria:

- user can sign in through the frontend
- frontend can hydrate current session
- protected routes redirect predictably
- expired sessions show the approved UX
- user can sign out

## Phase 3: Player Profile

Purpose:

- create the minimum player identity needed for reservations and open matches

Decision tasks:

- `[UX] Decide player profile onboarding shape`
- `[Players] Decide exact MVP required profile fields`
- `[API] Decide player profile contract`

Prototype tasks:

- `[UX] Prototype player profile onboarding`
- `[UX] Prototype player profile edit screen`
- `[Design] Prototype sport and level selectors`

Implementation tasks:

- `[Backend] Expose player profile contract`
- `[Frontend] Build player profile onboarding`
- `[Frontend] Build player profile edit screen`
- `[Frontend] Map validation and business-rule errors`
- `[E2E] Validate player profile onboarding`

Exit criteria:

- authenticated player can create or update basic profile
- main sport and simple level are saved and reloaded
- incomplete profile behavior is clear

## Phase 4: Partner Foundation

Purpose:

- let the supply side create a partner profile and enter the operational area

Decision tasks:

- `[Partners] Decide exact MVP partner profile fields`
- `[UX] Decide partner setup and dashboard first-run flow`
- `[API] Decide partner profile contract`

Prototype tasks:

- `[UX] Prototype partner setup`
- `[UX] Prototype partner dashboard shell`
- `[Design] Prototype operational dashboard density`

Implementation tasks:

- `[Backend] Expose partner profile contract`
- `[Frontend] Build partner setup flow`
- `[Frontend] Build partner dashboard shell`
- `[Frontend] Build partner access boundary states`
- `[E2E] Validate partner profile setup`

Exit criteria:

- authenticated user can create or update partner profile
- partner area handles missing profile, forbidden, loading, and error states

## Phase 5: Court Management

Purpose:

- let partners create and manage reservable courts

Decision tasks:

- `[Courts] Decide exact MVP court fields`
- `[Courts] Decide pricing model for first MVP implementation`
- `[Courts] Decide active/inactive behavior in UI`
- `[API] Decide court management contract`

Prototype tasks:

- `[UX] Prototype court list`
- `[UX] Prototype create and edit court form`
- `[Design] Prototype court status and pricing display`

Implementation tasks:

- `[Backend] Expose court management contract`
- `[Frontend] Build court list`
- `[Frontend] Build create and edit court flow`
- `[Frontend] Build active/inactive controls`
- `[E2E] Validate partner court setup`

Exit criteria:

- partner can create, edit, activate, and deactivate courts
- inactive court state is visible and blocks reservation paths

## Phase 6: Availability And Agenda

Purpose:

- let partners publish availability and operate the daily/weekly schedule

Decision tasks:

- `[Availability] Decide whether availability is by court or court and sport`
- `[Availability] Decide slot duration rules`
- `[Availability] Decide recurring availability MVP scope`
- `[UX] Decide agenda day and week density`
- `[API] Decide availability and agenda contracts`

Prototype tasks:

- `[UX] Prototype availability calendar`
- `[UX] Prototype slot editor`
- `[UX] Prototype partner agenda day view`
- `[UX] Prototype partner agenda week view`

Implementation tasks:

- `[Backend] Expose availability and agenda contracts`
- `[Frontend] Build availability calendar`
- `[Frontend] Build slot editor`
- `[Frontend] Build agenda day view`
- `[Frontend] Build agenda week view`
- `[E2E] Validate availability publishing`

Exit criteria:

- partner can publish available slots
- invalid or overlapping slots are handled clearly
- agenda views are usable on target devices

## Phase 7: Discovery

Purpose:

- let players find courts by simple MVP filters

Decision tasks:

- `[Discovery] Decide whether public discovery exists before login`
- `[Discovery] Decide whether visitors see exact available slots`
- `[UX] Decide discovery filter behavior`
- `[API] Decide discovery contract`

Prototype tasks:

- `[UX] Prototype player court discovery`
- `[UX] Prototype court result cards`
- `[UX] Prototype court detail screen`
- `[Design] Prototype empty search results state`

Implementation tasks:

- `[Backend] Expose discovery contract`
- `[Frontend] Build discovery filters`
- `[Frontend] Build court results`
- `[Frontend] Build court detail`
- `[Frontend] Connect selected slot to reservation flow`
- `[E2E] Validate court discovery filters`

Exit criteria:

- player can filter by sport, availability, and price
- empty states guide the next action
- court detail can hand off to reservation request

## Phase 8: Reservations

Purpose:

- prove the marketplace booking loop

Decision tasks:

- `[Reservations] Decide cancellation window`
- `[Reservations] Decide initial reservation status`
- `[Reservations] Decide partner confirmation behavior`
- `[UX] Decide reservation request review flow`
- `[API] Decide reservation contracts`

Prototype tasks:

- `[UX] Prototype reservation request flow`
- `[UX] Prototype player reservation history`
- `[UX] Prototype player reservation detail`
- `[UX] Prototype partner reservation detail`
- `[Design] Prototype reservation status badges and blocked actions`

Implementation tasks:

- `[Backend] Expose reservation contracts`
- `[Frontend] Build reservation request flow`
- `[Frontend] Build player reservation history`
- `[Frontend] Build player reservation detail`
- `[Frontend] Build partner reservation detail`
- `[Frontend] Build confirm and cancel actions`
- `[E2E] Validate reservation happy path`
- `[E2E] Validate duplicate reservation prevention`

Exit criteria:

- player can request a reservation
- partner can confirm or cancel
- player can cancel when allowed
- duplicate confirmed reservations are blocked and understandable

## Phase 9: Manual Payments

Purpose:

- expose payment state without gateway integration

Decision tasks:

- `[Payments] Decide allowed manual payment transitions`
- `[UX] Decide payment update confirmation behavior`
- `[API] Decide manual payment contracts`

Prototype tasks:

- `[UX] Prototype pending payments view`
- `[UX] Prototype manual payment update control`
- `[Design] Prototype payment status badges`

Implementation tasks:

- `[Backend] Expose manual payment contracts`
- `[Frontend] Build pending payments view`
- `[Frontend] Build payment status controls`
- `[Frontend] Reflect payment status in reservation views`
- `[E2E] Validate manual payment update`

Exit criteria:

- partner can see pending, failed, paid, and overdue payments
- partner can update payment status when allowed
- reservation views reflect payment state

## Phase 10: Open Matches

Purpose:

- make the community loop playable in the MVP

Decision tasks:

- `[Open Matches] Decide open match place representation`
- `[Open Matches] Decide whether creator joins automatically`
- `[Open Matches] Decide edit behavior after participants join`
- `[UX] Decide level mismatch warning or block behavior`
- `[API] Decide open match contracts`

Prototype tasks:

- `[UX] Prototype open match list`
- `[UX] Prototype open match detail`
- `[UX] Prototype create open match flow`
- `[Design] Prototype participant and capacity display`

Implementation tasks:

- `[Backend] Expose open match contracts`
- `[Frontend] Build open match list`
- `[Frontend] Build open match detail`
- `[Frontend] Build create open match flow`
- `[Frontend] Build join, leave, and cancel actions`
- `[E2E] Validate open match participation`

Exit criteria:

- player can create, join, and leave open matches
- full, canceled, completed, and already-joined states are clear
- invalid joins are blocked and understandable

## Phase 11: Launch Hardening

Purpose:

- prepare the MVP for controlled real-user validation

Decision tasks:

- `[MVP] Decide launch-blocking open decisions`
- `[Admin] Decide whether MVP needs minimal internal admin tooling`
- `[DevOps] Decide production and preview environment rules`

Implementation and validation tasks:

- `[Security] Review cross-partner access boundaries`
- `[Frontend] Review responsive behavior for MVP flows`
- `[API] Review Swagger contracts for MVP flows`
- `[E2E] Run MVP critical path smoke suite`
- `[Tests] Cover MVP business-rule failures`
- `[Docs] Update MVP operational documentation`
- `[DevOps] Validate frontend and backend deployment configuration`

Exit criteria:

- all MVP module gates pass
- launch-blocking open decisions are resolved or explicitly accepted
- docs describe how to run, test, and operate the MVP
- deployment path is validated

## Current Open Decision Backlog

Resolved foundation decisions:

- frontend repository location: `sandicts/reactjs-sandicts-web`
- local frontend path: `apps/reactjs-sandicts-web`
- frontend runtime: Node.js 24 LTS with npm 11
- local ports: API on `3000`, frontend on `3001`

Frontend foundation:

- OpenAPI generator
- deployment target
- CI checks and commands

UX and app shell:

- player-first, partner-first, or balanced first experience
- player and partner navigation model
- mobile navigation model
- route map
- breakpoint strategy
- global state templates

Auth:

- cookie/session behavior with backend
- session hydration endpoint
- expired session UX
- sign-out behavior
- post-login routing

Product and page decisions:

- public discovery before login
- visitor visibility for exact available slots
- exact MVP profile fields
- exact MVP partner profile fields
- pricing model for court/availability
- availability by court or by court and sport
- slot duration rules
- reservation cancellation window
- initial reservation status and partner confirmation flow
- open match place representation
- whether creator joins an open match automatically
- minimal admin need before launch

## Documentation Backlog

Track docs work explicitly.

Immediate docs tasks:

- `[Docs] Document frontend technology decisions`
- `[Docs] Create MVP delivery roadmap`
- `[Docs] Align frontend planning with decided stack`
- `[Docs] Add frontend roadmap docs to AI index`
- `[Docs] Reconcile uncommitted MVP functional and screen specs`

Recurring docs tasks:

- update page spec after each approved prototype
- update business rules when a product rule becomes a backend invariant
- update frontend planning when app architecture changes
- update Jira workflow when delivery conventions change
- update README only when setup, commands, environment, or behavior described
  there changes

## First Jira Batch Recommendation

Do not create every MVP issue at once.

Recommended first batch:

- `[Docs] Document frontend technology decisions`
- `[Docs] Create MVP delivery roadmap`
- `[Spike] Decide frontend repository location`
- `[Frontend] Decide package manager and Node.js version`
- `[Frontend] Decide OpenAPI client generator`
- `[UX] Decide player and partner navigation model`
- `[Design] Define MVP visual tokens and component direction`
- `[UX] Prototype public, player, and partner app shells`
- `[Frontend] Create Next.js app foundation`
- `[Frontend] Configure shadcn/ui, Tailwind CSS, and lucide-react`
- `[Frontend] Configure TanStack Query and API client foundation`
- `[Frontend] Configure Playwright, Vitest, and Testing Library`

After that, detail auth and player profile only. Keep later modules as roadmap
anchors until they are close enough for decisions and prototypes.
