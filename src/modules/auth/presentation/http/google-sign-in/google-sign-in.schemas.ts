import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  AuthAccountResponseSchema,
  AuthSessionResponseSchema,
} from '../shared/auth-session-response.schemas';

const googleIdTokenSchema = z.string().trim().min(10).max(4096);

const GoogleSignInBodySchema = z
  .object({
    credential: googleIdTokenSchema.optional(),
    idToken: googleIdTokenSchema.optional(),
  })
  .superRefine((body, context) => {
    if (!body.credential && !body.idToken) {
      context.addIssue({
        code: 'custom',
        path: ['credential'],
        message: 'credential or idToken is required',
      });
    }
  })
  .meta({ id: 'GoogleSignInBody' });

class GoogleSignInBodyDto extends createZodDto(GoogleSignInBodySchema) {}

const GoogleSignInResponseSchema = z
  .object({
    account: AuthAccountResponseSchema,
    session: AuthSessionResponseSchema,
    accessToken: z.string(),
    accessTokenExpiresAt: z.iso.datetime(),
  })
  .meta({ id: 'GoogleSignInResponse' });

class GoogleSignInResponseDto extends createZodDto(
  GoogleSignInResponseSchema,
) {}

type GoogleSignInBody = z.infer<typeof GoogleSignInBodySchema>;

export {
  GoogleSignInBodyDto,
  GoogleSignInBodySchema,
  GoogleSignInResponseDto,
  GoogleSignInResponseSchema,
};
export type { GoogleSignInBody };
