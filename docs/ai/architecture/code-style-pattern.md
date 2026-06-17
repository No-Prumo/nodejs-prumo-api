---
title: Code Style Pattern
doc-type: architecture-guideline
role: source-of-truth
priority: medium
canonical: docs/ai/architecture/code-style-pattern.md
related:
  - docs/ai/index.md
  - docs/ai/config/typescript-module-resolution.md
  - sandicts/reactjs-sandicts-web:docs/frontend/sandicts-frontend-tech-decisions.md
scope: backend, frontend, code-style, maintainability
read-when:
  - adding reusable constants or helpers
  - reviewing code style
  - replacing magic numbers or unclear literals
  - changing backend or frontend implementation conventions
do-not-read-when:
  - changing docs-only product copy
---

# Code Style Pattern

## Purpose

Keep implementation intent visible in code.

## Magic Numbers And Unclear Literals

Do not leave non-obvious numeric literals inline when the value represents a
domain rule, unit conversion, timeout, TTL, byte length, rate limit, status
threshold, layout implementation value, or validation boundary.

Prefer a semantic constant or helper:

- `millisecondsPerSecond` instead of inline `1000`
- `addSeconds(date, ttlSeconds)` instead of `date.getTime() + ttlSeconds * 1000`
- `googleSignInRateLimit` instead of inline throttle `20`
- `minimumGoogleIdTokenLength` instead of inline schema `.min(10)`
- `sandictsMarkSizePx` instead of repeated JSX `width={44}` and `height={44}`

Allowed inline values:

- `0` and `1` when they are obvious counters, array indexes, or boolean-like
  thresholds in a local expression
- HTTP status codes when wrapped by framework constants such as `HttpStatus.OK`
- Tailwind utility scale classes such as `px-4`, `gap-8`, and `text-5xl`
- package versions, documented examples, ports in user-facing docs, generated
  code, and literal fixture data where the literal is the scenario itself

When in doubt, name the value close to where it is used. Extract to a shared
helper only after repetition appears or the value represents a cross-cutting
concept such as time conversion.
