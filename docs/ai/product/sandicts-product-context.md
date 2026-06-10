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
  - modeling users, partners, courts, bookings, matches, payments, or tournaments
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

The product is inspired by the iFood marketplace pattern, but the supply side is courts, schools, clubs, coaches, tournaments, and community games.

Core promise:

> Connect people who want to play with places that offer sand sports, while making court and school management easier.

## Problems

Current market pain:

- players struggle to find available courts
- players struggle to find people at similar level to play with
- schools and courts manage bookings, students, and payments manually through WhatsApp and spreadsheets
- tournaments and communities are fragmented and hard to operate

Sandicts centralizes discovery, reservations, open matches, tournaments, and partner management.

## User Types

### Player

Players can:

- search courts by sport, availability, and price
- compare prices for rentals and memberships
- join games and open matches
- find people to play with
- register for tournaments after the MVP
- build status and track progression as athletes after the MVP

### Partner

Partners are courts, schools, arenas, clubs, or organizers.

Partners can:

- manage court schedules and reservations
- manage students
- control memberships and payment status
- see delinquency
- create tournaments and events
- manage basic financial reports

### Admin

Admins are internal Sandicts operators and should be introduced only when a real operational flow requires manual review, support, moderation, or controlled status changes.

## Main Product Areas

### Discovery

- list courts by sport, availability, price, and partner profile
- add nearby court discovery by geolocation after the MVP
- expose clear pricing for rental, membership, and events

### Reservations

- reserve court by time slot
- prevent double booking
- keep partner availability as the source of truth
- reflect payment and reservation status in the system

### Player Matchmaking

- create open matches
- join existing matches until capacity is reached
- support sport, level, location, date, and time matching

### Tournaments

- tournament creation, registration, participant limits, rankings, and results are V2 concerns
- do not let tournament requirements block MVP reservation and open match flows

### B2B Management

- MVP starts with partner onboarding, courts, availability, reservations, and simple payment status visibility
- student management, membership control, teachers, classes, delinquency workflows, and richer reports are V2 concerns

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
- partner subscription
- tournament fee
- future product and merchandise sales

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
3. partner onboarding and court setup
4. availability calendar
5. court discovery by sport, availability, price, and partner profile
6. reservation request and confirmation
7. open match creation and joining
8. basic manual payment status tracking

Avoid early overengineering:

- complex recommendation engines
- full ERP for partners
- advanced rankings before real usage exists
- full player evolution, cards, fundamentals, and overall before V2
- geolocation before V2
- tournament management before V2
- blockchain-first architecture for non-blockchain flows
- multi-service decomposition before domain boundaries are proven
