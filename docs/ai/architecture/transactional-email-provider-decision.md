---
title: Transactional Email Provider Decision
doc-type: architecture-decision
role: source-of-truth
priority: high
canonical: docs/ai/architecture/transactional-email-provider-decision.md
related:
  - docs/ai/architecture/authentication-session-pattern.md
  - docs/ai/architecture/external-integrations-pattern.md
  - docs/ai/config/configuration-foundation.md
scope: auth, magic-link, transactional-email, resend, local-development, e2e
read-when:
  - implementing magic link email delivery
  - changing the transactional email provider
  - configuring local or E2E magic link email capture
  - changing transactional email environment variables
do-not-read-when:
  - changing unrelated session token behavior
  - changing marketing email or notification flows outside auth
---

# Transactional Email Provider Decision

## Decision

Use Resend as the MVP transactional email provider for auth magic links.

This is a delivery-provider decision, not a new auth model. Magic link request,
challenge, consume, and session creation rules remain owned by
`docs/ai/architecture/authentication-session-pattern.md`.

The provider must remain replaceable. Application use cases call the
`EMAIL_GATEWAY` port; only infrastructure adapters may depend on Resend SDK/API
details. Postmark and Amazon SES stay valid future alternatives if delivery,
cost, compliance, or operational needs change.

## Current Boundary

Current auth code uses this seam:

```txt
RequestMagicLinkUseCase
  -> EMAIL_GATEWAY
  -> ResendEmailGateway | SmtpEmailGateway | DevelopmentEmailGateway
```

Rules:

- do not import Resend SDK/API from controllers or use cases
- do not expose Resend message ids, errors, API keys, or payloads in public
  responses
- keep provider-specific configuration in typed config and infrastructure
  adapters
- keep raw magic link tokens out of logs
- keep provider failures mapped to safe application errors and structured
  internal logs
- expose provider delivery failures as `503 email_delivery_unavailable`, never
  as provider-specific public errors
- build links from the validated `WEB_APP_BASE_URL` origin and the canonical
  `/sign-in/magic-link` frontend path

## Provider Comparison

| Provider | MVP fit | Tradeoff |
| --- | --- | --- |
| Resend | Chosen for MVP because it has a developer-focused REST API, Node-friendly integration, custom domains, webhook support, and safe test addresses. | Younger operational track record than older transactional providers; keep adapter portable. |
| Postmark | Strong future fallback for transactional deliverability, sandbox servers, analytics, and mature auth-style email flows. | Higher starting cost and less compelling MVP DX than Resend for this project. |
| Amazon SES | Strong future fallback for low cost and AWS-scale production delivery. | Requires more account, IAM, sandbox exit, reputation, and deliverability operations than the MVP should absorb. |
| SendGrid | Capable API provider with broad ecosystem and security features. | Broader platform and plan structure are heavier than needed for MVP magic links. |
| Mailgun | Capable API/SMTP provider with tracking, analytics, webhooks, and authentication protocols. | Also broader than needed for MVP; keep as a later migration candidate rather than the first implementation. |

## Environment Strategy

Use different adapters by environment:

| Environment | Delivery path | Rule |
| --- | --- | --- |
| Unit tests | fake or in-memory `EmailGateway` | Assert use case behavior without network or SMTP. |
| Local development | Mailpit SMTP capture | Capture real email content locally without sending to an inbox. |
| E2E | Mailpit SMTP capture | Playwright should read the magic link from Mailpit's HTTP API or a test helper that reads Mailpit, not from logs. |
| Staging | Resend with restricted sender/domain and test recipients until domain setup is verified | Exercise the real provider without broad user delivery. |
| Production | Resend with verified Sandicts sender domain | Send real auth magic links. |

The current `DevelopmentEmailGateway` can remain a unit-test or temporary local
adapter while KAN-103 implements provider selection. Integrated local and E2E
flows should converge on Mailpit so humans and automated tests inspect the same
captured email artifact.

Do not log raw magic link tokens to make local testing easier. Local capture
belongs in the email capture tool or explicit test support, never in normal
application logs.

## Required Configuration

KAN-103 should add typed config for these variables or semantically equivalent
names:

| Variable | Required | Purpose |
| --- | --- | --- |
| `EMAIL_DELIVERY_PROVIDER` | Yes | Selects `resend`, `smtp`, or test/development adapter. |
| `EMAIL_FROM_ADDRESS` | Yes outside unit tests | Sender address used for auth emails. |
| `EMAIL_FROM_NAME` | No | Human-readable sender name, defaulting to `Sandicts`. |
| `EMAIL_REPLY_TO_ADDRESS` | No | Reply-to address if product/support wants one. |
| `WEB_APP_BASE_URL` | Yes for magic links | Frontend origin used to build magic link URLs. |
| `RESEND_API_KEY` | Required when `EMAIL_DELIVERY_PROVIDER=resend` | Resend API credential. |
| `SMTP_HOST` | Required when `EMAIL_DELIVERY_PROVIDER=smtp` | SMTP host, usually Mailpit locally. |
| `SMTP_PORT` | Required when `EMAIL_DELIVERY_PROVIDER=smtp` | SMTP port, usually `1025` for Mailpit. |
| `SMTP_SECURE` | No | Whether SMTP uses TLS. Local Mailpit defaults to false. |
| `SMTP_USER` | Optional | SMTP username when the selected SMTP server needs auth. |
| `SMTP_PASSWORD` | Optional | SMTP password when the selected SMTP server needs auth. |

Existing auth settings still apply:

- `AUTH_MAGIC_LINK_TTL_SECONDS`
- access token settings
- refresh cookie settings

Secrets must not be committed. Production/staging secrets belong in the runtime
secret store for the deployment target.

## Sender And Domain Requirements

Before production delivery:

- verify the Sandicts sending domain in Resend
- configure DNS records required by the provider, including SPF, DKIM, and DMARC
  where applicable
- use a stable auth sender address such as `auth@<sandicts-domain>`
- avoid using personal inboxes or unverified sender addresses
- validate at least one staging delivery against the real domain before public
  launch

Dedicated IPs, custom bounce processing, and advanced deliverability monitoring
are not MVP requirements.

## Implemented By KAN-103

- Resend email adapter behind `EMAIL_GATEWAY`
- SMTP/Mailpit capture adapter for local and E2E environments
- typed email configuration and env validation
- magic link URL construction from the configured frontend base URL
- safe provider error mapping and logs
- focused adapter/use case tests

## Follow-Ups

KAN-106 should implement:

- Playwright magic link flow using Mailpit capture or a test helper backed by
  Mailpit
- documentation for running local E2E email capture

Production hardening can stay outside MVP unless launch needs it:

- bounce and spam complaint webhooks
- suppression-list handling
- delivery metrics and alerting
- durable outbox/retry if email loss becomes unacceptable
- provider migration runbook

## Sources Checked

Provider details are intentionally summarized because pricing and plans change.
When revisiting this decision, check official provider docs again:

- [Resend pricing](https://resend.com/pricing)
- [Resend test emails](https://resend.com/docs/dashboard/emails/send-test-emails)
- [Postmark pricing](https://postmarkapp.com/pricing)
- [Postmark sandbox mode](https://postmarkapp.com/developer/user-guide/sandbox-mode/server-sandbox-mode)
- [Amazon SES pricing](https://aws.amazon.com/ses/pricing/)
- [Amazon SES sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [Twilio SendGrid Email API pricing](https://www.twilio.com/en-us/products/email-api/pricing)
- [Mailgun pricing](https://www.mailgun.com/pricing/)
- [Mailpit](https://mailpit.axllent.org/)
