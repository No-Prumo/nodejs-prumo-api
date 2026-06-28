import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { errorCodes } from '@shared/errors/error-codes';

const ApiValidationIssueSchema = z
  .object({
    path: z.array(z.union([z.string(), z.number()])),
    message: z.string(),
  })
  .meta({ id: 'ApiValidationIssue' });

const ApiErrorResponseSchema = z
  .object({
    statusCode: z.number().int(),
    code: z.enum(errorCodes),
    message: z.string(),
    path: z.string(),
    timestamp: z.iso.datetime(),
    requestId: z.string(),
    issues: z.array(ApiValidationIssueSchema).optional(),
  })
  .meta({ id: 'ApiErrorResponse' });

class ApiErrorResponse extends createZodDto(ApiErrorResponseSchema) {}

export { ApiErrorResponse, ApiErrorResponseSchema, ApiValidationIssueSchema };
