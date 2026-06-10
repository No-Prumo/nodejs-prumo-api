import { buildAuthConfig, validateEnv } from '../../../../../config';
import type { ConsumeMagicLinkUseCaseResponse } from '../../../application/use-cases/consume-magic-link/consume-magic-link.use-case';
import { ConsumeMagicLinkController } from './consume-magic-link.controller';

const authSettings = buildAuthConfig(
  validateEnv({
    DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
    POSTGRES_DB: 'sandicts',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PASSWORD: 'sandicts',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'postgres',
  }),
);

describe('ConsumeMagicLinkController', () => {
  it('sets the refresh token cookie and omits it from the consume response body', async () => {
    const consumeResponse: ConsumeMagicLinkUseCaseResponse = {
      account: {
        id: 'account-id',
        email: 'user@example.com',
        normalizedEmail: 'user@example.com',
        displayName: null,
        status: 'active',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      session: {
        id: 'session-id',
      },
      accessToken: 'access.token.signature',
      accessTokenExpiresAt: new Date('2026-01-01T00:15:00.000Z'),
      refreshToken: 'raw-refresh-token',
      refreshTokenIdleExpiresAt: new Date('2026-01-02T00:00:00.000Z'),
      refreshTokenAbsoluteExpiresAt: new Date('2026-01-31T00:00:00.000Z'),
    };
    const consumeMagicLink = {
      execute: vi
        .fn<() => Promise<ConsumeMagicLinkUseCaseResponse>>()
        .mockResolvedValue(consumeResponse),
    };
    const response = {
      cookie: vi.fn(),
    };
    const controller = new ConsumeMagicLinkController(
      consumeMagicLink as never,
      authSettings,
    );

    const result = await controller.consume(
      { token: 'magic-link-token' },
      'Vitest',
      '127.0.0.1',
      response as never,
    );

    expect(consumeMagicLink.execute).toHaveBeenCalledWith({
      token: 'magic-link-token',
      userAgent: 'Vitest',
      ipAddress: '127.0.0.1',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      authSettings.refreshTokenCookie.name,
      'raw-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        path: authSettings.refreshTokenCookie.path,
      }),
    );
    expect(result).toEqual({
      account: {
        id: 'account-id',
        email: 'user@example.com',
        displayName: null,
      },
      session: {
        id: 'session-id',
      },
      accessToken: 'access.token.signature',
      accessTokenExpiresAt: '2026-01-01T00:15:00.000Z',
    });
    expect(result).not.toHaveProperty('refreshToken');
  });
});
