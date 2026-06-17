import { buildTestAuthConfig } from '@test-support/auth/build-test-auth-config';
import { nowAsUnixSeconds } from '@shared/time/time.helpers';
import { GoogleIdTokenVerifierGateway } from './google-id-token-verifier.gateway';
import type { GoogleOAuthClient } from './google-id-token-verifier.gateway.types';

const googleClientId = 'google-web-client-id.apps.googleusercontent.com';
const validGoogleTokenTtlSeconds = 900;
const expiredGoogleTokenOffsetSeconds = 1;

const authSettings = buildTestAuthConfig({
  AUTH_GOOGLE_CLIENT_ID: googleClientId,
});

const validPayload = {
  iss: 'https://accounts.google.com',
  aud: googleClientId,
  exp: nowAsUnixSeconds() + validGoogleTokenTtlSeconds,
  sub: 'google-sub-123',
  email: 'player@example.com',
  email_verified: true,
  name: 'Player Name',
};

describe('GoogleIdTokenVerifierGateway', () => {
  function makeSut(payload = validPayload) {
    const verifyIdToken = vi
      .fn<GoogleOAuthClient['verifyIdToken']>()
      .mockResolvedValue({
        getPayload: () => payload,
      });
    const oauthClient: GoogleOAuthClient = {
      verifyIdToken,
    };
    const gateway = new GoogleIdTokenVerifierGateway(authSettings, oauthClient);

    return {
      gateway,
      oauthClient,
      verifyIdToken,
    };
  }

  it('verifies the ID token with the configured audience and maps the Google subject', async () => {
    const { gateway, verifyIdToken } = makeSut();

    const result = await gateway.verify({ idToken: 'google-id-token' });

    expect(verifyIdToken).toHaveBeenCalledWith({
      audience: googleClientId,
      idToken: 'google-id-token',
    });
    expect(result).toEqual({
      subject: 'google-sub-123',
      email: 'player@example.com',
      emailVerified: true,
      displayName: 'Player Name',
    });
  });

  it('returns unauthorized when Google token verification fails', async () => {
    const { gateway, verifyIdToken } = makeSut();
    verifyIdToken.mockRejectedValue(new Error('invalid signature'));

    await expect(
      gateway.verify({ idToken: 'invalid-google-id-token' }),
    ).rejects.toMatchObject({
      code: 'invalid_google_credential',
      message: 'Invalid authentication credentials',
    });
  });

  it.each([
    ['issuer', { iss: 'https://issuer.example.com' }],
    ['audience', { aud: 'another-client-id' }],
    [
      'expiration',
      { exp: nowAsUnixSeconds() - expiredGoogleTokenOffsetSeconds },
    ],
    ['subject', { sub: '' }],
    ['verified email', { email_verified: false }],
  ])('rejects tokens with invalid %s', async (_label, override) => {
    const { gateway } = makeSut({
      ...validPayload,
      ...override,
    });

    await expect(
      gateway.verify({ idToken: 'invalid-google-id-token' }),
    ).rejects.toMatchObject({
      code: 'invalid_google_credential',
      message: 'Invalid authentication credentials',
    });
  });
});
