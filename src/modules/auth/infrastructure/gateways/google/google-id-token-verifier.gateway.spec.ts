import { buildAuthConfig, validateEnv } from '../../../../../config';
import {
  GoogleIdTokenVerifierGateway,
  type GoogleOAuthClient,
} from './google-id-token-verifier.gateway';

const googleClientId = 'google-web-client-id.apps.googleusercontent.com';

const authSettings = buildAuthConfig(
  validateEnv({
    AUTH_GOOGLE_CLIENT_ID: googleClientId,
    DATABASE_URL: 'postgresql://postgres:sandicts@localhost:5432/sandicts',
    POSTGRES_DB: 'sandicts',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PASSWORD: 'sandicts',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'postgres',
  }),
);

const validPayload = {
  iss: 'https://accounts.google.com',
  aud: googleClientId,
  exp: Math.floor(Date.now() / 1000) + 900,
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
      code: 'unauthorized',
      message: 'Invalid authentication credentials',
    });
  });

  it.each([
    ['issuer', { iss: 'https://issuer.example.com' }],
    ['audience', { aud: 'another-client-id' }],
    ['expiration', { exp: Math.floor(Date.now() / 1000) - 1 }],
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
      code: 'unauthorized',
      message: 'Invalid authentication credentials',
    });
  });
});
