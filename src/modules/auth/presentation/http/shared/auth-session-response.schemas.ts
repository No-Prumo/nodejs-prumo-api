import { z } from 'zod';

const AuthAccountResponseSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    displayName: z.string().nullable(),
  })
  .meta({ id: 'AuthAccountResponse' });

const AuthSessionResponseSchema = z
  .object({
    id: z.string(),
  })
  .meta({ id: 'AuthSessionResponse' });

export { AuthAccountResponseSchema, AuthSessionResponseSchema };
