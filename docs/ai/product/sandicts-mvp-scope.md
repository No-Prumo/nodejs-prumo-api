---
title: Sandicts MVP Scope
doc-type: product-scope
role: source-of-truth
priority: high
canonical: docs/ai/product/sandicts-mvp-scope.md
related:
  - docs/ai/product/sandicts-product-context.md
  - docs/ai/product/sandicts-scope-checklist.md
  - docs/ai/product/sandicts-v2-backlog.md
  - docs/ai/business/sandicts-business-rules.md
scope: product, mvp, marketplace, reservations, open-matches, organizations, academies, payments
read-when:
  - deciding whether a feature belongs in the Sandicts MVP
  - creating MVP backend modules
  - writing MVP business rules or API contracts
  - splitting MVP from V2 or future backlog
do-not-read-when:
  - changing only low-level technical configuration
  - implementing V2-only player progression
---

# Sandicts MVP Scope

## Purpose

This document is the current source of truth for the Sandicts MVP scope.

It consolidates the accepted decisions from
`docs/ai/product/sandicts-scope-checklist.md`.

## Product Cut

The MVP should prove the marketplace and playable community core:

- players can access Sandicts
- organizations can expose courts and availability
- players can discover courts by simple filters
- players can request reservations
- organizations can manage availability and reservation state
- payments can be tracked manually
- players can create and join open matches

The MVP must stay focused. It intentionally excludes:

- geolocation and nearby search
- full player evolution/card/overall system
- tournaments
- advanced academy/class management
- gateway payment integration
- rankings, achievements, Web3, AI, and heavy social features

## MVP Sports

Initial sports:

- `futevolei`
- `beach_tennis`
- `beach_volleyball`

Decisions:

- use `futevolei` as the internal product name, not `footvolley`
- keep `altinha` for future scope
- model sports generically as `Sport` so the product can expand later

## MVP Accounts And Profiles

Included:

- unified user account creation
- player account creation
- player sign-in
- player sign-out
- Google sign-in
- Google One Tap sign-in
- basic player profile editing
- player main sport
- simple player level by sport
- initial context choice: Player, Organization, or Academy

Rules:

- Sandicts uses one login and one user identity, not separate login pages per user type
- a user account can have a Player profile, multiple Organizations, multiple
  Academies, and a Sandicts Admin context when authorized
- the initial onboarding choice creates or opens the first context; it does not permanently define account type
- users with more than one accessible context should switch through a context selector
- user-facing entity routes should use slugs from the start while backend APIs can keep stable IDs internally
- simple player level is allowed in the MVP only as a matchmaking/filtering attribute
- simple player level is not the V2 evolution/overall system
- player location is not part of the MVP because geolocation is V2
- full public player profile is V2, but the public route direction is `/players/:playerSlug`
- player profile visibility should support public, friends-only, and private as the model evolves
- player photo, bio, nationality, and game side are V2

Open decision:

- password recovery is not scoped until password login exists or product decides to add password login

## MVP Organizations And Courts

Included:

- organization context creation
- organization profile for arena, club, venue, or organizer
- organization location/profile data needed for listing and reservations
- organization unit model or route reservation for multi-location operators
- court creation
- court activation and deactivation
- supported sports by organization or court
- price by time slot or schedule rule
- simple court rules visible to players

Rules:

- `Organization` is the product/code concept for arena, club, venue, or organizer operators
- organizations are the source of truth for their own court availability
- organization owners/admins can see all units and courts
- organization staff can be scoped to assigned units/courts
- cross-organization access must be forbidden
- inactive courts cannot be reserved
- organization management routes use `/organizations/:organizationSlug`
- court routes use court slugs in user-facing URLs

Not in MVP:

- coach management
- classes and groups
- full academy/class behavior

## Academy Context Direction

Academy is a first-class account context, independent from Organization.

Rules:

- creating an Academy does not require an Organization
- a user who owns an Academy can later create or access one or more
  Organizations under the same account
- academy management routes use `/academies/:academySlug/manage`
- public academy routes can use `/academies/:academySlug`
- academy owners/admins can see and manage all academy classes
- coaches can view academy classes but manage only classes assigned to them
- coaches can accept students only for assigned classes and only when academy
  rules allow it
- cross-academy access must be forbidden

MVP status:

- full academy/class operations remain V2 unless product scope changes
- the MVP should not model Organization as the owner of Academy

## MVP Discovery

Included:

- filter organizations/courts by sport
- filter by availability
- filter by price
- view organization profile
- view available courts
- reserve route names for public academy and player profile pages

Not in MVP:

- nearby search by geolocation
- rich location comparison
- gallery of local photos
- ratings and reviews

Reason:

- discovery should work with simple filters first
- geolocation enters V2 after the core reservation flow is proven

## MVP Availability And Reservations

Included:

- organization creates availability slots
- player requests a reservation
- system blocks unavailable slots
- system prevents duplicate active reservations for the same court and time
- organization can confirm a reservation manually
- player can cancel a reservation
- organization can cancel a reservation
- player can view reservation history
- organization can view agenda by day or week

Reservation statuses:

- `pending_payment`
- `confirmed`
- `canceled`
- `expired`
- `completed`

Rules:

- reservation status must always be explicit
- a confirmed reservation blocks the court slot
- the same court slot cannot have two active confirmed reservations
- reservation should reference organization, court, sport, date, start time, end time, player, payment state, and status
- cancellation window is still an open business decision

## MVP Payments

Included:

- manual payment registration
- payment status tracked by Sandicts
- reservation reads payment status
- organization sees pending payments
- organization can manually launch/register payment state

Payment statuses:

- `pending`
- `paid`
- `failed`
- `overdue`

Not in MVP:

- `refunded` as an operational flow
- payment gateway integration
- split or payout automation
- full commission settlement
- academy delinquency for memberships

Rules:

- the MVP should keep payment records compatible with future provider references
- gateway/provider details must not be required for the MVP
- manual payment state changes should be controlled and auditable

## MVP Open Matches

Included:

- player creates open match
- open match has sport
- open match has place
- open match has date and time
- open match has participant limit
- open match has expected simple level
- player joins open match
- participant leaves open match
- creator cancels open match

Open match statuses:

- `open`
- `full`
- `canceled`
- `completed`

Rules:

- a player cannot join the same open match twice
- a player cannot join a full match
- a player cannot join a canceled or completed match
- match level is an expectation/filter, not a verified athlete identity proof
- open match place may start as an organization/court reference or a simple
  place field; exact MVP representation remains a modeling decision

Not in MVP:

- organization-created open matches
- invitations
- chat
- automatic matchmaking

## MVP B2B Management

Included:

- organization can manually launch/register payment state
- organization can see operational agenda and pending payments

Not in MVP:

- students
- memberships
- monthly tuition
- active student reports
- overdue student reports
- revenue by period reports
- reservations by period reports
- events

## Explicitly V2

These are confirmed out of MVP:

- geolocation
- full public player profile
- player photo, bio, nationality, and side
- player evolution/card/overall/fundamentals
- tournaments and tournament registration
- students and memberships
- coach/classes management
- full academy management
- payment gateway
- organization-created open matches
- notifications and match invites

## Explicitly Future

These are later than V2 unless product direction changes:

- admin panel beyond operational need
- reviews
- split and organization/academy payout automation
- tournament brackets, results, and rankings
- social following/friends/feed
- rankings
- achievements and badges
- Web3 tokens and NFTs
- digital trophies
- collectible player card
- product store
- coach marketplace
- intelligent recommendations
- automatic matchmaking
- AI training suggestions
- organization and academy system integrations
