import { InMemoryPlayerProfilesRepository } from '../../../infrastructure/persistence/in-memory/in-memory-player-profiles.repository';
import { CreateCurrentPlayerProfileUseCase } from './create-current-player-profile.use-case';

const accountId = 'account-id';

describe('CreateCurrentPlayerProfileUseCase', () => {
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
    const useCase = new CreateCurrentPlayerProfileUseCase(
      getCurrentAuthSession as never,
      playerProfilesRepository,
    );

    return {
      playerProfilesRepository,
      useCase,
    };
  }

  it('creates a complete MVP player profile with exactly one main sport', async () => {
    const { playerProfilesRepository, useCase } = makeSut();

    const result = await useCase.execute({
      accessToken: 'access-token',
      displayName: 'Player Name',
      mainSportCode: 'beach_tennis',
      mainSportLevel: 'beginner',
    });

    expect(result.profile).toMatchObject({
      accountId,
      displayName: 'Player Name',
      mainSportCode: 'beach_tennis',
      mainSportLevel: 'beginner',
    });
    expect(result.completion).toEqual({
      state: 'complete',
      isComplete: true,
      missingFields: [],
    });
    await expect(
      playerProfilesRepository.findByAccountId(accountId),
    ).resolves.toMatchObject({
      mainSportCode: 'beach_tennis',
      mainSportLevel: 'beginner',
    });
  });

  it('rejects creating a second current player profile for the same account', async () => {
    const { useCase } = makeSut();
    const request = {
      accessToken: 'access-token',
      displayName: 'Player Name',
      mainSportCode: 'futevolei',
      mainSportLevel: 'advanced',
    } as const;

    await useCase.execute(request);

    await expect(useCase.execute(request)).rejects.toMatchObject({
      code: 'conflict',
    });
  });
});
