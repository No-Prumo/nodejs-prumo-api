---
title: Sandicts Product Context
doc-type: product-context
role: source-of-truth
priority: high
canonical: docs/ai/product/sandicts-product-context.md
related:
  - docs/ai/business/sandicts-business-rules.md
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

- search nearby courts
- compare prices for rentals and memberships
- join games and open matches
- find people to play with
- register for tournaments
- build status and track progression as athletes

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

- list nearby courts by geolocation
- filter by price, sport type, level, availability, and partner profile
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

- partners create tournaments
- players register through the app
- tournaments have participant limits and status
- rankings and results can evolve after the MVP

### B2B Management

- student management
- membership control
- payment status and delinquency visibility
- basic partner financial reporting

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

1. partner onboarding and court setup
2. availability calendar
3. court discovery
4. reservation request and confirmation
5. open match creation and joining
6. basic payment status tracking
7. simple tournament registration

Avoid early overengineering:

- complex recommendation engines
- full ERP for partners
- advanced rankings before real usage exists
- blockchain-first architecture for non-blockchain flows
- multi-service decomposition before domain boundaries are proven
