import { InMemoryPlayerProfilesRepository } from '../../../infrastructure/persistence/in-memory/in-memory-player-profiles.repository';
import { UpdateCurrentPlayerProfileUseCase } from './update-current-player-profile.use-case';

const accountId = 'account-id';

describe('UpdateCurrentPlayerProfileUseCase', () => {
  function makeSut() {
    const getCurrentAuthSession = {
      execute: vi.fn().mockResolvedValue({
        account: {
          id: accountId,
          email: 'player@example.com',
          displayName: 'Player Name',
        },
        session: {
          id: 'session-id',
        },
      }),
    };
    const playerProfilesRepository = new InMemoryPlayerProfilesRepository();
    const useCase = new UpdateCurrentPlayerProfileUseCase(
      getCurrentAuthSession as never,
      playerProfilesRepository,
    );

    return {
      playerProfilesRepository,
      useCase,
    };
  }

  it('rejects updates before a current player profile exists', async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({
        accessToken: 'access-token',
        displayName: 'Updated Player',
      }),
    ).rejects.toMatchObject({
      code: 'resource_not_found',
    });
  });

  it('updates the single MVP main sport and completion state', async () => {
    const { playerProfilesRepository, useCase } = makeSut();
    await playerProfilesRepository.create({
      accountId,
      displayName: 'Player Name',
      mainSportCode: 'futevolei',
      mainSportLevel: 'beginner',
    });

    const result = await useCase.execute({
      accessToken: 'access-token',
      displayName: 'Updated Player',
      mainSportCode: 'beach_volleyball',
      mainSportLevel: 'advanced',
    });

    expect(result.profile).toMatchObject({
      accountId,
      displayName: 'Updated Player',
      mainSportCode: 'beach_volleyball',
      mainSportLevel: 'advanced',
    });
    expect(result.completion).toEqual({
      state: 'complete',
      isComplete: true,
      missingFields: [],
    });
  });
});
