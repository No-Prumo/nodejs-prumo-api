import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { PLAYER_PROFILES_REPOSITORY } from './application/ports/player-profiles.repository';
import { CreateCurrentPlayerProfileUseCase } from './application/use-cases/create-current-player-profile/create-current-player-profile.use-case';
import { GetCurrentPlayerProfileUseCase } from './application/use-cases/get-current-player-profile/get-current-player-profile.use-case';
import { ListSportsUseCase } from './application/use-cases/list-sports/list-sports.use-case';
import { UpdateCurrentPlayerProfileUseCase } from './application/use-cases/update-current-player-profile/update-current-player-profile.use-case';
import { PrismaPlayerProfilesRepository } from './infrastructure/persistence/prisma/prisma-player-profiles.repository';
import { CreateCurrentPlayerProfileController } from './presentation/http/create-current-player-profile/create-current-player-profile.controller';
import { GetCurrentPlayerProfileController } from './presentation/http/get-current-player-profile/get-current-player-profile.controller';
import { ListSportsController } from './presentation/http/list-sports/list-sports.controller';
import { UpdateCurrentPlayerProfileController } from './presentation/http/update-current-player-profile/update-current-player-profile.controller';

@Module({
  imports: [AuthModule],
  controllers: [
    ListSportsController,
    GetCurrentPlayerProfileController,
    CreateCurrentPlayerProfileController,
    UpdateCurrentPlayerProfileController,
  ],
  providers: [
    ListSportsUseCase,
    GetCurrentPlayerProfileUseCase,
    CreateCurrentPlayerProfileUseCase,
    UpdateCurrentPlayerProfileUseCase,
    {
      provide: PLAYER_PROFILES_REPOSITORY,
      useClass: PrismaPlayerProfilesRepository,
    },
  ],
})
class PlayersModule {}

export { PlayersModule };
