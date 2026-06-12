---
title: Sandicts Frontend Context
doc-type: frontend-context
role: source-of-truth
priority: high
canonical: docs/frontend/sandicts-frontend-context.md
related:
  - docs/frontend/sandicts-frontend-tech-decisions.md
  - docs/frontend/sandicts-frontend-planning.md
  - docs/frontend/sandicts-mvp-delivery-roadmap.md
  - docs/frontend/sandicts-page-functional-spec.md
scope: frontend, product-feel, brand, ux, stack, mvp
read-when:
  - starting frontend planning or implementation
  - deciding frontend product feel, brand direction, or UX principles
  - checking the approved frontend stack at a high level
  - creating frontend Jira issues that need product or UX context
do-not-read-when:
  - changing backend-only implementation details
  - reviewing CI, logging, database, or API internals with no frontend impact
---

# Sandicts Frontend Context

This file is intentionally outside `docs/ai` so it can be moved to the future frontend project.

For delivery timing, Jira structure, frontend start criteria, and fullstack
integration planning, also read `docs/frontend/sandicts-frontend-planning.md`.
For the page inventory, permissions, page rules, and route draft, read
`docs/frontend/sandicts-page-functional-spec.md`.

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

Decided stack:

- Next.js App Router with TypeScript
- shadcn/ui with Tailwind CSS and lucide-react
- TanStack Query for server state
- Zod with React Hook Form for forms
- OpenAPI client generated from the Nest Swagger contract
- Zustand only for local UI state, not API data
- Playwright for E2E tests
- Vitest with Testing Library for components and hooks

The backend foundation in this repository is NestJS and remains the API and
business-rule owner for the frontend.

For detailed frontend architecture decisions, read
`docs/frontend/sandicts-frontend-tech-decisions.md`.

## Main User Experiences

### Player

First screens should prioritize:

- court discovery by simple MVP filters
- available times
- open matches
- basic profile completion
- reservation history and next reservation status

After the MVP, player screens can add:

- nearby courts after geolocation exists
- tournament discovery
- profile progression status

### Partner

Partner screens should prioritize:

- daily agenda
- court availability
- reservation status
- pending and overdue payments
- court setup and pricing

After the MVP, partner or school screens can add:

- students and memberships
- tournament/event creation
- delinquency reports for school memberships

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
- player profile
- partner dashboard
- partner agenda
- partner court management
- partner manual payments view

V2 or later frontend scope:

- school teachers, classes, students, and plans
- tournament list/detail
- partner payments/delinquency for memberships

Avoid early complexity:

- advanced feed algorithms
- full social network
- dense gamification before the booking loop works
- Web3 wallet dependency in the default path
