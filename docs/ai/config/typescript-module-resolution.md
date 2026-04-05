---
title: TypeScript Module Resolution
doc-type: decision-record
role: source-of-truth
priority: high
canonical: docs/ai/config/typescript-module-resolution.md
related:
  - docs/ai/index.md
  - docs/ai/config/configuration-foundation.md
  - tsconfig.json
  - package.json
scope: typescript, module-resolution, nodenext, imports
read-when:
  - changing tsconfig module resolution
  - adding path aliases
  - touching import conventions
  - investigating TypeScript warnings about baseUrl or paths
do-not-read-when:
  - editing only business logic with existing relative imports
---

# TypeScript Module Resolution

## Decision

`baseUrl` was removed from `tsconfig.json`.

For this project, the recommended format is:

- keep `module` and `moduleResolution` as `nodenext`
- use standard relative imports inside the app
- avoid `baseUrl` for app-local resolution
- avoid TypeScript-only aliases unless there is a proven need

If an alias becomes necessary later, prefer Node-compatible package aliases through `package.json#imports` instead of reintroducing `baseUrl`.

## Why

Current code only uses relative imports and package imports.

That means `baseUrl` was not providing behavior the project actually depended on. Keeping it would only preserve deprecated configuration surface and make future tooling harder to reason about.

## Current impact

What changed:

- `tsconfig.json` no longer declares `baseUrl`
- `package.json` no longer preloads `tsconfig-paths/register` in `test:debug`

What did not change:

- runtime module behavior
- Nest build flow
- import style in `src/`

## Rules for future tasks

- default to relative imports for app code
- do not add `baseUrl` back
- do not add `paths` as a shortcut for internal imports unless the user explicitly wants that tradeoff
- if stable aliases are needed across runtime and tooling, design them with `package.json#imports` and validate Node/Nest/Jest compatibility before adoption

## Verification checklist

After touching module resolution, validate at least:

1. `npm run build`
2. `npm run typecheck`
3. `npm test -- --runInBand`

If one of these fails after alias-related changes, first check whether the code accidentally started depending on a TypeScript-only resolver feature.
