---
title: Authentication And Session Pattern
doc-type: architecture-guide
role: source-of-truth
priority: high
canonical: docs/ai/architecture/authentication-session-pattern.md
related:
  - docs/ai/architecture/backend-architecture-overview.md
  - docs/ai/architecture/module-pattern.md
  - docs/ai/architecture/controller-pattern.md
  - docs/ai/architecture/use-case-pattern.md
  - docs/ai/api/error-handling-foundation.md
  - docs/ai/api/zod-swagger-foundation.md
  - docs/ai/logging/logging-foundation.md
scope: authentication, sign-up, sign-in, refresh-tokens, sessions, magic-link, google-login, passwords
read-when:
  - implementing account creation
  - implementing sign-in or sign-out
  - implementing refresh token rotation
  - adding a new authentication method
  - changing session lifetime, cookies, or token storage
  - integrating Google sign-in
do-not-read-when:
  - changing only non-authenticated public endpoints
  - changing only reservation, payment, tournament, or finance rules with no auth behavior change
---

# Authentication And Session Pattern

## Purpose

This document defines how Sandicts should handle sign-up, sign-in, sessions, refresh tokens, and authentication providers.

The goal is a secure but practical authentication model:

- support the right login options for the product
- keep one internal session system
- avoid provider-specific auth leaking through the application
- keep future mobile support possible
- avoid overengineering before there is real risk or product pressure

## Recommended Auth Methods

Use these three methods for MVP:

- email and password
- email magic link
- Google sign-in

Do not add SMS login, Facebook, Apple, passkeys, or MFA in the first implementation unless product direction changes.

Future candidates:

- Apple sign-in when the mobile app enters the roadmap
- passkeys when the product has enough adoption to justify the UX and support work
- MFA for partner admins and financial actions

Avoid SMS OTP as a primary method. It adds cost, operational complexity, carrier issues, and weaker security properties than app/email/passwordless alternatives.

## Core Decision

All sign-in methods must create the same internal session.

```txt
password sign-in
magic link sign-in
Google sign-in
  -> resolve or create account
  -> create internal session
  -> issue access token
  -> issue refresh token
```

Do not create separate session logic per auth method.

## Account Model

Recommended conceptual model:

- `Account`: login identity shared by player, partner user, or staff user
- `Credential`: password credential for an account
- `ExternalIdentity`: provider identity such as Google
- `AuthSession`: refresh-token-backed internal session
- `MagicLinkChallenge`: one-time email login challenge

Domain-specific profiles should remain separate:

- `PlayerProfile`
- `PartnerUserProfile`
- `StaffProfile`

Reason:

- authentication answers "who is this?"
- authorization answers "what can this account do?"
- product profiles answer "what does this user represent in Sandicts?"

## Access Token

Use a short-lived access token.

Recommended default:

- JWT
- lifetime: 10 to 15 minutes
- contains only stable authorization claims

Allowed claims:

- `sub`
- `sessionId`
- `role` or role summary
- `partnerId` when the active context is partner-scoped
- token issued-at and expiration claims

Do not put sensitive or frequently changing data in the access token.

## Refresh Token

Use refresh tokens for security and user experience.

Recommended default:

- opaque random token, not JWT
- stored only as a hash in the database
- sent to browser as `HttpOnly`, `Secure`, `SameSite` cookie
- rotated on every refresh
- tied to one `AuthSession`
- revocable by session, account, and token family

Why opaque:

- easier to revoke
- smaller public attack surface
- no accidental trust in stale embedded claims
- server can detect reuse after rotation

## Refresh Token Rotation

Every refresh should:

1. verify the submitted refresh token hash
2. verify session is active and not expired
3. invalidate the previous refresh token
4. issue a new refresh token
5. issue a new access token
6. persist the rotation

If an already-rotated refresh token is used again:

- treat it as possible token theft
- revoke the token family or session
- log a structured security event
- return `401`

Recommended lifetimes:

- access token: 10 to 15 minutes
- refresh token idle expiration: 7 to 14 days
- refresh token absolute expiration: 30 days

These values can be adjusted later for mobile app behavior.

## Cookie Policy

For browser clients, prefer cookies for refresh token transport.

Recommended cookie attributes:

- `HttpOnly`
- `Secure` outside local development
- `SameSite=Lax` for normal same-site frontend/API usage
- narrow `Path`, such as `/auth/refresh` for refresh token when possible
- no broad `Domain` unless cross-subdomain behavior is intentionally needed

If the frontend and API must be cross-site, revisit CSRF protections before changing `SameSite=None`.

## CSRF Policy

If authenticated browser requests rely on cookies, unsafe methods need CSRF consideration.

Default first step:

- use `SameSite=Lax`
- keep access/refresh cookies `HttpOnly`
- do not allow broad cross-site credentialed CORS

Add explicit CSRF token protection when:

- frontend and API become cross-site
- cookies are sent with `SameSite=None`
- admin or financial workflows become sensitive enough to require defense in depth

## Password Sign-Up

Endpoint shape:

```txt
POST /auth/password/sign-up
```

Input:

- name
- email
- password
- optional intended profile type when product needs it

Rules:

- normalize email before lookup
- hash password with a modern password hashing strategy
- prefer Argon2id when adding password hashing infrastructure
- bcrypt is acceptable only with deliberate cost configuration and migration awareness
- never store or log raw passwords
- create account and password credential atomically
- create session after successful sign-up

Response:

- account/profile response intended for frontend
- auth cookies set by controller or auth response helper

Email verification:

- for MVP, magic link sign-in can double as proof that the user controls the email
- if password sign-up allows immediate access before email verification, restrict sensitive flows until verified

## Password Sign-In

Endpoint shape:

```txt
POST /auth/password/sign-in
```

Rules:

- use generic error for invalid email/password
- rate-limit by IP and normalized email
- verify password hash through a dedicated password hasher service
- create an internal session after success
- do not leak whether the email exists

Expected failure:

- invalid credentials -> `unauthorized`

## Magic Link Sign-In

Endpoint shapes:

```txt
POST /auth/magic-link/request
POST /auth/magic-link/consume
```

Request rules:

- accept normalized email
- always return a generic success response
- do not reveal whether the account exists
- rate-limit by IP and normalized email
- create a one-time challenge if sign-in is allowed
- send a short-lived link by email

Challenge rules:

- random high-entropy token
- store only token hash
- single use
- short TTL, usually 10 to 15 minutes
- bind optional metadata such as redirect target, IP, user agent, and purpose

Consume rules:

- final authentication must happen through `POST`
- do not consume the token with a direct backend `GET`
- reject expired, used, or invalid tokens
- mark challenge as used before or atomically with session creation
- create account on first successful magic link only if product allows passwordless sign-up

Reason for `POST` consumption:

- email scanners and link preview tools may open links automatically
- a frontend landing page can receive the token and then intentionally submit it

## Google Sign-In

Google sign-in should use OpenID Connect.

Supported MVP approach:

```txt
POST /auth/google/sign-in
```

The frontend sends a Google ID token or authorization result. The backend must validate:

- issuer
- audience/client id
- expiration
- signature
- subject
- email verification state

Rules:

- use Google's stable `sub` as provider identity
- do not use email as the provider identity key
- store Google identity in `ExternalIdentity`
- if the same verified email already exists locally, link Google identity according to the account-linking policy
- create an internal Sandicts session after success

Account-linking policy:

- if account already has the same Google `sub`, sign in
- if no account exists and Google email is verified, create account
- if account exists with same verified email but no Google identity, allow automatic link only for low-risk player accounts
- require reauthentication before linking provider identity for partner admins, staff, or financial roles

Google Calendar is separate:

- Google sign-in authenticates the user
- Google Calendar authorization grants calendar access
- do not request calendar scopes during basic sign-in
- add a separate calendar connection flow when scheduling sync is implemented

## Sign-Out

Endpoint shapes:

```txt
POST /auth/sign-out
POST /auth/sign-out-all
```

Rules:

- sign-out revokes the current session
- sign-out-all revokes all sessions for the account
- clear refresh cookie
- access token naturally expires quickly

## Session Inspection

Endpoint shape:

```txt
GET /auth/me
```

Rules:

- returns the current authenticated account/profile summary
- never returns refresh token data
- should be cheap and stable for frontend bootstrap

## Observability

Log structured security events for:

- successful sign-in
- failed sign-in threshold exceeded
- refresh token reuse detection
- sign-out-all
- provider account linking
- suspicious account recovery behavior

Never log:

- raw passwords
- raw refresh tokens
- raw magic link tokens
- Google ID tokens
- authorization codes

## Rate Limiting

Auth endpoints need rate limiting before public launch.

Minimum targets:

- password sign-in
- magic link request
- magic link consume
- refresh token reuse failures
- Google sign-in failures

Rate-limit responses should stay generic.

## Error Semantics

Use `AppError` from application code.

Recommended mappings:

- invalid credentials -> `unauthorized`
- expired or invalid magic link -> `unauthorized`
- refresh token invalid or expired -> `unauthorized`
- account blocked -> `forbidden`
- email already used in explicit sign-up -> `conflict`
- provider identity already linked elsewhere -> `conflict`

Avoid provider-specific messages in public responses.

## Initial Endpoint List

Recommended first implementation set:

```txt
POST /auth/password/sign-up
POST /auth/password/sign-in
POST /auth/magic-link/request
POST /auth/magic-link/consume
POST /auth/google/sign-in
POST /auth/refresh
POST /auth/sign-out
POST /auth/sign-out-all
GET  /auth/me
```

## What Not To Add Yet

Do not add now:

- SMS login
- Facebook login
- Apple login before mobile need
- passkeys before UX/support readiness
- full MFA for every user
- separate session systems per auth method
- long-lived JWT access tokens
- refresh tokens stored in localStorage

## Research Basis

This document follows:

- OWASP Authentication Cheat Sheet
- OWASP Session Management Cheat Sheet
- OWASP Password Storage Cheat Sheet
- OWASP Forgot Password Cheat Sheet
- OAuth 2.0 Security Best Current Practice, RFC 9700
- Google OpenID Connect documentation

