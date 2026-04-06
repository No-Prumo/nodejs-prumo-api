---
title: Zod HTTP Validation and Swagger Foundation
doc-type: implementation-guide
role: source-of-truth
priority: high
canonical: docs/ai/api/zod-swagger-foundation.md
related:
  - docs/ai/config/configuration-foundation.md
  - docs/ai/index.md
scope: nestjs-zod, swagger, openapi, controller-validation, request-response-contracts
read-when:
  - adding new endpoints
  - changing request validation
  - changing swagger generation
  - creating query, params, body, or response schemas
do-not-read-when:
  - changing only infrastructure unrelated to HTTP contracts
  - editing only persistence internals with no API surface change
---

# Zod HTTP Validation and Swagger Foundation

## Purpose

Source of truth for API contract validation and documentation.

This project uses one contract source for HTTP endpoints:

- Zod schema defines the contract
- `createZodDto()` bridges that schema into Nest controller signatures
- `ZodValidationPipe` validates incoming `params`, `query`, and `body`
- `ZodResponse` validates and documents outgoing responses
- Swagger/OpenAPI is generated from the same Zod-backed DTOs

## Runtime flow

1. A request reaches a controller
2. The global Zod validation pipe reads the DTO type used in `@Param()`, `@Query()`, or `@Body()`
3. The corresponding Zod schema parses the incoming data
4. Invalid input returns `400`
5. The controller/service returns data
6. `ZodResponse` plus the global serializer interceptor validates the response shape
7. Swagger/OpenAPI describes the same request and response schemas

## Global setup

### `src/app.module.ts`

Global validation and response serialization are enabled with:

- `APP_PIPE` using `createZodValidationPipe({ strictSchemaDeclaration: true })`
- `APP_INTERCEPTOR` using `ZodSerializerInterceptor`

Why `strictSchemaDeclaration: true` matters:

- it prevents accidental unvalidated controller inputs
- if a controller parameter is declared without a nestjs-zod DTO, the app surfaces that mistake immediately

### `src/main.ts`

Swagger is bootstrapped with:

- a local `setupDocs()` helper
- `SwaggerModule.createDocument(...)`
- `cleanupOpenApiDoc(...)`

`cleanupOpenApiDoc()` is required to normalize the OpenAPI document generated from Zod-backed DTOs.

Current bootstrap decision:

- keep Swagger setup extracted as a local helper inside `main.ts`
- do not create `src/bootstrap/setup-docs.ts` yet
- promote bootstrap helpers to dedicated files only after multiple global platform concerns exist

## DTO pattern

Pattern:

```ts
const CreateThingSchema = z.object({
  name: z.string().min(2),
});

export class CreateThingDto extends createZodDto(CreateThingSchema) {}
```

Rules:

- the Zod schema is the source of truth
- the DTO class is only the Nest integration wrapper
- use `.meta({ id: 'Name' })` to produce stable OpenAPI schema names

## Controller pattern

Pattern:

```ts
@Post(':id')
@ZodResponse({ status: 201, type: ThingResponseDto })
createThing(
  @Param() params: ThingParamsDto,
  @Query() query: ThingQueryDto,
  @Body() body: CreateThingDto,
) {
  return this.service.create(params, query, body);
}
```

Effects:

- request validation comes from the DTO parameter types
- response validation and Swagger response docs come from `@ZodResponse`

## Rules for new endpoints

For every new endpoint with external input:

1. create Zod schema for each input source that exists
2. wrap each schema with `createZodDto()`
3. use DTOs in `@Param()`, `@Query()`, and `@Body()`
4. define a response schema and DTO
5. annotate the route with `@ZodResponse(...)`

Do not:

- use raw primitive controller params for validated external input
- duplicate the same contract in class-validator DTOs
- document request/response separately from the Zod schemas

## Current example route

Reference route:

- `POST /tenants/:tenantId/greetings?style=upper`

Contracts:

- params: `tenantId`
- query: `style`
- body: `name`, optional `message`
- response: `tenantId`, `style`, `greeting`

## Invariants

- request validation uses Zod-backed DTOs
- response validation uses `@ZodResponse`
- Swagger/OpenAPI is generated from the same schemas
- controller contracts are not duplicated in a second validation system
