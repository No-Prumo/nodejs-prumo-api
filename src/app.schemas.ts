import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AppStatusSchema = z
  .object({
    message: z.string(),
  })
  .meta({ id: 'AppStatus' });

export class AppStatusDto extends createZodDto(AppStatusSchema) {}

export const GreetingTenantParamsSchema = z
  .object({
    tenantId: z.string().trim().min(2).max(50),
  })
  .meta({ id: 'GreetingTenantParams' });

export class GreetingTenantParamsDto extends createZodDto(
  GreetingTenantParamsSchema,
) {}

export const GreetingQuerySchema = z
  .object({
    style: z.enum(['normal', 'upper']).default('normal'),
  })
  .meta({ id: 'GreetingQuery' });

export class GreetingQueryDto extends createZodDto(GreetingQuerySchema) {}

export const CreateGreetingBodySchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    message: z.string().trim().min(3).max(160).optional(),
  })
  .meta({ id: 'CreateGreetingBody' });

export class CreateGreetingBodyDto extends createZodDto(
  CreateGreetingBodySchema,
) {}

export const GreetingResponseSchema = z
  .object({
    tenantId: z.string(),
    style: z.enum(['normal', 'upper']),
    greeting: z.string(),
  })
  .meta({ id: 'GreetingResponse' });

export class GreetingResponseDto extends createZodDto(GreetingResponseSchema) {}

export type GreetingQuery = z.infer<typeof GreetingQuerySchema>;
export type GreetingBody = z.infer<typeof CreateGreetingBodySchema>;
export type GreetingParams = z.infer<typeof GreetingTenantParamsSchema>;
