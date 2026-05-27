---
title: Sandicts Business Rules
doc-type: domain-rules
role: source-of-truth
priority: high
canonical: docs/ai/business/sandicts-business-rules.md
related:
  - docs/ai/product/sandicts-product-context.md
  - docs/ai/api/error-handling-foundation.md
  - docs/ai/api/zod-swagger-foundation.md
scope: business-rules, backend, marketplace, reservations, matches, tournaments, payments
read-when:
  - implementing Sandicts domain modules
  - changing booking, payment, match, tournament, partner, or player behavior
  - designing API request and response contracts for domain flows
  - deciding which failures are business_rule_violation
do-not-read-when:
  - changing only visual frontend implementation
  - changing only CI, formatting, or logger internals
---

# Sandicts Business Rules

## Principle

Sandicts is a marketplace with two operational truths:

- partners control court availability
- Sandicts controls the booking, match, payment, and tournament workflow exposed through the app

When backend behavior conflicts with this document, prefer this document unless the user explicitly changes the product direction.

## Core Entities

Recommended first-pass domain vocabulary:

- `Player`: end user who books, joins matches, and enters tournaments
- `Partner`: court, school, arena, club, or organizer
- `Court`: playable physical space controlled by a partner
- `Sport`: futevolei, beach tennis, beach volleyball, or similar
- `AvailabilitySlot`: time window made available by a partner
- `Reservation`: booking attempt or confirmed booking for a court slot
- `OpenMatch`: player-created or partner-created game with joinable spots
- `Tournament`: partner-created competition or event
- `Payment`: system record of money status for reservations, memberships, and tournaments
- `Membership`: recurring relationship between player and partner or school
- `Achievement`: optional future reward/status record for player participation, progression, or tournaments

## Availability And Reservations

Rules:

- partners are the source of truth for court availability
- a court can only be reserved in an available time slot
- a confirmed reservation must block the court slot
- the same court slot cannot have two active confirmed reservations
- a reservation should always reference partner, court, sport, date, start time, end time, player, and status
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
- delinquency must be visible to partners for their own students/customers
- partners must not see delinquency for unrelated partners

Recommended payment statuses:

- `pending`
- `paid`
- `failed`
- `refunded`
- `overdue`

MVP note:

- payment provider integration can come later
- until then, keep the domain model ready for provider references, but allow manual or mocked status updates in controlled admin/partner flows

## Tournaments

Rules:

- partners can create tournaments and events
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

## Partner Management

Rules:

- partners manage their own courts, schedules, students, memberships, events, and financial visibility
- partner users must be scoped to their partner account
- cross-partner data leakage is a critical bug
- financial reports should start simple and auditable

MVP partner reports:

- reservations by period
- revenue by period
- pending and overdue payments
- active students or members

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
- partner user accessing another partner: `forbidden`
- payment provider timeout: `internal_error` or provider-specific retry state, depending on the flow

## Web3 Boundary

Rules:

- tokens and NFTs are optional product layers
- core booking, payment, and tournament logic must work without blockchain
- achievements can be modeled internally first, then minted or mirrored later
- avoid storing irreversible blockchain assumptions in core reservation tables
