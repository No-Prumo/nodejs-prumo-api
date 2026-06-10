---
title: Sandicts V2 And Future Backlog
doc-type: product-backlog
role: source-of-truth
priority: medium
canonical: docs/ai/product/sandicts-v2-backlog.md
related:
  - docs/ai/product/sandicts-mvp-scope.md
  - docs/ai/product/sandicts-scope-checklist.md
  - docs/ai/business/sandicts-business-rules.md
scope: product, v2, future, player-progression, tournaments, b2b, social
read-when:
  - deciding whether a feature should wait until V2
  - planning player progression
  - planning tournaments, B2B management, or future community features
do-not-read-when:
  - implementing the MVP reservation or payment core
---

# Sandicts V2 And Future Backlog

## Purpose

This document separates confirmed V2 scope from later future ideas.

The MVP source of truth is `docs/ai/product/sandicts-mvp-scope.md`.

## V2 Themes

V2 should deepen the product after the marketplace core works:

- geolocation and richer discovery
- player identity and evolution
- tournaments
- B2B school/student management
- better payments and monetization
- notifications and match coordination

## V2 Geolocation And Discovery

V2 scope:

- player can inform location
- player can list nearby places
- player can compare places with richer data
- local can have a photo gallery

Rules to define later:

- location precision and privacy
- whether partner location is an address, coordinates, service area, or all three
- whether sorting uses distance, availability, price, rating, or sponsored ranking

## V2 Player Profile

V2 scope:

- public player profile
- player photo
- player bio
- player nationality
- player side of game: right, left, both
- richer sport profile

MVP dependency:

- keep MVP `Player`, `Sport`, `mainSport`, and simple level compatible with the V2 profile.

## V2 Player Evolution

V2 scope:

- player card inspired by football game cards
- card shows sport, photo, nationality, game side, and overall
- card color changes by overall range
- player has sport-specific fundamentals
- each fundamental has score from 0 to 100
- overall is calculated from fundamental scores
- player can register monthly evolution
- player can compare historical evolution
- player can self-assess
- teacher or partner can assess player
- system calculates attack, defense, fundamentals, resources/plastic skills

Important product principle:

- evolution is a retention and identity layer, not a requirement for MVP reservations
- MVP simple level must not pretend to be a verified full athlete score

Future after V2:

- teacher confirmation requirement
- badges and achievements
- rankings based on evolution
- AI training suggestions

## V2 Futevolei Progression Model

Initial V2 backlog for futevolei:

- chapa direita
- chapa esquerda
- ombro direito
- ombro esquerdo
- peito
- coxa direita
- coxa esquerda
- cabeca para ataque
- cabeca para defesa
- lobby
- diagonal longa
- diagonal curta
- shark
- voo da aguia
- pingo
- pingo para tras
- pingo de ombro
- pingo de costas
- plastic resources as skill stars, similar to dribbles in football games

Open modeling questions:

- which items are core fundamentals
- which items are attack skills
- which items are defensive skills
- which items are plastic/resources
- how much plastic/resources should affect overall
- whether partner/teacher assessment should weigh more than self-assessment

## V2 Tournaments

V2 scope:

- partner creates tournament
- tournament has sport
- tournament has date and local
- tournament has participant limit
- player can register
- duplicate registration is blocked
- registration is blocked when tournament is closed
- statuses: `open`, `in_progress`, `finalized`, `canceled`

Future after V2:

- bracket generation
- result entry
- tournament ranking
- advanced tournament reports

## V2 B2B Management

V2 scope:

- partner can manage teachers
- partner can manage classes/groups
- partner can register students
- partner can register membership/monthly tuition
- partner can see active students
- partner can see overdue students
- partner can see revenue by period
- partner can see reservations by period
- partner can create events

MVP dependency:

- keep `Partner`, `Payment`, and manual payment records compatible with student and membership flows.

## V2 Payments And Monetization

V2 scope:

- refunded payment state as an operational flow
- payment gateway integration
- Sandicts commission model by reservation
- partner delinquency visibility for own students/customers

Future after V2:

- split or payout automation
- reconciliation
- partner financial statements

## V2 Open Match Improvements

V2 scope:

- partner can create open match
- notifications
- invites to matches

Future after V2:

- chat
- arena/community groups
- automatic matchmaking

## Future Backlog

Future ideas:

- admin panel when there is a real operational need
- reviews and ratings
- social follow/friends/feed
- local, sport, arena, and tournament rankings
- monthly highlights
- achievements
- Web3 tokens
- NFT achievements
- digital trophies
- collectible player card
- store
- teacher marketplace
- intelligent recommendations
- automatic matchmaking
- AI training suggestions
- partner system integrations
- `altinha` as an additional sport

## Do Not Pull Into MVP

Do not pull these into the MVP unless the product direction explicitly changes:

- geolocation
- player evolution
- tournaments
- school ERP
- payment gateway
- rankings
- achievements
- Web3
- social feed
- AI recommendations
