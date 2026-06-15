import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  AuthAccountResponseSchema,
  AuthSessionResponseSchema,
} from '../shared/auth-session-response.schemas';

const RefreshAuthSessionResponseSchema = z
  .object({
    account: AuthAccountResponseSchema,
    session: AuthSessionResponseSchema,
    accessToken: z.string(),
    accessTokenExpiresAt: z.iso.datetime(),
  })
  .meta({ id: 'RefreshAuthSessionResponse' });

class RefreshAuthSessionResponseDto extends createZodDto(
  RefreshAuthSessionResponseSchema,
) {}

export { RefreshAuthSessionResponseDto, RefreshAuthSessionResponseSchema };
