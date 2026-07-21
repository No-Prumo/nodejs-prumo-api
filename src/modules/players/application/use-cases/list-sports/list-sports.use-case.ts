import { Injectable } from '@nestjs/common';
import {
  playerLevelCatalog,
  playerLevels,
} from '../../../domain/player-level/player-level.constants';
import { mvpSportsCatalog } from '../../../domain/sport-code/sport-code.constants';

@Injectable()
class ListSportsUseCase {
  execute() {
    return {
      sports: mvpSportsCatalog.map((sport) => ({
        ...sport,
        availableLevels: [...playerLevels],
      })),
      levels: playerLevelCatalog.map((level) => ({ ...level })),
    };
  }
}

export { ListSportsUseCase };
