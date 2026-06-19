---
title: Sandicts Product Context
doc-type: product-context
role: source-of-truth
priority: high
canonical: docs/ai/product/sandicts-product-context.md
related:
  - docs/ai/business/sandicts-business-rules.md
  - docs/ai/product/sandicts-mvp-scope.md
  - docs/ai/product/sandicts-v2-backlog.md
  - docs/ai/product/shared-documentation-strategy.md
  - docs/ai/api/zod-swagger-foundation.md
scope: product, marketplace, sports, sand-courts, mvp
read-when:
  - defining Sandicts features or modules
  - deciding MVP scope
  - modeling users, organizations, academies, courts, bookings, matches, payments, or tournaments
  - designing APIs that expose product concepts
do-not-read-when:
  - editing only logger, CI, formatting, or low-level technical configuration
---

# Sandicts Product Context

## Product

Sandicts is a marketplace and community app for sand sports such as:

- futevolei
- beach tennis
- beach volleyball
- similar sand court sports

The product is inspired by the iFood marketplace pattern, but the supply side
is organizations that operate courts/venues and academies that operate
training/classes.

Core promise:

> Connect people who want to play with places that offer sand sports, while making court and academy management easier.

## Problems

Current market pain:

- players struggle to find available courts
- players struggle to find people at similar level to play with
- academies and court operators manage bookings, students, and payments manually through WhatsApp and spreadsheets
- tournaments and communities are fragmented and hard to operate

Sandicts centralizes discovery, reservations, open matches, tournaments,
organization management, and academy management.

## User Types

### Player

Players can:

- search courts by sport, availability, and price
- compare prices for rentals and memberships
- join games and open matches
- find people to play with
- register for tournaments after the MVP
- build status and track progression as athletes after the MVP

### Account And Contexts

Sandicts uses one user identity and one login. A user account is not a fixed
type.

A signed-in user can have:

- a Player profile
- one or more Organization contexts
- one or more Academy contexts
- a Sandicts Admin context when authorized

The initial onboarding choice can start as Player, Organization, or Academy,
but that choice does not lock the account. Users with multiple contexts should
switch through an app context selector. Public/user-facing entity URLs should
use slugs from the beginning while backend APIs may still use stable IDs
internally.

### Organization

Organizations are court, venue, arena, club, or organizer operators.

Organizations can:

- manage court schedules and reservations
- manage one or more physical units
- control court payment status
- create tournaments and events
- manage basic financial reports

Organization access rules:

- organization owners/admins can see all units and courts in the organization
- organization staff can be scoped to assigned units/courts
- cross-organization access is forbidden

### Academy

Academies manage training, classes, coaches, students, and plans.

Academies can:

- manage classes and coaches
- manage students and class requests
- control plan/payment status
- define rules for student acceptance and extra classes

Academy access rules:

- academy owners/admins can see and manage all classes
- coaches can view academy classes but manage only classes assigned to them
- coaches can accept students only for assigned classes and only when academy
  rules allow it
- cross-academy access is forbidden

### Admin

Admins are internal Sandicts operators and should be introduced only when a real operational flow requires manual review, support, moderation, or controlled status changes.

## Main Product Areas

### Discovery

- list courts by sport, availability, price, and organization profile
- add nearby court discovery by geolocation after the MVP
- expose clear pricing for rental, membership, and events

### Reservations

- reserve court by time slot
- prevent double booking
- keep organization availability as the source of truth
- reflect payment and reservation status in the system

### Player Matchmaking

- create open matches
- join existing matches until capacity is reached
- support sport, level, location, date, and time matching

### Tournaments

- tournament creation, registration, participant limits, rankings, and results are V2 concerns
- do not let tournament requirements block MVP reservation and open match flows

### B2B Management

- MVP starts with organization onboarding, courts, availability, reservations, and simple payment status visibility
- academy management, student management, membership control, coaches, classes,
  delinquency workflows, and richer reports are V2 concerns unless product
  scope changes

## Community And Lifestyle

Sandicts should not feel like a utility only. The brand should support:

- a strong tribe of sand athletes
- beach lifestyle
- healthy routine
- consistent athletic evolution
- committed amateur identity, not only professional competition

## Business Model

Suggested revenue streams:

- commission per reservation
- organization or academy subscription
- organization or academy commission/percentage
- tournament fee
- future product and merchandise sales

Open billing decision:

- Sandicts has not yet chosen between fixed subscription, commission/percentage,
  or a hybrid billing model for organizations and academies.

## Scope Documents

Use these documents to decide what belongs in each delivery stage:

- [`docs/ai/product/sandicts-mvp-scope.md`](sandicts-mvp-scope.md): current MVP source of truth
- [`docs/ai/product/sandicts-v2-backlog.md`](sandicts-v2-backlog.md): V2 and later product themes
- [`docs/ai/product/sandicts-scope-checklist.md`](sandicts-scope-checklist.md): editable working checklist used to discuss scope
- [`docs/ai/product/shared-documentation-strategy.md`](shared-documentation-strategy.md): decision about where shared product and business documentation should live

## Web3 Layer

The Solana/Web3 layer is optional and should not block the MVP.

Possible token use cases:

- reward participation in games
- reward tournament wins
- reward monthly highlights
- allow token use for memberships, reservations, or products

Possible NFT use cases:

- digital trophies
- non-transferable or limited achievements
- tournament champion badge
- player of the month badge
- profile status display

MVP rule:

- design the core domain so rewards and achievements can be added later
- do not make booking, payment, or tournament flows depend on blockchain in the first version unless explicitly required by a hackathon scope

## MVP Bias

Prefer a useful, shippable marketplace core:

1. player account access with Google sign-in and Google One Tap
2. basic player profile, main sport, and simple level by sport
3. organization onboarding and court setup
4. availability calendar
5. court discovery by sport, availability, price, and organization profile
6. reservation request and confirmation
7. open match creation and joining
8. basic manual payment status tracking

Avoid early overengineering:

- complex recommendation engines
- full ERP for organizations or academies
- advanced rankings before real usage exists
- full player evolution, cards, fundamentals, and overall before V2
- geolocation before V2
- tournament management before V2
- blockchain-first architecture for non-blockchain flows
- multi-service decomposition before domain boundaries are proven
