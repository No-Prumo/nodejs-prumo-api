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
scope: typescript, module-resolution, nodenext, path-aliases
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

Backend aliases are configured in `tsconfig.json` with `baseUrl` and `paths`.

For this project, the recommended format is:

- keep `module` and `moduleResolution` as `nodenext`
- use standard relative imports for local sibling files and feature-private
  implementation details
- use TypeScript path aliases for frequently imported project roots
- keep build/runtime support explicit with `tsc-alias`
- keep test support explicit with Vite's `resolve.tsconfigPaths`

Current approved aliases:

- `@config` for the public config barrel
- `@shared/*` for cross-cutting shared primitives
- `@infra/*` for shared platform infrastructure
- `@generated/*` for generated source under `src/generated`
- `@auth/*` for repeated imports inside the auth feature module
- `@test-support/*` for reusable test helpers under `test/support`

## Why

Deep relative imports made shared config, shared errors, infra services, and
auth module support code harder to scan.

TypeScript path aliases keep import style consistent with the frontend and keep
`package.json` focused on package metadata and scripts.

Because TypeScript does not rewrite path aliases during emit, the backend build
must compile with `tsc -p tsconfig.build.json` and then run `tsc-alias`. This
rewrites compiled `dist` imports to relative JavaScript paths before production
runtime.

## Current impact

What changed:

- `tsconfig.json` declares `baseUrl` for the approved path aliases
- `tsconfig.json` owns the approved `paths` aliases
- `package.json` runs `tsc -p tsconfig.build.json` and then `tsc-alias`
- `vitest.config.ts` enables `resolve.tsconfigPaths` so tests resolve the same
  aliases from `tsconfig.json`
- local sibling imports, including `.types.ts` files, stay relative

What did not change:

- Nest runtime and dependency injection behavior
- relative imports for feature-private files

## Rules for future tasks

- default to relative imports for sibling files and feature-private files
- add or change aliases only through `tsconfig.json` `paths`
- keep `package.json` free from large `imports` alias maps
- keep `tsc-alias` in the build path when aliases are used in production source
- keep use case `.types.ts` imports relative to their implementation file
- keep `@test-support/*` out of production `src/**/*.ts` files
- validate TypeScript, Vitest, Nest build, and compiled Node runtime before
  expanding alias usage

## Verification checklist

After touching module resolution, validate at least:

1. `npm run build`
2. `npm run typecheck`
3. `npm test -- --runInBand`

If one of these fails after alias-related changes, first check whether the
compiled `dist` output was rewritten by `tsc-alias` and whether Vitest is still
using `resolve.tsconfigPaths`.
