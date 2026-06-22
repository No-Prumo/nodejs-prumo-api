import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  AuthAccountResponseSchema,
  AuthSessionResponseSchema,
} from '../shared/auth-session-response.schemas';

const GetCurrentAuthSessionResponseSchema = z
  .object({
    account: AuthAccountResponseSchema,
    session: AuthSessionResponseSchema,
  })
  .meta({ id: 'GetCurrentAuthSessionResponse' });

class GetCurrentAuthSessionResponseDto extends createZodDto(
  GetCurrentAuthSessionResponseSchema,
) {}

export {
  GetCurrentAuthSessionResponseDto,
  GetCurrentAuthSessionResponseSchema,
};
