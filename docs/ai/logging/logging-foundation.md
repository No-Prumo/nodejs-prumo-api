---
title: Logging Foundation
doc-type: implementation-guide
role: source-of-truth
priority: high
canonical: docs/ai/logging/logging-foundation.md
related:
  - docs/ai/index.md
  - docs/ai/config/configuration-foundation.md
scope: nestjs-pino, pino-http, structured-logging, request-correlation
read-when:
  - changing logger configuration
  - adjusting HTTP request logging
  - introducing correlation ids
  - adding tracing metadata to logs
do-not-read-when:
  - changing only business rules unrelated to logging
  - editing controllers or services without log policy impact
---

# Logging Foundation

## Purpose

Source of truth for the backend logging baseline.

This project uses:

- `nestjs-pino`
- `pino`
- `pino-http`
- `pino-pretty` only for local development

## Goals

- emit structured logs by default
- keep one logging stack only
- avoid duplicated HTTP logging
- preserve useful request correlation data
- stay lightweight and ready for future tracing

## Decisions

### Single stack

Use only `nestjs-pino` and its `pino-http` integration.

Do not mix with:

- `winston`
- custom HTTP logging interceptors
- a second application logger implementation

### Nest bootstrap integration

The Nest app must bootstrap with:

- `bufferLogs: true`
- `app.useLogger(app.get(Logger))`
- `LoggerErrorInterceptor` as the official `nestjs-pino` error enrichment hook

Reason:

- Nest internal logs and application logs go through the same logger
- HTTP error logs keep the original exception details
- no custom interceptor is required for request logging

### Environment model

Keep `NODE_ENV` standard for runtime mode:

- `development`
- `test`
- `production`

Use `APP_ENV` for deployment intent:

- `local`
- `test`
- `staging`
- `production`

Reason:

- `NODE_ENV=production` should remain available for staging and production alike
- staging/homologation often behaves like production technically, but should still be identifiable in logs

### Default log levels

Defaults are:

- `local`: `debug`
- `test`: `warn`
- `staging`: `info`
- `production`: `info`

`LOG_LEVEL` can still override these defaults explicitly.

Aliases from the Nest vocabulary are normalized:

- `log` -> `info`
- `verbose` -> `trace`

### Output format

- `local`: pretty logs enabled by default
- `staging` and `production`: JSON logs by default
- `test`: JSON logs by default

`LOG_PRETTY` can still override the default when needed.

### HTTP logging

Use `pino-http` auto logging and do not add a custom request logging interceptor.

Current behavior:

- one request completion log per request
- `requestId` is the single canonical correlation field in the event
- request payloads stay compact and do not repeat the same id inside `request`
- request and response payloads are serialized conservatively to reduce noise

Reason:

- keeps logs compact
- avoids repeating headers and request metadata on every log line
- still preserves enough context for debugging and operations

### Correlation

The logger accepts either:

- `x-request-id`
- `x-correlation-id`

If one is present, it becomes the canonical `requestId`.
If none is present, a UUID is generated.

The response mirrors the chosen id in:

- `X-Request-Id`
- `X-Correlation-Id`

Reason:

- works with both internal and external callers
- keeps a single correlation key in logs

### Metadata

Every log line includes:

- `service`
- `env`
- `version`

Request-scoped logs also include:

- `requestId`

If an incoming `traceparent` header exists and is valid, logs also include:

- `traceId`
- `spanId`

This is log enrichment only, not full tracing.

### Redaction policy

Request body logging remains off by default.

The logger still redacts common sensitive paths such as:

- credentials and token fields in request/body structures
- authorization and cookie headers if they appear

Reason:

- body logging is the largest accidental source of sensitive data leakage
- central redaction helps, but safe serialization is the first protection layer

## Trade-offs

### Why not log full headers and body everywhere

That would improve raw debug detail, but it increases:

- leakage risk
- ingestion cost
- cognitive noise

The current baseline prefers signal over exhaust.

### Why use `LoggerErrorInterceptor`

Without it, `pino-http` logs HTTP failures with generic error information.
Using the official interceptor enriches the error log with the actual exception while keeping the same logger stack.

### Why not implement tracing now

Full tracing adds SDK, propagation, exporters and backend decisions.
The current baseline stops before that point, but already reserves useful log fields and honors incoming W3C trace context.

## Operational guidance

- prefer structured fields over interpolating everything into the message
- do not log request bodies by default
- avoid logging secrets even if redaction exists
- use Nest `Logger` from `@nestjs/common` in application classes
- use `PinoLogger` only when native Pino behavior is explicitly needed
