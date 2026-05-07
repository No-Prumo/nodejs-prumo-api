---
title: External Integrations Pattern
doc-type: architecture-guide
role: source-of-truth
priority: high
canonical: docs/ai/architecture/external-integrations-pattern.md
related:
  - docs/ai/architecture/backend-architecture-overview.md
  - docs/ai/architecture/use-case-pattern.md
  - docs/ai/architecture/repository-pattern.md
  - docs/ai/logging/logging-foundation.md
  - docs/ai/api/error-handling-foundation.md
scope: payments, google-calendar, webhooks, gateways, external-providers
read-when:
  - integrating payment providers
  - integrating Google Calendar
  - adding webhooks
  - adding external API clients
  - deciding idempotency or retry behavior
do-not-read-when:
  - changing only local domain rules with no provider call
  - changing only route validation
---

# External Integrations Pattern

## Purpose

External systems must stay behind application ports.

This includes:

- payment gateways
- Google Calendar
- email providers
- WhatsApp providers
- push notification providers
- storage providers

The core product flow should not depend on provider SDK details.

## Port And Adapter Pattern

Application port:

```txt
modules/billing/application/ports/payment-gateway.ts
```

Infrastructure adapter:

```txt
modules/billing/infrastructure/gateways/mercado-pago/
modules/billing/infrastructure/gateways/stripe/
```

Rules:

- use cases call the port
- adapters call the provider SDK/API
- modules wire the concrete adapter
- provider responses are mapped into application-level results
- raw provider payloads do not leak into controllers by default

## Payment Provider Rules

Payment flows must support:

- local payment record
- provider payment id
- idempotency key for commands that can be retried
- webhook event id or equivalent deduplication key
- explicit local status
- safe handling of repeated or out-of-order webhook events

Recommended statuses:

- `pending`
- `paid`
- `failed`
- `refunded`
- `overdue`

Rules:

- do not trust frontend payment state as final
- do not confirm reservations from the frontend callback alone
- webhooks must be idempotent
- provider secrets and raw error details must not be exposed in public API responses
- provider errors should be logged with structured safe metadata

## Calendar Rules

Internal scheduling is the source of truth.

Google Calendar is an integration layer, not the primary reservation database.

Rules:

- store local availability and reservations internally
- create, update, or delete calendar events as a side effect
- store external event id when synced
- handle webhook channel expiration if push notifications are used
- handle provider downtime without corrupting the local reservation state

## Webhook Controllers

Webhook endpoints are still controllers, but they may handle transport-specific details:

- raw body extraction
- signature headers
- provider event id
- provider-specific acknowledgement status

After verification, delegate to a use case:

```txt
WebhookController
  -> verify signature through provider adapter/helper
  -> HandlePaymentWebhookUseCase
  -> idempotency check
  -> local state update
```

## Error Policy

Expected provider business outcomes should become domain state.

Examples:

- card declined -> payment `failed`
- checkout expired -> payment `failed` or `expired`
- refund succeeded -> payment `refunded`

Provider outages and malformed provider responses should not expose raw provider details. Let the global exception filter return a safe internal error response and keep detailed context in logs.

## Outbox Guidance

Do not add an outbox table before it is needed.

Add an outbox pattern when:

- a local database commit must reliably trigger an external side effect
- losing a notification, calendar sync, or provider command would be unacceptable
- retries need durable state

Good future candidates:

- payment confirmation events
- calendar sync jobs
- notification delivery
- finance reconciliation jobs

## Testing

Use contract-style tests around provider adapters when integration behavior is important.

Use fake ports for use case tests.

Test webhook handling for:

- valid signature
- invalid signature
- duplicate event
- out-of-order event
- provider event that references an unknown local record

