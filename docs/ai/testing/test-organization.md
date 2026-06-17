---
title: Test Organization
doc-type: implementation-guide
role: source-of-truth
priority: high
canonical: docs/ai/testing/test-organization.md
related:
  - docs/ai/index.md
  - docs/ai/architecture/use-case-pattern.md
  - docs/ai/config/typescript-module-resolution.md
scope: tests, fixtures, builders, vitest, support-files
read-when:
  - adding backend tests
  - refactoring repeated test setup
  - deciding where test fixtures or builders should live
do-not-read-when:
  - changing production code without test changes
---

# Test Organization

## Purpose

Keep tests readable while avoiding repeated fixture data and repeated framework
configuration.

## Default Pattern

Use local `makeSut()` functions inside each spec when the dependency graph is
specific to that use case, controller, repository, or gateway.

Extract shared helpers only when repetition is visible across multiple specs.

Good shared helpers:

- stable test configuration builders
- entity record factories
- small request or response builders
- in-memory fixture data reused across specs

Avoid shared helpers for:

- one-off assertions
- a single spec's dependency graph
- behavior that hides the purpose of a test
- production code dependencies

## Placement

Put backend test helpers under `test/support/`.

Use the `@test-support/*` path alias from specs when the helper is
used in more than one folder.

Do not put test helpers under `src/test` or production module folders.

Rules:

- production `src/**/*.ts` files must not import `@test-support/*`
- shared test helper types follow the same `.types.ts` placement rule when they
  are not the primary purpose of the helper file
- local mock types may stay in a spec when they only support that spec

## Fixtures And Builders

Prefer builders over exported mutable fixture objects.

Good:

```ts
const account = buildAccountRecord({
  email: 'player@example.com',
});
```

Avoid:

```ts
accountsRepository.accounts.push(sharedAccount);
```

Reason:

- each test receives a fresh object
- tests can override only the field that matters
- accidental mutation does not leak between cases

## Configuration

Repeated config setup belongs in a test support builder.

Example:

```ts
const authSettings = buildTestAuthConfig({
  AUTH_MAGIC_LINK_TTL_SECONDS: '600',
});
```

The helper should provide safe default values and allow focused overrides.

## Validation

After moving test helpers or aliases, run at least:

1. `npm run typecheck`
2. `npm run test`
3. `npm run lint:ci`
