---
title: Sandicts MVP Frontend Roadmap Draft
doc-type: frontend-roadmap
role: working-draft
priority: high
scope: frontend, fullstack, mvp, jira-planning
created: 2026-06-11
read-when:
  - auditing the original frontend roadmap discovery notes
  - comparing the durable roadmap with the initial discovery draft
  - recovering context from the legacy planning phase
do-not-read-when:
  - using the current MVP delivery roadmap
  - creating routine frontend Jira issues
  - implementing backend, frontend, CI, or docs changes
---

# Sandicts MVP Frontend Roadmap Draft

## Purpose

This draft translates the current Sandicts MVP direction and the legacy
`sports-rats-web` audit into a frontend roadmap.

This is a discovery draft, not the current source of truth. Prefer
`docs/frontend/sandicts-mvp-delivery-roadmap.md` for active delivery planning.

It should guide Jira planning, but detailed Jira tasks should still be created
just in time for the current module and the next module.

## Planning Principle

Do not build the full backend first and then start the frontend.

Use thin vertical slices:

1. product rule
2. backend contract
3. backend behavior
4. frontend flow
5. integrated validation

The backend can lead by one slice, but every major MVP module should have a
frontend task and an integration gate before it is considered product-complete.

## MVP Frontend Product Areas

### Public Area

Purpose:

- make account entry fast
- support Google Sign-In and Google One Tap
- avoid making password login part of the default MVP path

Initial screens:

- sign-in
- auth callback/error state if needed

Open decision:

- whether unauthenticated users can browse public discovery before signing in

### Player Area

Purpose:

- help players find courts, reserve time, and join open matches

Initial screens:

- player home
- profile onboarding
- court discovery
- court detail
- reservation request
- reservation history
- open match list
- open match detail
- create open match

MVP profile scope:

- display name
- main sport
- simple level by sport

Not MVP:

- player card progression
- detailed skill attributes
- public profile
- achievements
- rankings

### Partner Area

Purpose:

- help partners publish court supply and operate reservations

Initial screens:

- partner dashboard
- partner profile
- court list
- court create/edit
- availability calendar
- agenda day/week view
- reservation detail and decision
- pending/manual payments

Not MVP:

- school ERP
- teacher/class management
- memberships
- rich financial reports
- tournament operations

## Roadmap Phases

### F0: Frontend Planning And Rules

Goal:

- define enough app rules to create Jira issues and avoid rebuilding the shell

Deliverables:

- frontend repository/location decision
- Node.js version decision
- styling/component strategy decision
- app route map
- player vs partner navigation model
- auth/session frontend strategy
- API client strategy
- base error/loading/empty-state rules

Suggested Jira issues:

- `[Frontend] Define web app architecture and route map`
- `[UX] Define player and partner navigation model`
- `[Design] Define MVP visual tokens and component strategy`
- `[Frontend] Define auth session integration strategy`

Exit gate:

- frontend issues can be created with clear dependencies on backend auth and
  player profile contracts

### F1: App Foundation

Goal:

- create the frontend shell used by all MVP screens

Deliverables:

- Next.js app foundation
- TypeScript configuration
- environment variable validation
- API client with credentials
- route groups/layouts
- provider setup
- base UI primitives
- app shell for public, player, and partner areas

Suggested Jira issues:

- `[Frontend] Create Next.js app foundation`
- `[Frontend] Configure environment and API client foundation`
- `[Frontend] Build public and protected layout shell`
- `[Frontend] Add base loading, empty, and error states`

Exit gate:

- frontend runs locally and can call the backend health/auth surface

### F2: Integrated Auth

Goal:

- prove real Sandicts auth from browser to backend session

Deliverables:

- Google sign-in button
- Google One Tap entry
- sign-out flow
- session hydration
- protected route behavior
- expired-session behavior
- provider-safe public error messages

Backend dependencies:

- Google sign-in endpoint
- refresh/session endpoint
- sign-out endpoint
- current session/account endpoint
- CORS and cookie policy

Suggested Jira issues:

- `[Frontend] Implement Google sign-in screen`
- `[Frontend] Implement Google One Tap entry`
- `[Frontend] Implement auth session state`
- `[Frontend] Implement sign-out flow`
- `[E2E] Validate web auth happy path`
- `[E2E] Validate expired session handling`

Exit gate:

- user can sign in with Google, refresh/preserve the session, and sign out

### F3: Player Profile

Goal:

- create the first post-auth product experience

Deliverables:

- profile onboarding
- profile edit form
- main sport selection
- simple level by sport
- incomplete profile state

Backend dependencies:

- current player profile endpoint
- update player profile endpoint
- sport catalog endpoint or stable enum/seed strategy

Suggested Jira issues:

- `[Frontend] Build player profile onboarding`
- `[Frontend] Build player profile edit form`
- `[Frontend] Build main sport selector`
- `[Frontend] Build simple level selector by sport`
- `[E2E] Validate player profile onboarding`

Exit gate:

- authenticated player can complete the minimum profile required for discovery,
  reservations, and open matches

### F4: Partner Foundation

Goal:

- create partner-facing entry and role boundary

Deliverables:

- partner dashboard shell
- partner profile form
- partner access boundary states
- missing-partner setup state

Backend dependencies:

- partner profile create/read/update
- authenticated account role or partner membership model
- forbidden state for cross-partner access

Suggested Jira issues:

- `[Frontend] Build partner dashboard shell`
- `[Frontend] Build partner profile form`
- `[Frontend] Add partner access boundary states`
- `[E2E] Validate partner profile setup`

Exit gate:

- partner can set up a profile and land in a usable partner dashboard

### F5: Court Management

Goal:

- let partners create and manage marketplace supply

Deliverables:

- court list
- court detail/edit
- court creation form
- supported sports selector
- pricing/rules form
- activation/deactivation controls

Backend dependencies:

- court create/read/update
- court activation rules
- supported sports model
- partner-scoped authorization

Suggested Jira issues:

- `[Frontend] Build court list and detail screens`
- `[Frontend] Build court creation form`
- `[Frontend] Build supported sports selector`
- `[Frontend] Build court pricing and rules form`
- `[Frontend] Build court activation controls`
- `[E2E] Validate partner court setup`

Exit gate:

- partner can create a court and see it listed in the partner area

### F6: Availability Calendar

Goal:

- let partners publish available court slots

Deliverables:

- availability calendar
- slot editor
- agenda day view
- agenda week view
- overlap/invalid-slot feedback

Backend dependencies:

- availability slot create/read/update/delete
- overlap prevention
- court availability query

Suggested Jira issues:

- `[Frontend] Build partner availability calendar`
- `[Frontend] Build availability slot editor`
- `[Frontend] Build agenda day view`
- `[Frontend] Build agenda week view`
- `[E2E] Validate availability publishing`

Exit gate:

- partner can publish a slot and see it reflected in operational views

### F7: Discovery

Goal:

- let players find courts by MVP filters

Deliverables:

- discovery screen
- sport filter
- availability filter
- price filter
- result cards
- empty states
- link into court detail/reservation

Backend dependencies:

- discovery query by sport, availability, and price
- partner/court listing DTOs
- available slot summary

Suggested Jira issues:

- `[Frontend] Build player discovery screen`
- `[Frontend] Build sport filter`
- `[Frontend] Build availability filter`
- `[Frontend] Build price filter`
- `[Frontend] Build court and partner result cards`
- `[E2E] Validate court discovery filters`

Exit gate:

- player can filter courts and choose a candidate reservation slot

### F8: Reservations

Goal:

- let players request reservations and partners manage decisions

Deliverables:

- reservation request flow
- player reservation history
- partner reservation detail
- partner confirm/cancel actions
- player cancel action
- status badges and business-rule errors

Backend dependencies:

- reservation request endpoint
- reservation status model
- partner confirmation/cancellation endpoints
- player cancellation endpoint
- duplicate slot prevention

Suggested Jira issues:

- `[Frontend] Build reservation request flow`
- `[Frontend] Build player reservation history`
- `[Frontend] Build partner reservation detail`
- `[Frontend] Build partner reservation confirmation flow`
- `[Frontend] Build reservation cancellation flow`
- `[E2E] Validate reservation happy path`
- `[E2E] Validate duplicate reservation prevention`

Exit gate:

- player can request a slot, partner can confirm it, and duplicate confirmed
  reservations are blocked

### F9: Manual Payments

Goal:

- expose manual payment tracking without payment gateway dependency

Deliverables:

- pending payments view
- manual payment status control
- payment status badges
- payment state reflected in reservation views

Backend dependencies:

- payment status model
- manual payment update endpoint
- payment audit fields if required

Suggested Jira issues:

- `[Frontend] Build pending payments view`
- `[Frontend] Build manual payment status control`
- `[Frontend] Build payment status badges`
- `[E2E] Validate manual payment update`

Exit gate:

- partner can mark a reservation payment state and the reservation reflects it

### F10: Open Matches

Goal:

- make the community loop usable in the MVP

Deliverables:

- open match list
- open match detail
- create open match flow
- join action
- leave action
- match level filter
- full/canceled/completed states

Backend dependencies:

- open match create/read/update
- participant join/leave endpoints
- duplicate join prevention
- full/canceled/completed rules

Suggested Jira issues:

- `[Frontend] Build open match list`
- `[Frontend] Build open match detail`
- `[Frontend] Build create open match flow`
- `[Frontend] Build join and leave match actions`
- `[Frontend] Build match level filter`
- `[E2E] Validate open match participation`

Exit gate:

- player can create, join, and leave an open match while invalid joins are
  handled clearly

## Immediate Jira Planning Recommendation

Create roadmap anchors now:

- `[MVP] Authentication and Account Access`
- `[MVP] Player Profile`
- `[MVP] Partner Onboarding`
- `[MVP] Court Management`
- `[MVP] Availability`
- `[MVP] Discovery`
- `[MVP] Reservations`
- `[MVP] Manual Payments`
- `[MVP] Open Matches`
- `[Frontend] Web App Foundation`
- `[MVP] Launch Hardening`

Create detailed tasks now only for:

- remaining auth integration
- frontend planning and app foundation
- player profile backend/frontend slice

Do not create all detailed frontend subtasks for reservations, payments, and
open matches yet. Keep those as epic/story-level roadmap anchors until their
backend contracts are close enough.

## Decisions Needed Before Creating Frontend Tickets

- frontend repository location
- Node.js version
- package manager
- styling/component library
- route map
- player/partner navigation split
- auth session source of truth
- public discovery before sign-in
- first design token set
- test strategy
- deployment target

## Recommended Next Step

Use this draft to create a small Jira batch:

1. clean up the existing auth Jira state
2. create missing MVP roadmap epics
3. create frontend foundation planning tasks
4. create detailed player profile slice tasks
5. leave later modules as high-level epics until the current slice is closer to
   implementation
