---
title: Sandicts Page Functional Specification
doc-type: frontend-functional-spec
role: working-draft
priority: high
canonical: docs/frontend/sandicts-page-functional-spec.md
related:
  - docs/frontend/sandicts-frontend-context.md
  - docs/frontend/sandicts-frontend-tech-decisions.md
  - docs/frontend/sandicts-mvp-delivery-roadmap.md
  - docs/frontend/sandicts-frontend-planning.md
  - docs/ai/product/sandicts-product-context.md
  - docs/ai/product/sandicts-mvp-scope.md
  - docs/ai/product/sandicts-v2-backlog.md
  - docs/ai/business/sandicts-business-rules.md
scope: frontend, pages, product-rules, user-flows, mvp, v2, backlog
read-when:
  - defining Sandicts pages or routes
  - planning frontend Jira issues
  - planning fullstack product slices
  - deciding MVP versus V2 page scope
  - mapping frontend behavior to backend business rules
do-not-read-when:
  - changing backend-only implementation details with no page or user-flow impact
---

# Sandicts Page Functional Specification

## Purpose

This document consolidates the page and flow descriptions provided by the user
into a functional page specification.

It intentionally focuses on:

- user roles
- pages
- page behavior
- business rules
- permissions
- open decisions
- MVP, V2, and future placement

It intentionally does not treat architecture suggestions from the source summary
as final decisions. Architecture, stack, state management, repository layout, and
implementation patterns must be decided separately.

Current frontend stack decisions live in
`docs/frontend/sandicts-frontend-tech-decisions.md`. Delivery sequencing,
prototype tasks, documentation tasks, and implementation gates live in
`docs/frontend/sandicts-mvp-delivery-roadmap.md`.

## How To Use This Document

Use this document before creating Jira Epics, Stories, Tasks, or Subtasks for
frontend and fullstack work.

Planning order:

1. read the MVP and business-rule docs
2. read this page spec
3. classify each page as MVP, V2, future, or open decision
4. define the route and user flow
5. define the backend contract needed by the page
6. create Jira issues only after the user approves the batch

This document is a working draft. When a rule becomes a backend invariant, copy
or reconcile it into `docs/ai/business/sandicts-business-rules.md` or the MVP
scope docs as appropriate.

## Scope Classification

Use these labels:

- `MVP`: confirmed by current MVP scope or necessary for the MVP flow
- `MVP candidate`: useful for MVP, but needs explicit product confirmation
- `V2`: confirmed or strongly aligned with V2 scope
- `Future`: later than V2 or explicitly excluded from MVP
- `Open decision`: cannot be classified safely yet

Important current MVP constraints:

- geolocation is not MVP
- tournaments are not MVP
- full school ERP is not MVP
- students, memberships, teachers, and classes are V2
- payment gateway, split, and payout automation are not MVP
- player evolution, card, overall, rankings, and achievements are not MVP
- manual reservation payment status is MVP
- player-created open matches are MVP

## Roles

### Visitor

Phase:

- MVP

Definition:

- A person who is not authenticated.

Can:

- view public court discovery
- view public partner or venue information
- view public school information if school discovery is enabled
- view available time slots
- filter public discovery by basic filters
- open detail pages

Cannot:

- reserve a court
- join an open match
- create an open match
- schedule a class
- express operational intent that requires follow-up
- access profile pages
- access partner, school, or admin areas

Rules:

- Public viewing can be allowed.
- Any practical action requires login.
- The product should avoid blocking discovery too early.
- When a visitor attempts a gated action, redirect to sign-in and resume the
  attempted flow after authentication when possible.

Open decisions:

- whether public discovery includes only courts or also schools
- whether public users can see all available slots or only summary availability
- whether contact actions are MVP and whether they require login

### Player

Phase:

- MVP

Definition:

- An authenticated user who uses Sandicts to play, reserve courts, or join open
  matches.

Can:

- complete a basic player profile
- search courts
- filter by sport
- view available slots
- request reservations
- view own reservations
- cancel reservations when allowed
- create open matches
- join open matches
- leave open matches
- view own activity history when implemented

MVP profile fields:

- display name
- city
- main sport
- simple self-declared level by sport

Candidate or V2 profile fields:

- school where the player trains
- preferred court side: left, right, both
- dominant foot: right, left, both
- public profile
- player photo
- bio
- nationality
- full athlete card
- fundamentals
- overall score
- achievements

Rules:

- Simple level is self-declared.
- Simple level is a filter and expectation, not an official ranking.
- The player can only see their own private reservation history.
- The player cannot access partner, school, or admin operational areas unless
  granted a separate role.

Open decisions:

- whether court side belongs in MVP or V2
- whether dominant foot belongs in MVP or V2
- whether player city is required or optional in MVP
- whether a player can also be a partner admin in the same account

### Student

Phase:

- V2

Definition:

- A player linked to a school plan or class operation.

Can:

- view available classes for the week
- choose classes according to plan limits
- view own classes
- request or use extra classes if approved
- see class cancellation and choose another time when needed

Rules:

- Student behavior depends on school, plan, payment, and class modules.
- Current MVP docs place students, memberships, teachers, and classes in V2.
- Student pages should not block MVP reservation or open match delivery.

Open decisions:

- whether any lightweight school affiliation belongs in MVP profile
- whether class selection is V2 or should be pulled earlier
- whether unpaid students are automatically blocked or only flagged

### Partner Or Venue Operator

Phase:

- MVP

Definition:

- A user or organization profile that manages courts and reservations.

Can:

- create or edit partner profile
- create courts
- define sports accepted by court
- define court rules
- define prices
- define availability
- manage reservations
- confirm or cancel reservations
- update manual payment status
- view operational agenda
- configure simple services or amenities

Cannot in MVP:

- process online payments
- use payment gateway integration
- automate split or payouts
- run advanced financial reports
- manage full inventory
- run automated maintenance alerts
- manage full school ERP unless school scope is explicitly pulled forward

Rules:

- Partners are the source of truth for court availability.
- A partner can manage only its own data.
- Cross-partner access is forbidden.
- Manual payment state changes should be auditable.
- A partner may be an arena, school, club, or organizer at the product level,
  but school-specific class operations are V2 unless scope changes.

Open decisions:

- whether partner reservation confirmation is always manual in MVP
- whether any reservation can be automatically confirmed
- whether partner and school are one profile with modules or separate profiles
- whether availability is defined by court only or by court and sport
- whether price is fixed by court or varies by period

### School Operator

Phase:

- V2

Definition:

- A user or organization profile that manages teachers, classes, students, and
  weekly plans.

Can:

- create school profile
- create teachers
- organize calendar by teacher
- create classes
- set class theme
- set minimum and maximum level
- set minimum and maximum students
- control student allocation
- cancel classes when minimum is not reached
- allow students to choose classes according to plan
- block class scheduling when payment is not valid
- approve extra classes when allowed

Rules:

- A school is not only a court.
- School logic includes students, teachers, plans, and class operations.
- An organization can be only a venue, only a school, or both.
- The current MVP excludes full school management.

Open decisions:

- whether teachers have their own login in V2
- whether extra classes are V2 or future
- whether teacher approval alone can allow an extra class
- whether school approval is required for every exception

### Partner Or School Admin

Phase:

- MVP candidate for partner admin, V2 for school admin details

Definition:

- A user with permission to manage a partner or school account.

Can:

- edit organization data
- configure courts or classes depending on module
- manage reservations or classes depending on module
- add other admins if permission is enabled
- transfer ownership if permission is enabled
- view relevant audit logs

Rules:

- Sensitive administrative actions should record who acted and when.
- Cross-organization access must be forbidden.
- Ownership transfer must be explicit.

Open decisions:

- permission model between owner and admins
- whether admin management belongs in MVP
- whether detailed audit log UI belongs in MVP or starts as backend records only

### Sandicts Admin

Phase:

- MVP candidate for sports catalog and support operations; full admin is future

Definition:

- Internal Sandicts operator or owner.

Can:

- manage global data if admin tooling exists
- manage sports catalog
- inspect support context
- review audit logs
- resolve operational issues

Rules:

- Build admin UI only when there is a real MVP operational need.
- Internal operations can start manually if that is faster and safe.
- Auditability is still important even if no admin UI exists yet.

Open decisions:

- whether the MVP needs a full admin area
- whether sports are seeded/configured manually or managed through UI
- which support actions need UI versus database/script/manual operation

## Public Pages

### Public Home And Discovery

Suggested route:

- `/`
- `/discovery`

Phase:

- MVP

Purpose:

- Let visitors and authenticated users discover courts and possibly schools
  before committing to an action.

Users:

- visitor
- player

Content:

- court list
- school list if enabled
- sports available
- available slots
- basic filters
- sign-in CTA for gated actions

Allowed without login:

- view courts
- view partner or venue details
- view schools if public school discovery is enabled
- view available slots
- filter by basic filters
- open details

Blocked without login:

- reserve
- join open match
- create open match
- contact operationally if contact is enabled
- schedule class
- express booking or class intent

Rules:

- Discovery helps acquisition.
- Login should be required only at the point of practical action.
- MVP discovery uses simple filters, not geolocation.
- Public school discovery is allowed only as a display concept unless school
  operations are pulled into MVP.

Open decisions:

- whether the root page is a marketing page, discovery page, or hybrid
- whether school cards appear in MVP discovery
- whether visitors can see exact time slots

### Sign In

Suggested route:

- `/sign-in`

Phase:

- MVP

Purpose:

- Authenticate users with low friction.

Users:

- visitor
- expired authenticated user

Actions:

- sign in with Google
- use Google One Tap
- sign out from an authenticated state
- refresh or preserve session

Post-auth routing:

- incomplete profile goes to onboarding
- complete player profile goes to player home
- user attempting reservation returns to reservation flow
- user attempting class scheduling returns to class flow if class module exists
- partner admin may route to partner dashboard if that context is active

States:

- loading
- authentication error
- expired session
- already signed in

Rules:

- Auth should preserve the user's intended action when possible.
- Expired session behavior must be predictable.
- Auth errors should be understandable without exposing provider internals.

## Player Pages

### Player Home

Suggested route:

- `/app`

Phase:

- MVP

Purpose:

- Act as the authenticated player dashboard.

Content:

- upcoming reservations
- open match suggestions
- shortcuts to court discovery
- shortcut to create open match
- profile completion prompt
- reservation history shortcut
- classes only if school module is enabled

Rules:

- If the profile is incomplete, the home should block or strongly guide profile
  completion before practical actions.
- The MVP home should not become a social feed.
- Tournament, ranking, and progression widgets are not MVP.

Open decisions:

- whether profile completion blocks all actions or only selected actions
- whether upcoming classes appear before school module is implemented

### Profile Onboarding

Suggested route:

- `/app/onboarding`

Phase:

- MVP for basic fields; V2 for extended sport identity

Purpose:

- Collect the minimum data needed for reservations and open matches.

MVP fields:

- display name
- city if confirmed
- main sport
- simple level

Candidate fields:

- preferred court side
- dominant foot
- school where the player trains

Actions:

- save profile
- edit later

Rules:

- Onboarding should not ask for too much.
- No photo, bio, ranking, achievements, or athlete card in MVP.
- The goal is to enable reservation, open match, and later class flows.

Open decisions:

- exact required fields
- whether side and dominant foot are MVP
- whether school affiliation is MVP

### Player Profile

Suggested route:

- `/app/profile`

Phase:

- MVP for basic editable profile

Purpose:

- Let the player edit basic personal and sport data.

Content:

- display name
- city
- main sport
- levels by sport
- school link if enabled
- preferred court side if enabled
- dominant foot if enabled
- summary history if useful

Actions:

- edit profile
- update main sport
- update level
- update school link if enabled

Out of MVP:

- public profile
- ranking
- overall
- detailed fundamentals
- athlete card
- achievements
- media upload

Rules:

- Level is self-declared in MVP.
- Profile changes should not create official ranking claims.

### Discover Courts

Suggested route:

- `/app/courts`
- `/discovery`

Phase:

- MVP

Purpose:

- Let players find reservable courts.

Filters:

- sport
- partner or venue
- date
- time
- price
- availability

List should show:

- partner or venue name
- court name
- accepted sports
- price
- available slots
- status
- simple amenities such as food and beverage icons

Actions:

- open detail
- choose time
- start reservation

Rules:

- inactive courts are not reservable
- unavailable slots cannot be reserved
- price must be visible before reservation request
- no geolocation in MVP unless product scope changes

Open decisions:

- whether exact time selection starts in list or detail
- whether amenities affect filtering or are display-only in MVP

### Court Or Venue Detail

Suggested route:

- `/app/courts/:id`
- `/courts/:id`

Phase:

- MVP

Purpose:

- Show enough information for a player to decide whether to reserve.

Content:

- venue name
- court name
- accepted sports
- price
- court rules
- available slots
- amenities
- textual location data
- public contact information if enabled

Actions:

- select slot
- request reservation
- contact venue if contact is enabled and user is authenticated

Rules:

- Visitor can view public details.
- Reservation requires login.
- Contact or operational intent requires login if enabled.
- Court rules should be visible before reservation.

### Reservation Request

Suggested route:

- `/app/reservations/new`
- `/app/courts/:id/reserve`

Phase:

- MVP

Purpose:

- Confirm reservation details before creating a reservation.

Screen should show:

- partner or venue
- court
- sport
- date
- start time
- end time
- price
- rules
- initial reservation status

Actions:

- confirm request
- cancel before submitting

Reservation statuses:

- `pending_payment`
- `confirmed`
- `canceled`
- `expired`
- `completed`

Rules:

- Reservation cannot be created for inactive court.
- Reservation cannot be created for unavailable slot.
- Reservation cannot duplicate an active confirmed reservation.
- Payment is not online in MVP.
- Payment status is controlled manually by partner or authorized operator.

Open decisions:

- whether reservation status starts as `pending_payment` or another pending state
- whether partner confirmation is always required
- whether any automatic confirmation exists in MVP

### My Reservations

Suggested route:

- `/app/reservations`
- `/app/reservations/:id`

Phase:

- MVP

Purpose:

- Let players track their own reservations.

Content:

- future reservations
- past reservations
- reservation status
- payment status
- court data
- date and time

Actions:

- open detail
- cancel if allowed
- request time change if enabled
- view updated status

Rules:

- A player sees only their own reservations.
- Cancellation depends on the policy that still needs definition.
- Time change is a request, not an automatic mutation, unless product rules
  explicitly change.

Open decisions:

- cancellation window
- whether time-change request is MVP
- whether players can cancel confirmed reservations directly

### Reservation Time Change Request

Suggested route:

- `/app/reservations/:id/change-request`

Phase:

- MVP candidate

Purpose:

- Let a player request a reservation time change.

Flow:

1. player opens reservation
2. player chooses a new available slot
3. player submits request
4. partner accepts or rejects
5. calendar changes only if accepted

Rules:

- Cannot request a move to an unavailable slot.
- Partner approval is required.
- The request should record who requested and who approved or rejected.
- Moving a confirmed reservation must validate conflicts.

Open decisions:

- whether this belongs in MVP
- whether rejection requires a reason
- whether the old slot remains blocked while change is pending

### Open Matches

Suggested route:

- `/app/open-matches`
- `/app/open-matches/:id`

Phase:

- MVP

Purpose:

- Let players find or join open groups.

List should show:

- sport
- place
- date
- time
- expected level
- total spots
- filled spots
- status

Filters:

- sport
- level
- date
- court or venue if applicable

Actions:

- join match
- leave match
- create match
- cancel match if creator

Statuses:

- `open`
- `full`
- `canceled`
- `completed`

Rules:

- Player cannot join the same match twice.
- Player cannot join a full match.
- Player cannot join a canceled or completed match.
- Level is an expectation, not necessarily a hard block.
- Partner-created open matches are V2 unless scope changes.

Open decisions:

- whether level mismatch blocks joining or only warns
- whether open match must be tied to a court or can use free-text place

### Create Open Match

Suggested route:

- `/app/open-matches/new`

Phase:

- MVP

Purpose:

- Let a player organize a playable group.

Fields:

- sport
- place
- date
- time
- participant limit
- expected level
- optional note

Actions:

- create
- edit if allowed
- cancel

Rules:

- An open match does not replace a court reservation unless the flows are
  explicitly connected.
- Match place may start as a partner/court reference or simple text.

Open decisions:

- whether creator joins automatically
- whether editing is allowed after participants join
- whether open match can reserve a court in the same flow

### Choose Classes For The Week

Suggested route:

- `/app/classes`

Phase:

- V2

Purpose:

- Let a student choose classes according to their school plan.

Users:

- student linked to a school

Content:

- available classes for the week
- teacher
- class theme
- min and max level
- available spots
- minimum students required
- class status

Actions:

- choose class
- swap class
- cancel participation if allowed
- choose another time if class is canceled

Rules:

- Student can choose only within plan limits.
- School may block scheduling if payment is not valid.
- Class may be canceled if minimum students is not reached.
- Canceled class should let the student choose another time.

### My Classes

Suggested route:

- `/app/classes/my`

Phase:

- V2

Purpose:

- Let a student see selected classes.

Content:

- upcoming classes
- canceled classes
- teacher
- theme
- time
- location
- status

Statuses:

- `confirmed`
- `waiting_minimum`
- `canceled`
- `completed`

Rules:

- Class can depend on minimum student count.
- Canceled classes should clearly tell the student to choose another time.

## Partner Or Venue Pages

### Partner Dashboard

Suggested route:

- `/partner`

Phase:

- MVP

Purpose:

- Provide an operational overview for court management.

Content:

- today's reservations
- pending payments
- active courts
- available slots
- basic alerts
- shortcuts to calendar, courts, reservations, payments, and profile

Actions:

- open calendar
- create court
- view pending reservations
- update payment status

Future:

- financial projection
- maintenance alerts
- inventory control
- advanced reports

Rules:

- Dashboard shows only the partner's own operational data.
- Cross-partner visibility is forbidden.

### Partner Profile

Suggested route:

- `/partner/profile`

Phase:

- MVP

Purpose:

- Configure public and operational partner information.

Fields:

- name
- short description
- city
- textual address
- contact
- offered sports
- available amenities
- food and beverage availability
- general rules
- opening hours

Actions:

- edit profile
- activate or deactivate visibility
- switch context if the organization also has school module enabled

Rules:

- Partner profile should exist before court registration.
- Private data must not appear publicly.
- Public data appears in discovery.

Open decisions:

- required fields for MVP
- whether partner profile approval is manual
- whether visibility can be disabled independently from court activation

### Court Management

Suggested route:

- `/partner/courts`

Phase:

- MVP

Purpose:

- List and control the partner's courts.

List should show:

- court name
- accepted sports
- price
- status: active or inactive
- next available slots
- quick actions

Actions:

- create court
- edit court
- activate or deactivate
- configure availability
- view court reservations

Rules:

- Inactive court cannot receive reservations.
- Inactive court can remain visible to partner admin.
- Each court must have at least one sport.

### Create Or Edit Court

Suggested route:

- `/partner/courts/new`
- `/partner/courts/:id/edit`

Phase:

- MVP

Purpose:

- Configure reservable court data.

Fields:

- court name
- accepted sports
- base price
- specific rules
- periods if enabled
- active or inactive status

Rules:

- Price should be defined before court becomes reservable.
- Sports must come from the allowed sport catalog.
- Court rules must be visible to the player before reservation.

Open decisions:

- whether price is required at court creation or before activation
- whether periods are MVP

### Availability And Period Configuration

Suggested route:

- `/partner/courts/:id/availability`
- `/partner/calendar/configuration`

Phase:

- MVP

Purpose:

- Define when each court can be reserved.

Fields:

- court
- day
- start time
- end time
- period
- specific price if enabled
- sport if availability is sport-specific

Rules:

- Start time must be before end time.
- Invalid overlaps must be prevented.
- Availability must be compatible with reservation conflict rules.

Open decisions:

- availability by court only or by court and sport
- fixed court price or price by time/period
- recurring availability versus manually created slots

### Court Calendar

Suggested route:

- `/partner/calendar`

Phase:

- MVP

Purpose:

- Provide visual operational control of court reservations and availability.

Layout:

- columns represent courts
- rows represent times
- reservation blocks appear in the grid
- free slots appear as available
- occupied slots appear blocked or reserved

Actions:

- create availability
- view reservation
- move reservation if enabled
- confirm reservation
- cancel reservation
- update payment status
- accept time change request

Rules:

- Moving a reservation must validate conflicts.
- Moved reservation should record who moved it.
- Player may request a move, but partner approves if change request flow exists.
- Confirmed reservation blocks the slot.

Open decisions:

- drag-and-drop in MVP or later
- whether move can happen directly from calendar
- whether move requires a reason

### Partner Reservation Detail

Suggested route:

- `/partner/reservations/:id`

Phase:

- MVP

Purpose:

- Let partner manage a reservation.

Content:

- player
- court
- sport
- date
- time
- price
- reservation status
- payment status
- action history

Actions:

- confirm
- cancel
- reschedule if enabled
- mark as paid
- mark as pending
- mark as failed or overdue when applicable

Rules:

- Partner manages only its own reservations.
- Status changes must respect valid transitions.
- Payment is manual in MVP.
- Sensitive changes should be auditable.

### Manual Payments

Suggested route:

- `/partner/payments`

Phase:

- MVP

Purpose:

- Track reservation payments without a payment gateway.

List should show:

- reservation
- player
- court
- amount
- date
- payment status

Statuses:

- `pending`
- `paid`
- `failed`
- `overdue`

Actions:

- mark as paid
- mark as pending
- update status
- open related reservation

Rules:

- No online payment in MVP.
- No refund operational flow in MVP.
- Payment control is manual.
- Payment changes should be auditable.

### Services And Amenities

Suggested route:

- part of `/partner/profile`
- part of court or venue detail pages

Phase:

- MVP candidate

Purpose:

- Show simple place differentiators to players.

Possible fields:

- sells water
- sells food
- sells drinks
- has bathroom
- has parking
- has lighting
- rents equipment

Display:

- simple icons in cards and details

Rules:

- Do not turn amenities into a complex catalog in MVP.
- Use amenities as quick decision information for players.

Open decisions:

- exact MVP amenity list
- whether amenities are searchable filters or display-only

### Partner Admin Management

Suggested route:

- `/partner/admins`

Phase:

- MVP candidate

Purpose:

- Control who can manage a partner account.

Content:

- current admins
- permissions
- history
- primary owner

Actions:

- add admin
- remove admin
- transfer ownership
- view logs

Rules:

- Every sensitive action should have an audit record.
- Ownership transfer must be explicit.
- Cross-partner access is forbidden.

Open decisions:

- whether admin management UI is MVP
- permission levels
- whether logs are visible in the UI

## School Pages

School pages are V2 unless product scope changes. They are documented here so
the frontend and domain model can avoid decisions that block them later.

### School Dashboard

Suggested route:

- `/school`

Phase:

- V2

Purpose:

- Provide an operational overview of classes.

Content:

- today's classes
- active teachers
- classes below minimum students
- students with pending payment
- upcoming classes
- shortcuts to calendar, teachers, students, classes, and payments

Rules:

- School dashboard is different from court dashboard.
- If the same organization has venue and school modules, the UI should support
  context switching.

### School Profile

Suggested route:

- `/school/profile`

Phase:

- V2

Purpose:

- Configure school data.

Fields:

- school name
- description
- sports taught
- city and address
- contact
- rules
- class policy
- replacement policy if defined

Actions:

- edit data
- activate or deactivate school
- configure plans

### Teachers

Suggested route:

- `/school/teachers`

Phase:

- V2

Purpose:

- Manage school teachers.

List should show:

- name
- sports
- schedule
- status
- linked classes

Actions:

- create teacher
- edit teacher
- deactivate teacher
- view teacher agenda

Rules:

- Teacher can start as an operational entity.
- Teacher login is an open decision.

### School Calendar

Suggested route:

- `/school/calendar`

Phase:

- V2

Purpose:

- Organize classes by teacher.

Layout:

- columns represent teachers
- rows represent times
- blocks represent classes
- clicking a block opens allocated students

Block content:

- sport
- class theme
- level
- student count
- minimum required students
- status

Statuses:

- `open`
- `waiting_minimum`
- `confirmed`
- `full`
- `canceled`
- `completed`

Actions:

- create class
- edit class
- cancel class
- view students
- move class
- change teacher
- change theme

Rules:

- Class can require a minimum number of students.
- Class can be canceled if minimum is not reached.
- Students need a way to choose another class when canceled.
- School can limit classes by level.

### Create Or Edit Class

Suggested route:

- `/school/classes/new`
- `/school/classes/:id/edit`

Phase:

- V2

Purpose:

- Configure a class or group lesson.

Fields:

- teacher
- sport
- date
- time
- duration
- class theme
- minimum level
- maximum level
- minimum students
- maximum students
- notes

Example themes:

- defense
- attack
- serve
- reception
- positioning
- specific fundamental
- guided game

Rules:

- Class level should match allowed student levels.
- Minimum students define whether the class can happen.
- Maximum students defines capacity.
- Theme helps organize teaching methodology.

### Class Detail

Suggested route:

- `/school/classes/:id`

Phase:

- V2

Purpose:

- Manage students in a class.

Content:

- teacher
- time
- theme
- level
- registered students
- remaining spots
- status
- student payment context if needed

Actions:

- add student
- remove student
- cancel class
- confirm class
- approve extra class
- view students

Rules:

- Class may be canceled if minimum is not reached.
- Student should be able to reallocate after cancellation.
- School controls manual exceptions.

### Students

Suggested route:

- `/school/students`

Phase:

- V2

Purpose:

- Manage students linked to a school.

List should show:

- name
- level
- plan
- payment status
- classes this week
- status

Actions:

- link student
- remove link
- update plan
- block or unblock scheduling
- view class history

Rules:

- Student can be a normal app user.
- School can block scheduling if payment is pending.
- Plan defines how many classes the student can choose.

### Plans And Weekly Classes

Suggested route:

- `/school/plans`

Phase:

- V2

Purpose:

- Control how many classes a student can take.

Fields:

- plan name
- classes per week
- validity
- payment status
- replacement rules if defined

Rules:

- Student chooses classes according to plan.
- If weekly limit is used, student cannot schedule more.
- Extra class is an exception.

### Extra Classes

Suggested route:

- part of class or student flows

Phase:

- V2 or future

Purpose:

- Allow controlled exceptions.

Possible flow:

1. student requests extra class
2. teacher or school approves
3. class appears in calendar
4. extra charge may or may not be generated

Open decisions:

- whether extra class belongs in V2
- whether teacher alone can approve
- whether school approval is required
- whether extra class creates separate payment

### School Payments

Suggested route:

- `/school/payments`

Phase:

- V2

Purpose:

- Control whether a student can schedule classes.

Content:

- student
- plan
- status
- due date
- released classes
- scheduling block

Statuses:

- `paid`
- `pending`
- `overdue`
- `blocked`

Rules:

- No payment integration in MVP.
- School payment control is manual.
- School may prevent scheduling if student has not paid.

## Sandicts Admin Pages

### Admin Dashboard

Suggested route:

- `/admin`

Phase:

- MVP candidate only if operationally necessary

Purpose:

- Internal platform overview.

Possible content:

- users
- partners
- schools
- sports
- reservations
- audit logs
- operational issues

Rules:

- Build only if needed for MVP operations.
- If not needed, start with manual operation and backend records.

### Sports Catalog

Suggested route:

- `/admin/sports`

Phase:

- MVP candidate

Purpose:

- Manage sports.

Initial sports:

- `futevolei`
- `beach_tennis`
- `beach_volleyball`

Out of MVP:

- `altinha`

Actions:

- create sport
- edit public name
- activate or deactivate
- order display

Rules:

- Frontend and backend should use the same sport catalog.
- Avoid hardcoding in a way that blocks future sports.

Open decisions:

- sports admin UI versus seeded backend catalog in MVP

### Audit Logs

Suggested route:

- `/admin/audit`
- partner or school scoped logs where appropriate

Phase:

- MVP candidate for backend audit records; UI can be later

Purpose:

- Track sensitive operational actions.

Events that should generate log:

- court creation
- availability edit
- reservation creation
- reservation confirmation
- reservation cancellation
- reservation move
- payment status change
- administrator transfer
- admin added or removed
- class change
- class cancellation

Log data:

- actor
- timestamp
- action
- affected entity
- previous value when relevant
- new value when relevant

Rules:

- Audit records protect operational trust.
- UI can wait if backend records exist and support workflows are manual.

## Navigation Draft

This route map is a planning draft, not an implementation decision.

Public:

- `/`
- `/sign-in`
- `/discovery`
- `/courts/:id`
- `/schools/:id`

Player:

- `/app`
- `/app/onboarding`
- `/app/profile`
- `/app/courts`
- `/app/courts/:id`
- `/app/reservations`
- `/app/reservations/:id`
- `/app/reservations/:id/change-request`
- `/app/open-matches`
- `/app/open-matches/:id`
- `/app/open-matches/new`
- `/app/classes`
- `/app/classes/my`

Partner:

- `/partner`
- `/partner/profile`
- `/partner/courts`
- `/partner/courts/new`
- `/partner/courts/:id/edit`
- `/partner/courts/:id/availability`
- `/partner/calendar`
- `/partner/reservations`
- `/partner/reservations/:id`
- `/partner/payments`
- `/partner/admins`

School:

- `/school`
- `/school/profile`
- `/school/teachers`
- `/school/calendar`
- `/school/classes`
- `/school/classes/new`
- `/school/classes/:id`
- `/school/classes/:id/edit`
- `/school/students`
- `/school/plans`
- `/school/payments`

Sandicts Admin:

- `/admin`
- `/admin/sports`
- `/admin/users`
- `/admin/partners`
- `/admin/schools`
- `/admin/audit`

## MVP Page Map

Confirmed or likely MVP pages:

| Area | Page | Phase |
| --- | --- | --- |
| Public | Public home and discovery | MVP |
| Public | Sign in | MVP |
| Public | Court or venue detail | MVP |
| Player | Player home | MVP |
| Player | Profile onboarding | MVP basic |
| Player | Player profile | MVP basic |
| Player | Discover courts | MVP |
| Player | Reservation request | MVP |
| Player | My reservations | MVP |
| Player | Open matches | MVP |
| Player | Create open match | MVP |
| Partner | Partner dashboard | MVP |
| Partner | Partner profile | MVP |
| Partner | Court management | MVP |
| Partner | Create or edit court | MVP |
| Partner | Availability configuration | MVP |
| Partner | Court calendar | MVP |
| Partner | Reservation detail | MVP |
| Partner | Manual payments | MVP |
| Partner | Amenities | MVP candidate |
| Admin | Sports catalog | MVP candidate |
| Admin | Audit records | MVP candidate backend, UI later |

V2 or later pages:

| Area | Page | Phase |
| --- | --- | --- |
| Player | Choose classes for week | V2 |
| Player | My classes | V2 |
| School | School dashboard | V2 |
| School | School profile | V2 |
| School | Teachers | V2 |
| School | School calendar | V2 |
| School | Create or edit class | V2 |
| School | Class detail | V2 |
| School | Students | V2 |
| School | Plans | V2 |
| School | Extra classes | V2 or future |
| School | School payments | V2 |
| Admin | Full admin dashboard | MVP candidate or future |

## Business Rules Extracted From Page Descriptions

Authentication and access:

- Public discovery is allowed.
- Practical actions require login.
- After login, the app should resume the attempted action when possible.
- Profile completion may block practical actions.

Player profile:

- Simple level is self-declared.
- Simple level is used for filtering and expectations, not ranking.
- Athlete card, overall, and technical evolution are not MVP.

Courts and availability:

- Partner controls court availability.
- Inactive courts cannot be reserved.
- Unavailable slots cannot be reserved.
- Court rules must be visible before reservation.
- Price must be visible before reservation.

Reservations:

- Reservation status must be explicit.
- Confirmed reservation blocks the slot.
- Duplicate active confirmed reservation for the same court and time is
  forbidden.
- Partner manages reservation confirmation or cancellation.
- Payment is manual in MVP.
- Time change request requires partner approval if the feature exists.

Payments:

- Manual payment states are operational records.
- MVP payment statuses are `pending`, `paid`, `failed`, and `overdue`.
- No online payment, refund flow, split, or payout automation in MVP.
- Payment status changes should be auditable.

Open matches:

- Player-created open matches are MVP.
- Player cannot join the same match twice.
- Player cannot join a full match.
- Player cannot join canceled or completed match.
- Level is expectation, not verified ranking.

School and classes:

- School logic is different from court reservation logic.
- School module includes teachers, students, plans, classes, and payment blocks.
- Class can require minimum and maximum students.
- Student plan can limit weekly class choices.
- School can block scheduling if payment is not valid.
- School module is V2 unless product scope changes.

Admin and audit:

- Sensitive administrative and operational actions should be auditable.
- Cross-partner and cross-school access is forbidden.
- Full admin UI should exist only if operationally necessary.

## Open Decisions

Product scope:

- Should visitors see only courts or also schools?
- Should public users see exact available slots?
- Should school discovery exist in MVP as display-only?
- Should class scheduling remain V2?
- Should reservation time-change request be MVP?
- Should amenities be searchable filters or display-only?
- Should admin management UI be MVP?
- Should sports catalog have admin UI or be seeded/configured manually?

Profile:

- Is city required in MVP?
- Does preferred court side belong in MVP?
- Does dominant foot belong in MVP?
- Does school affiliation belong in MVP profile?

Reservations:

- Does partner always confirm reservations manually?
- Is automatic confirmation allowed in MVP?
- What is the cancellation window?
- Can players cancel confirmed reservations directly?
- Does the old slot remain blocked during a change request?

Courts and availability:

- Is availability defined by court only or by court and sport?
- Is price fixed by court or variable by time/period?
- Are recurring availability rules MVP?
- Is drag-and-drop reservation moving MVP?

Open matches:

- Does creator join automatically?
- Is editing allowed after participants join?
- Can open match reserve a court in the same flow?
- Is level mismatch a hard block or only a warning?

School:

- Does teacher have login in V2?
- Are extra classes V2 or future?
- Can teacher approve extra classes alone?
- Does extra class create a separate payment?

Permissions and audit:

- What permission levels exist between owner and admins?
- Can the same account be player, partner admin, and school admin?
- Which audit logs need UI versus backend records only?

## Next Step Before Jira

Before creating Jira issues, use this document to produce a page inventory batch:

1. confirm MVP pages
2. confirm V2 pages
3. resolve the most important open decisions
4. define the first fullstack route/API slices
5. only then create Epics, Stories, Tasks, and Subtasks in Jira
