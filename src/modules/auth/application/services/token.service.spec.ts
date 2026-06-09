import type { AuthConfig } from '../../../../config/auth/auth.config';
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

  it('generates high-entropy opaque refresh tokens', () => {
    const service = new TokenService(authSettings);

    const firstToken = service.generateOpaqueRefreshToken();
    const secondToken = service.generateOpaqueRefreshToken();

    expect(firstToken).not.toBe(secondToken);
    expect(firstToken).toHaveLength(64);
    expect(secondToken).toHaveLength(64);
  });
});
