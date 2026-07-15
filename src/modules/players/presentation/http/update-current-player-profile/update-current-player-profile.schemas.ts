import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  PlayerLevelSchema,
  SportCodeSchema,
} from '../shared/player-profile-response.schemas';

const playerDisplayNameSchema = z.string().trim().min(2).max(80);

const UpdateCurrentPlayerProfileBodySchema = z
  .object({
    displayName: playerDisplayNameSchema.optional(),
    mainSportCode: SportCodeSchema.optional(),
    mainSportLevel: PlayerLevelSchema.optional(),
  })
  .refine(
    (body) =>
      body.displayName !== undefined ||
      body.mainSportCode !== undefined ||
      body.mainSportLevel !== undefined,
    {
      message: 'At least one player profile field is required',
      path: ['profile'],
    },
  )
  .meta({ id: 'UpdateCurrentPlayerProfileBody' });

class UpdateCurrentPlayerProfileBodyDto extends createZodDto(
  UpdateCurrentPlayerProfileBodySchema,
) {}

type UpdateCurrentPlayerProfileBody = z.infer<
  typeof UpdateCurrentPlayerProfileBodySchema
>;

export {
  UpdateCurrentPlayerProfileBodyDto,
  UpdateCurrentPlayerProfileBodySchema,
};
export type { UpdateCurrentPlayerProfileBody };
