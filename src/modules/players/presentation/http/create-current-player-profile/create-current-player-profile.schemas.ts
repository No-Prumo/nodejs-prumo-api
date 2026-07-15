import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  PlayerLevelSchema,
  SportCodeSchema,
} from '../shared/player-profile-response.schemas';

const playerDisplayNameSchema = z.string().trim().min(2).max(80);

const CreateCurrentPlayerProfileBodySchema = z
  .object({
    displayName: playerDisplayNameSchema,
    mainSportCode: SportCodeSchema,
    mainSportLevel: PlayerLevelSchema,
  })
  .meta({ id: 'CreateCurrentPlayerProfileBody' });

class CreateCurrentPlayerProfileBodyDto extends createZodDto(
  CreateCurrentPlayerProfileBodySchema,
) {}

type CreateCurrentPlayerProfileBody = z.infer<
  typeof CreateCurrentPlayerProfileBodySchema
>;

export {
  CreateCurrentPlayerProfileBodyDto,
  CreateCurrentPlayerProfileBodySchema,
};
export type { CreateCurrentPlayerProfileBody };
