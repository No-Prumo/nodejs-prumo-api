# Sandicts Frontend Context

This file is intentionally outside `docs/ai` so it can be moved to the future frontend project.

## Product Feel

Sandicts should feel like a community for committed amateur sand athletes:

- strong tribe identity
- beach lifestyle
- energetic but practical
- focused on finding places, people, games, and tournaments quickly

The product should not feel like a generic booking SaaS or a passive social network.

## Brand

Name: Sandicts

Core idea:

- sand sports addicts
- community, routine, progression, and status

Visual direction:

- minimal scorpion logo
- dark background
- primary color: `#F59E0B` (Sand Orange)
- energetic contrast
- beach/lifestyle imagery when useful

## Frontend Stack Direction

Suggested stack:

- Next.js
- Zustand for local/client state where appropriate
- Zod for shared or duplicated frontend validation

The backend foundation in this repository is NestJS and can act as the BFF/API layer for the frontend.

## Main User Experiences

### Player

First screens should prioritize:

- nearby courts
- available times
- open matches
- tournament discovery
- profile/progression status

### Partner

Partner screens should prioritize:

- daily agenda
- court availability
- reservation status
- students and memberships
- pending and overdue payments
- tournament/event creation

## UX Principles

- make availability obvious
- reduce dependence on WhatsApp for operational flows
- make prices and payment state clear
- keep booking and joining flows short
- show social proof without making the MVP depend on complex ranking
- separate player and partner navigation clearly

## MVP Screens

Recommended first frontend scope:

- player home/discovery
- court detail
- reservation flow
- open match list/detail
- tournament list/detail
- player profile
- partner dashboard
- partner agenda
- partner payments/delinquency view

Avoid early complexity:

- advanced feed algorithms
- full social network
- dense gamification before the booking loop works
- Web3 wallet dependency in the default path
