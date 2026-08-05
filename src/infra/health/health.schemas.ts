import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const HealthResponseSchema = z
  .object({
    status: z.enum(['ok', 'unavailable']),
  })
  .meta({ id: 'HealthResponse' });

class HealthResponseDto extends createZodDto(HealthResponseSchema) {}

export { HealthResponseDto, HealthResponseSchema };
