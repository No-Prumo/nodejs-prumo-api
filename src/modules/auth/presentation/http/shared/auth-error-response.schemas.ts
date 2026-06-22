import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { errorCodes } from '@shared/errors/error-codes';

const AuthValidationIssueSchema = z
  .object({
    path: z.array(z.union([z.string(), z.number()])),
    message: z.string(),
  })
  .meta({ id: 'AuthValidationIssue' });

const AuthErrorResponseSchema = z
  .object({
    statusCode: z.number().int(),
    code: z.enum(errorCodes),
    message: z.string(),
    path: z.string(),
    timestamp: z.iso.datetime(),
    requestId: z.string(),
  })
  .meta({ id: 'AuthErrorResponse' });

const AuthValidationErrorResponseSchema = AuthErrorResponseSchema.extend({
  statusCode: z.literal(400),
  code: z.literal('validation_error'),
  issues: z.array(AuthValidationIssueSchema).optional(),
}).meta({ id: 'AuthValidationErrorResponse' });

class AuthErrorResponseDto extends createZodDto(AuthErrorResponseSchema) {}

class AuthValidationErrorResponseDto extends createZodDto(
  AuthValidationErrorResponseSchema,
) {}

export {
  AuthErrorResponseDto,
  AuthErrorResponseSchema,
  AuthValidationErrorResponseDto,
  AuthValidationErrorResponseSchema,
};
