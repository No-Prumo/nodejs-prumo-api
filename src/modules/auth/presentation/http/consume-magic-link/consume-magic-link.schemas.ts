import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  AuthAccountResponseSchema,
  AuthSessionResponseSchema,
} from '../shared/auth-session-response.schemas';

const ConsumeMagicLinkBodySchema = z
  .object({
    token: z.string().trim().min(32).max(256),
  })
  .meta({ id: 'ConsumeMagicLinkBody' });

class ConsumeMagicLinkBodyDto extends createZodDto(
  ConsumeMagicLinkBodySchema,
) {}

const ConsumeMagicLinkResponseSchema = z
  .object({
    account: AuthAccountResponseSchema,
    session: AuthSessionResponseSchema,
    accessToken: z.string(),
    accessTokenExpiresAt: z.iso.datetime(),
  })
  .meta({ id: 'ConsumeMagicLinkResponse' });

class ConsumeMagicLinkResponseDto extends createZodDto(
  ConsumeMagicLinkResponseSchema,
) {}

type ConsumeMagicLinkBody = z.infer<typeof ConsumeMagicLinkBodySchema>;

export {
  ConsumeMagicLinkBodyDto,
  ConsumeMagicLinkBodySchema,
  ConsumeMagicLinkResponseDto,
  ConsumeMagicLinkResponseSchema,
};
export type { ConsumeMagicLinkBody };
