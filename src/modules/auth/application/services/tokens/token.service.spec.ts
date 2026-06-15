import type { AuthConfig } from '../../../../../config';
import { TokenService } from './token.service';

const authSettings = {
  accessTokenSecret: 'test-access-token-secret-with-enough-length',
  accessTokenTtlSeconds: 900,
  refreshTokenIdleTtlSeconds: 60 * 60 * 24 * 14,
  refreshTokenAbsoluteTtlSeconds: 60 * 60 * 24 * 30,
  refreshTokenCookie: {
    name: 'sandicts_refresh_token',
    path: '/auth/refresh',
    sameSite: 'lax',
    secure: false,
    httpOnly: true,
  },
} satisfies AuthConfig;

function decodeJwtPart<T>(value: string): T {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
}

describe('TokenService', () => {
  it('issues short-lived access tokens with stable auth claims', () => {
    const service = new TokenService(authSettings);

    const issuedToken = service.issueAccessToken({
      sub: 'account-id',
      sessionId: 'session-id',
    });
    const [encodedHeader, encodedPayload, encodedSignature] =
      issuedToken.token.split('.');

    expect(encodedHeader).toBeDefined();
    expect(encodedPayload).toBeDefined();
    expect(encodedSignature).toBeDefined();
    expect(decodeJwtPart<{ alg: string; typ: string }>(encodedHeader)).toEqual({
      alg: 'HS256',
      typ: 'JWT',
    });
    expect(
      decodeJwtPart<{ sub: string; sessionId: string }>(encodedPayload),
    ).toMatchObject({
      sub: 'account-id',
      sessionId: 'session-id',
    });
  });

  it('verifies access tokens signed by the service', () => {
    const service = new TokenService(authSettings);

    const issuedToken = service.issueAccessToken({
      sub: 'account-id',
      sessionId: 'session-id',
    });

    expect(service.verifyAccessToken(issuedToken.token)).toMatchObject({
      sub: 'account-id',
      sessionId: 'session-id',
    });
  });

  it('rejects tampered access tokens', () => {
    const service = new TokenService(authSettings);
    const issuedToken = service.issueAccessToken({
      sub: 'account-id',
      sessionId: 'session-id',
    });
    const [encodedHeader, encodedPayload, encodedSignature] =
      issuedToken.token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        sub: 'another-account-id',
        sessionId: 'session-id',
        iat: 1,
        exp: 9999999999,
      }),
    ).toString('base64url');

    expect(
      service.verifyAccessToken(
        `${encodedHeader}.${tamperedPayload}.${encodedSignature}`,
      ),
    ).toBeNull();
    expect(service.verifyAccessToken('not-a-jwt')).toBeNull();
    expect(
      service.verifyAccessToken(`${encodedHeader}.${encodedPayload}`),
    ).toBeNull();
  });

  it('rejects expired access tokens', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const service = new TokenService({
      ...authSettings,
      accessTokenTtlSeconds: 1,
    });
    const issuedToken = service.issueAccessToken({
      sub: 'account-id',
      sessionId: 'session-id',
    });

    vi.setSystemTime(new Date('2026-01-01T00:00:02.000Z'));

    expect(service.verifyAccessToken(issuedToken.token)).toBeNull();

    vi.useRealTimers();
  });

  it('generates high-entropy opaque refresh tokens', () => {
    const service = new TokenService(authSettings);

    const firstToken = service.generateOpaqueRefreshToken();
    const secondToken = service.generateOpaqueRefreshToken();

    expect(firstToken).not.toBe(secondToken);
    expect(firstToken).toHaveLength(64);
    expect(secondToken).toHaveLength(64);
  });
});
