import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().email();

const RequestMagicLinkBodySchema = z
  .object({
    email: emailSchema,
  })
  .meta({ id: 'RequestMagicLinkBody' });

class RequestMagicLinkBodyDto extends createZodDto(
  RequestMagicLinkBodySchema,
) {}

const RequestMagicLinkResponseSchema = z
  .object({
    status: z.literal('accepted'),
  })
  .meta({ id: 'RequestMagicLinkResponse' });

class RequestMagicLinkResponseDto extends createZodDto(
  RequestMagicLinkResponseSchema,
) {}

type RequestMagicLinkBody = z.infer<typeof RequestMagicLinkBodySchema>;

export {
  RequestMagicLinkBodyDto,
  RequestMagicLinkBodySchema,
  RequestMagicLinkResponseDto,
  RequestMagicLinkResponseSchema,
};
export type { RequestMagicLinkBody };
