import { InMemoryPlayerProfilesRepository } from '../../../infrastructure/persistence/in-memory/in-memory-player-profiles.repository';
import { GetCurrentPlayerProfileUseCase } from './get-current-player-profile.use-case';

const accountId = 'account-id';

describe('GetCurrentPlayerProfileUseCase', () => {
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
    const useCase = new GetCurrentPlayerProfileUseCase(
      getCurrentAuthSession as never,
      playerProfilesRepository,
    );

    return {
      getCurrentAuthSession,
      playerProfilesRepository,
      useCase,
    };
  }

  it('returns missing completion when the authenticated account has no profile', async () => {
    const { getCurrentAuthSession, useCase } = makeSut();

    await expect(
      useCase.execute({ accessToken: 'access-token' }),
    ).resolves.toEqual({
      profile: null,
      completion: {
        state: 'missing',
        isComplete: false,
        missingFields: ['displayName', 'mainSportCode', 'mainSportLevel'],
      },
    });
    expect(getCurrentAuthSession.execute).toHaveBeenCalledWith({
      accessToken: 'access-token',
    });
  });

  it('returns complete completion for an MVP profile with one main sport', async () => {
    const { playerProfilesRepository, useCase } = makeSut();

    await playerProfilesRepository.create({
      accountId,
      displayName: 'Player Name',
      mainSportCode: 'futevolei',
      mainSportLevel: 'intermediate',
    });

    const result = await useCase.execute({ accessToken: 'access-token' });

    expect(result.profile).toMatchObject({
      accountId,
      displayName: 'Player Name',
      mainSportCode: 'futevolei',
      mainSportLevel: 'intermediate',
    });
    expect(result.completion).toEqual({
      state: 'complete',
      isComplete: true,
      missingFields: [],
    });
  });
});
