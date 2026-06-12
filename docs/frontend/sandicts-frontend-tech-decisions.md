---
title: Sandicts Frontend Tech Decisions
doc-type: frontend-architecture-decision
role: source-of-truth
priority: high
canonical: docs/frontend/sandicts-frontend-tech-decisions.md
related:
  - docs/frontend/sandicts-frontend-context.md
  - docs/frontend/sandicts-frontend-planning.md
  - docs/frontend/sandicts-mvp-delivery-roadmap.md
  - docs/frontend/sandicts-page-functional-spec.md
  - docs/ai/product/sandicts-mvp-scope.md
scope: frontend, architecture, stack, mvp, delivery
read-when:
  - creating the Sandicts frontend app
  - choosing frontend libraries or architecture
  - creating frontend foundation Jira issues
  - deciding frontend data fetching, forms, state, tests, or API clients
  - reviewing whether a frontend change follows the agreed stack
do-not-read-when:
  - changing backend-only implementation with no frontend contract impact
---

# Sandicts Frontend Tech Decisions

## Purpose

This document records the agreed frontend technical direction for Sandicts.

It should prevent the frontend from reopening already decided technology
choices while still keeping unresolved implementation details visible as roadmap
tasks.

## Decision Status

Decided:

- use Next.js App Router with TypeScript
- use shadcn/ui with Tailwind CSS and lucide-react
- use TanStack Query for server state
- use Zod with React Hook Form for forms
- generate an OpenAPI client from the Nest Swagger contract
- use Zustand only for local UI state, not API data
- use Playwright for E2E tests
- use Vitest with Testing Library for components and hooks

Still open:

- frontend repository location
- Node.js version for the frontend
- package manager for the frontend
- exact OpenAPI generator
- deployment target
- CI shape for frontend checks
- final route map
- final navigation model for player and partner areas

## Core Stack

### Framework

Use:

- Next.js App Router
- React
- TypeScript

Rules:

- use App Router layouts for public, player, partner, and future admin areas
- keep product and business rules in the Nest API
- do not treat Next.js as a second business backend
- use server-side capabilities only when they improve routing, auth, metadata,
  initial reads, or user experience
- keep dynamic screen behavior client-friendly when the workflow is highly
  interactive

Reason:

- Sandicts has public discovery, authenticated player flows, partner operations,
  role-based shells, and future public pages
- Next.js gives better room for route structure, metadata, images, and public
  acquisition surfaces than a pure SPA foundation
- the Nest backend remains the system of record for rules, persistence, auth,
  and API contracts

### UI And Styling

Use:

- shadcn/ui
- Tailwind CSS
- lucide-react

Rules:

- start with shadcn/ui primitives and customize tokens for Sandicts
- keep components owned in the frontend codebase instead of depending on a
  closed external design system
- use lucide-react for icons where an existing icon fits the control
- define Sandicts tokens early: color, radius, typography, spacing, status
  colors, focus rings, and surface styles
- keep partner screens denser and more operational than player screens

Reason:

- shadcn/ui is fast for MVP delivery and easy to customize
- Sandicts needs a recognizable brand direction without spending the MVP on a
  full custom component system

### Server State

Use:

- TanStack Query

Rules:

- API data belongs in TanStack Query, not Zustand
- queries should be keyed by stable domain concepts
- mutations should invalidate or update relevant query caches intentionally
- loading, empty, error, stale, and optimistic states must be designed per flow
- do not mirror whole API resources into local global state

Examples of server state:

- current auth session
- player profile
- partner profile
- court list
- availability slots
- discovery results
- reservations
- payments
- open matches

### Local UI State

Use:

- Zustand only where local UI state needs cross-component coordination

Allowed examples:

- active app area or context switcher state
- sidebar and mobile navigation state
- multi-step UI draft state that is not yet persisted
- modal orchestration when local component state is insufficient

Avoid:

- storing API collections in Zustand
- duplicating TanStack Query cache
- using Zustand as a persistence substitute

### Forms And Validation

Use:

- React Hook Form
- Zod
- `@hookform/resolvers`

Rules:

- client validation should improve UX, not replace backend validation
- form schemas should match backend contracts when practical
- backend validation and business-rule errors must still be rendered clearly
- field validation errors should appear inline when possible
- business-rule failures should appear near the action or workflow state

Primary form areas:

- sign-in states
- player profile onboarding
- partner profile setup
- court creation/editing
- availability editor
- reservation request confirmation
- manual payment status update
- open match creation

### API Client

Use:

- generated OpenAPI client from the Nest Swagger contract

Rules:

- do not hand-write broad API clients when the OpenAPI contract can generate
  types and request functions
- API contract stability is a start criterion for integrated frontend work
- generated code should live in a predictable folder and be regenerated by a
  script
- frontend code should call a small domain wrapper where it improves error
  mapping or keeps generated code away from UI components
- requests must include credentials when auth depends on cookies

Open decision:

- choose the exact generator before app foundation implementation
- current candidates are Orval or openapi-typescript/openapi-fetch

### Testing

Use:

- Playwright for E2E
- Vitest for unit/component tests
- Testing Library for component and hook behavior

Rules:

- each MVP module needs an integration gate
- E2E should cover the critical user flow, not every UI detail
- component tests should focus on behavior, state rendering, and form validation
- visual/manual QA should be explicit when a flow is not yet stable enough for
  full automation

Initial E2E gates:

- auth: sign in, preserve or refresh session, sign out
- profile: create/update player profile
- partner: create/update partner profile
- courts: create and see court in partner list
- availability: publish slot and expose it to discovery
- discovery: filter courts by sport, availability, and price
- reservations: request, confirm, cancel, and block duplicates
- payments: update manual payment state
- open matches: create, join, leave, and block invalid joins

## Frontend Architecture Rules

The frontend should be organized around product areas and reusable primitives.

Recommended app areas:

- public
- player
- partner
- admin later only if needed

Recommended boundaries:

- `app`: route groups, layouts, route-level loading and error states
- `components`: shared UI composition and domain components
- `features`: feature-specific screens, forms, hooks, and view models
- `lib/api`: generated client and API helpers
- `lib/auth`: session helpers and route/auth utilities
- `lib/query`: query client setup and query key conventions
- `lib/forms`: shared form helpers when repetition appears
- `lib/ui-state`: Zustand stores for local UI state only

Do not finalize folder names until the frontend repository exists, but preserve
these boundaries in the first implementation.

## Prototype Before Build Rule

No MVP page should be treated as fully decided before it has a prototype or
wireflow approved enough to implement.

Before building a page or major component, create or update roadmap work for:

- the UX decision that the page depends on
- the prototype or Figma/wireflow task
- the API contract or mocked contract needed by the page
- the documentation update that captures the approved decision
- the frontend implementation
- the integrated validation gate

This applies even when the page is already listed in the functional specs. The
spec describes intent; the prototype decides the first shippable shape.

## Documentation Rules

Frontend documentation work is real delivery work and should be tracked.

Create docs tasks when:

- a stack decision is made
- a page behavior is approved
- an open product decision is resolved
- a prototype changes page behavior
- a backend API contract changes a frontend flow
- a new architecture rule is introduced
- existing docs are created but not yet reviewed or committed

Suggested task titles:

- `[Docs] Document frontend technology decisions`
- `[Docs] Align MVP frontend planning documents`
- `[Docs] Capture approved auth prototype decisions`
- `[Docs] Update page spec after reservation prototype`
- `[Docs] Reconcile frontend roadmap with Jira`

## Open Technical Decisions

Resolve before creating the frontend app:

- repository location: this backend repo, monorepo workspace, or separate repo
- package manager: keep npm alignment or choose another tool
- Node.js version: align with deployment and CI
- OpenAPI generator: Orval versus openapi-typescript/openapi-fetch
- environment variable naming
- frontend lint/typecheck/test commands
- CI jobs for frontend
- deployment target and preview environment strategy

Resolve before first integrated auth implementation:

- cookie/session behavior with the backend
- CORS and credentials behavior
- session hydration endpoint and response shape
- expired session UX
- sign-out behavior
- post-login routing

Resolve before each page implementation:

- final route for the page
- mobile and desktop navigation entry
- loading, empty, error, forbidden, and not-found states
- API contract or mock source
- validation/error mapping
- E2E gate for the flow

## Out Of Scope For This Decision

This document does not decide:

- exact Figma layouts
- exact route map
- deployment provider
- package manager
- frontend repository location
- final API endpoint names
- business rules already owned by backend/product docs
