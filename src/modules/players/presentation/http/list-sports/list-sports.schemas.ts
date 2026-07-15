import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  PlayerLevelSchema,
  SportCodeSchema,
} from '../shared/player-profile-response.schemas';

const PlayerLevelOptionResponseSchema = z
  .object({
    code: PlayerLevelSchema,
    name: z.string(),
  })
  .meta({ id: 'PlayerLevelOptionResponse' });

const SportResponseSchema = z
  .object({
    code: SportCodeSchema,
    name: z.string(),
    availableLevels: z.array(PlayerLevelSchema),
  })
  .meta({ id: 'SportResponse' });

const ListSportsResponseSchema = z
  .object({
    sports: z.array(SportResponseSchema),
    levels: z.array(PlayerLevelOptionResponseSchema),
  })
  .meta({ id: 'ListSportsResponse' });

class ListSportsResponseDto extends createZodDto(ListSportsResponseSchema) {}

export { ListSportsResponseDto, ListSportsResponseSchema };
