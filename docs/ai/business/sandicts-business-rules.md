---
title: Sandicts Business Rules
doc-type: domain-rules
role: source-of-truth
priority: high
canonical: docs/ai/business/sandicts-business-rules.md
related:
  - docs/ai/product/sandicts-product-context.md
  - docs/ai/product/sandicts-mvp-scope.md
  - docs/ai/product/sandicts-v2-backlog.md
  - docs/ai/product/shared-documentation-strategy.md
  - docs/ai/api/error-handling-foundation.md
  - docs/ai/api/zod-swagger-foundation.md
scope: business-rules, backend, marketplace, reservations, matches, payments, player-evolution
read-when:
  - implementing Sandicts domain modules
  - changing booking, payment, match, tournament, organization, academy, or player behavior
  - designing API request and response contracts for domain flows
  - deciding which failures are business_rule_violation
do-not-read-when:
  - changing only visual frontend implementation
  - changing only CI, formatting, or logger internals
---

# Sandicts Business Rules

## Principle

Sandicts is a marketplace with two operational truths:

- organizations control court availability
- Sandicts controls the booking, match, payment, and tournament workflow exposed through the app

When backend behavior conflicts with this document, prefer this document unless the user explicitly changes the product direction.

## Core Entities

Recommended first-pass domain vocabulary:

- `User`: signed-in identity that can access one or more contexts
- `Player`: end user who books, joins matches, and enters tournaments
- `PlayerProfile`: player context attached to a user
- `Organization`: court, venue, arena, club, or organizer operator
- `OrganizationUnit`: physical location/branch controlled by an organization
- `Court`: playable physical space controlled by an organization or organization unit
- `Academy`: training/classes/coaches/students context, independent from organization
- `AcademyClass`: scheduled class/group lesson controlled by an academy
- `CoachAssignment`: permission that lets a coach manage assigned academy classes
- `Sport`: futevolei, beach tennis, beach volleyball, or similar
- `AvailabilitySlot`: time window made available by an organization
- `Reservation`: booking attempt or confirmed booking for a court slot
- `OpenMatch`: player-created or organization-created game with joinable spots
- `Tournament`: organization-created competition or event
- `Payment`: system record of money status for reservations, memberships, and tournaments
- `Membership`: recurring relationship between player and organization or academy
- `Achievement`: optional future reward/status record for player participation, progression, or tournaments

Account context rules:

- Sandicts uses one login and one user identity.
- A user account can have Player, Organization, Academy, and Sandicts Admin
  contexts at the same time.
- The onboarding choice of Player, Organization, or Academy creates or opens the
  first context; it does not permanently define account type.
- Users with multiple contexts should switch through an app context selector.
- User-facing entity URLs should use slugs from the start while backend APIs can
  keep stable IDs internally.
- Public player profile URLs use `/players/:playerSlug` and must respect
  public, friends-only, or private visibility rules as those rules are
  implemented.

## Current MVP Decisions

MVP includes:

- player account access, including Google sign-in and Google One Tap
- basic player profile with main sport and simple level by sport
- organization onboarding
- court registration and organization-controlled availability
- court discovery by sport, availability, price, and organization profile
- reservation request and confirmation
- basic manual payment status tracking
- player-created open matches

MVP excludes:

- geolocation and nearby-court search
- full player evolution, player cards, fundamentals, attributes, and overall
- tournaments
- payment gateway integration, refunds, splits, payouts, and automated commission
- students, memberships, coaches, classes, and full academy management
- full public player profile pages

For scope conflicts, prefer:

1. [`docs/ai/product/sandicts-mvp-scope.md`](../product/sandicts-mvp-scope.md)
2. [`docs/ai/product/sandicts-v2-backlog.md`](../product/sandicts-v2-backlog.md)
3. [`docs/ai/product/sandicts-scope-checklist.md`](../product/sandicts-scope-checklist.md)

## Availability And Reservations

Rules:

- organizations are the source of truth for court availability
- a court can only be reserved in an available time slot
- a confirmed reservation must block the court slot
- the same court slot cannot have two active confirmed reservations
- a reservation should always reference organization, court, sport, date, start time, end time, player, and status
- reservation status must be explicit

Recommended reservation statuses:

- `pending_payment`
- `confirmed`
- `canceled`
- `expired`
- `completed`

Business failures that should usually become `business_rule_violation`:

- attempting to reserve an unavailable slot
- attempting to reserve a slot already confirmed for another reservation
- attempting to modify or cancel a reservation after the allowed window
- attempting to confirm a reservation without a compatible payment state

## Open Matches

Rules:

- users can create open matches for a sport, place, date, time, and level range
- users can join an existing match until the participant limit is reached
- an open match must expose total spots, confirmed participants, and remaining spots
- a player cannot join the same open match twice
- match level should be treated as a filter and expectation, not as hard identity proof in the MVP

Recommended open match statuses:

- `open`
- `full`
- `canceled`
- `completed`

Business failures:

- joining a full match
- joining a canceled or completed match
- joining twice
- creating a match for a court/time that cannot be used

## Payments And Delinquency

Rules:

- payments must reflect their current status in the system
- reservation, membership, and tournament flows should read payment status explicitly
- delinquency must be visible to organizations or academies only for their own
  students/customers
- organizations and academies must not see delinquency for unrelated contexts

Recommended payment statuses:

- `pending`
- `paid`
- `failed`
- `refunded`
- `overdue`

MVP note:

- payment provider integration comes after the MVP
- MVP payment status can be updated manually in controlled organization or admin flows
- keep the model ready for future provider references without coupling MVP behavior to a gateway
- use `refunded` only when a real refund or manual refund workflow exists
- organization and academy billing must remain flexible until product chooses
  fixed subscription, commission/percentage, or a hybrid model

## Tournaments

MVP note:

- tournaments are V2, not MVP
- do not let tournament requirements block reservation, payment status, or open match delivery

Rules:

- organizations can create tournaments and events
- tournaments must have a participant limit
- users can register only while the tournament is open
- registration must respect participant limit
- tournament status must be explicit

Recommended tournament statuses:

- `open`
- `in_progress`
- `finalized`
- `canceled`

Business failures:

- registering after registration is closed
- registering when participant limit is reached
- registering twice
- changing results after finalization without an explicit administrative flow

## Organization Management

Rules:

- MVP organizations manage their own courts, schedules, reservations, and payment visibility
- academy students, memberships, coaches, classes, events, and richer financial
  management are V2 concerns unless scope changes
- organization users must be scoped to their organization account and assigned units/courts when applicable
- cross-organization data leakage is a critical bug
- financial reports should start simple and auditable

MVP organization visibility:

- pending and overdue payments
- agenda by day or week
- reservation status by court and time

V2 organization reports:

- reservations by period
- revenue by period
- active students or members
- delinquency summaries

## Academy Management

Rules:

- Academy is independent from Organization.
- A user can own or work in one or more Academies and one or more Organizations
  under the same account.
- Academy owners/admins can see and manage all academy classes.
- Coaches can view academy classes but manage only classes assigned to them.
- Coaches can accept students only for assigned classes and only when academy
  rules allow it.
- Cross-academy data leakage is a critical bug.
- Full academy/class management is V2 unless product scope changes.

V2 academy visibility:

- classes by day or week
- student requests
- student plan/payment status
- coach assignments

## Player Evolution

MVP note:

- player evolution is V2, not MVP
- MVP only needs basic profile, main sport, and simple self-declared level by sport

V2 direction:

- each sport can define its own fundamentals, attributes, and special skills
- futevolei fundamentals may include chapa left, chapa right, shoulder, chest, head, thigh, attack head, and defense head
- futevolei attacks may include lobby, long diagonal, short diagonal, shark, voo da aguia, pingo, and pingo para tras
- plastic or high-skill moves should be modeled separately from base fundamentals
- fundamentals can evolve from low skill to high skill, for example 0 to 100
- overall should be derived from sport-specific attributes, not manually typed as an isolated number
- no player should be expected to max every attribute; a perfect player is a theoretical reference, not a normal product target
- future player cards can show sport, photo, side, nationality, overall, and card color by overall range

Future questions:

- how scores are validated
- whether coaches, organizations, or match history can confirm progression
- how monthly evolution differs from permanent skill level
- how achievements, rankings, and AI suggestions relate to player evolution

## API And Error Guidance

Rules:

- use Zod-backed DTOs for all external input and output
- use `AppError` for expected application/domain failures
- use `business_rule_violation` for valid requests that break domain rules
- keep validation failures as `validation_error`
- do not expose internal payment/provider details in public error responses

Examples:

- invalid date format: `validation_error`
- slot already taken: `business_rule_violation`
- player not found: `resource_not_found`
- organization user accessing another organization: `forbidden`
- coach managing an unassigned academy class: `forbidden`
- payment provider timeout: `internal_error` or provider-specific retry state, depending on the flow

## Web3 Boundary

Rules:

- tokens and NFTs are optional product layers
- core booking, payment, and tournament logic must work without blockchain
- achievements can be modeled internally first, then minted or mirrored later
- avoid storing irreversible blockchain assumptions in core reservation tables
