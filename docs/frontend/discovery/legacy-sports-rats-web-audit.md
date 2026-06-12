---
title: Legacy Sports Rats Web Audit
doc-type: frontend-discovery
role: working-draft
priority: medium
scope: frontend, legacy-audit, mvp-planning
created: 2026-06-11
read-when:
  - auditing legacy sports-rats-web frontend decisions
  - comparing Sandicts frontend plans with the legacy implementation
  - recovering legacy UX, route, auth, or state-management context
do-not-read-when:
  - using current Sandicts frontend source-of-truth docs
  - creating routine roadmap, Jira, backend, or implementation tasks
  - deciding current stack without legacy comparison
---

# Legacy Sports Rats Web Audit

## Purpose

This document captures useful product and frontend learnings from the legacy
`sports-rats-web` application.

It is not a source of truth. It exists only as discovery material for legacy
comparison. Prefer `docs/frontend/sandicts-frontend-context.md`,
`docs/frontend/sandicts-frontend-tech-decisions.md`, and
`docs/frontend/sandicts-mvp-delivery-roadmap.md` for current Sandicts decisions.

## Legacy App Snapshot

Observed stack:

- Next.js app router
- TypeScript
- React
- Tailwind CSS
- Radix/shadcn-style UI primitives
- TanStack React Query
- Zustand
- Zod
- Axios
- Sonner toasts
- Google Identity Services client script

Useful project structure:

- `src/app`: route groups for auth, home redirect, and private dashboard
- `src/features/auth`: auth UI, hooks, services, and local auth store
- `src/features/header`: navigation and account menu
- `src/components`: reusable dashboard and UI components
- `src/config`: routes, providers, API client, and env parsing
- `src/db`: local mock data for player profile, skills, resources, and countries
- `src/types`: player, profile, sport, skill, and card-related types

## Implemented Or Partially Implemented UX

Implemented screens:

- sign-in page
- placeholder sign-up page
- authenticated dashboard page
- root redirect based on auth cookie

Implemented layout patterns:

- public auth area
- private app layout with header
- desktop navigation
- mobile sheet navigation component exists but is not wired into the header
- profile dropdown config

Implemented dashboard concepts:

- athlete greeting card
- main sport/player card area
- multi-sport card area
- attendance/progress statistics
- attendance calendar
- upcoming events summary
- progress chart

Configured navigation intentions:

- home
- skills
- progress
- arena

Only the dashboard route was present as a real private page. The `skills`,
`progress`, and `arena` items should be treated as product intent, not completed
flows.

## Auth Learnings

The legacy app implemented three auth directions:

- email and password sign-in
- Google OAuth code flow for the Google button
- Google One Tap using an ID token credential

Legacy endpoints used by the frontend:

- `POST /auth/sign-in`
- `POST /auth/sign-up`
- `POST /auth/google`
- `POST /auth/google-one-tap`
- `POST /auth/sign-out`
- `PATCH /token/user-refresh`

Sandicts current backend direction is different:

- Google Sign-In and Google One Tap should both use the backend Google sign-in
  endpoint.
- The frontend should send the Google credential or ID token to the backend.
- The backend validates the Google token and creates the internal Sandicts
  session.
- Password login and password recovery are not MVP priorities unless product
  scope changes.
- Google Calendar scopes must not be requested during login.

Carry forward:

- typed client env for `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- lazy Google Identity Services script loading
- Google button and One Tap as first-class auth entry points
- `withCredentials` API calls when cookie-based sessions are used
- predictable redirect from public-only routes when already signed in

Revisit before implementation:

- session source of truth
- cookie visibility and middleware behavior
- refresh endpoint shape
- whether frontend stores user state only, never secrets
- whether auth state is loaded from `/auth/session`, `/me`, or equivalent
- how auth errors are displayed without exposing provider details

Do not carry forward as MVP default:

- password sign-in form
- forgot/reset password links
- separate Google button endpoint and One Tap endpoint
- local persistence of auth data as the primary auth authority

## Domain And Product Learnings

Legacy product emphasis:

- athlete identity
- player card
- attributes
- fundamentals
- resources/special moves
- overall score
- sport progression
- practice attendance
- upcoming sport events

Current Sandicts MVP emphasis:

- account access with Google sign-in and Google One Tap
- basic player profile
- main sport
- simple player level by sport
- partner onboarding
- court management
- availability calendar
- court discovery
- reservations
- manual payment tracking
- player-created open matches

Useful for MVP:

- post-auth player home/dashboard composition
- sport selection pattern
- simple level/status visual treatment
- calendar and upcoming-events components as early inspiration
- account menu and sign-out behavior
- dark visual system with strong sand/orange accent

Mostly V2 or later:

- public player profile
- detailed fundamentals/resources
- player card evolution
- overall score
- advanced progress charts
- achievements and awards
- rich location/geolocation behavior
- tournaments
- social status mechanics

## Route And Navigation Implications

The new MVP should not copy the legacy navigation directly.

Recommended Sandicts navigation areas:

- public auth entry
- player area
- partner area

Recommended player-first routes to draft:

- `/sign-in`
- `/app`
- `/app/profile`
- `/app/discovery`
- `/app/courts/[courtId]`
- `/app/reservations`
- `/app/open-matches`
- `/app/open-matches/[matchId]`
- `/app/open-matches/new`

Recommended partner routes to draft:

- `/partner`
- `/partner/profile`
- `/partner/courts`
- `/partner/courts/new`
- `/partner/availability`
- `/partner/agenda`
- `/partner/reservations/[reservationId]`
- `/partner/payments`

Open decision:

- whether player and partner areas live in one web app with role-aware routes or
  in separate apps/layouts.

## API Integration Implications

The frontend should be planned against the backend session model, not the legacy
auth response shape.

Needed frontend-facing contracts:

- Google sign-in request and response
- session refresh behavior
- sign-out behavior
- current session/current account endpoint
- player profile read/update
- partner profile read/update
- court CRUD
- availability slot CRUD
- discovery query
- reservation request and partner decision
- manual payment status update
- open match CRUD and join/leave actions

For each API area, capture:

- loading state
- empty state
- validation error display
- business-rule error display
- forbidden state
- not-found state
- expired-session behavior

## Recommended Carry Forward

Keep as inspiration:

- Next.js app router organization
- typed env parsing with Zod
- provider composition
- API client with credentials
- React Query for server state
- Zustand for local UI/session projection where useful
- shadcn/Radix-style primitives if the new styling choice keeps that direction
- dark theme with orange accent
- athlete identity visual language

Change for Sandicts MVP:

- make marketplace and booking the primary product loop
- make Google auth the default low-friction path
- make player progression lightweight
- introduce partner-facing operational screens early
- separate V2 progression mechanics from MVP profile and matching needs

## Open Questions

- Which Node.js version should the new frontend target?
- Will the frontend live in the same monorepo or a separate repository?
- Which styling/component strategy will be used?
- Should public discovery be available before sign-in?
- Should the app be player-first, partner-first, or balanced in the first
  release?
- What is the session storage strategy agreed with the backend?
- Which endpoint will hydrate the authenticated user after refresh?
- What is the first integrated vertical slice after auth?
