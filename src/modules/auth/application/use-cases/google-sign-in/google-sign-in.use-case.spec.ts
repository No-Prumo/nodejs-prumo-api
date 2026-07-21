import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import { invalidGoogleCredential } from '@auth/application/errors/auth-errors';
import { authProviderCodes } from '@auth/domain/auth-provider';
import { InMemoryAccountsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-accounts.repository';
import { InMemoryAuthSessionsRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-auth-sessions.repository';
import { InMemoryExternalIdentitiesRepository } from '@auth/infrastructure/persistence/in-memory/in-memory-external-identities.repository';
import { buildTestAuthConfig } from '@test-support/auth/build-test-auth-config';
import type { GoogleIdTokenVerifier } from '../../ports/google-id-token-verifier';
import type { VerifiedGoogleIdentity } from '../../ports/google-id-token-verifier.types';
import { RefreshTokenHasher } from '../../services/tokens/refresh-token-hasher';
import { TokenService } from '../../services/tokens/token.service';
import { CreateAuthSessionUseCase } from '../create-auth-session/create-auth-session.use-case';
import { GoogleSignInUseCase } from './google-sign-in.use-case';

const authSettings = buildTestAuthConfig({
  AUTH_GOOGLE_CLIENT_ID: 'google-web-client-id.apps.googleusercontent.com',
});

const verifiedGoogleIdentity: VerifiedGoogleIdentity = {
  subject: 'google-sub-123',
  email: 'Player@Example.com',
  emailVerified: true,
  displayName: 'Player Name',
};

describe('GoogleSignInUseCase', () => {
  function makeSut(
    googleIdentity: VerifiedGoogleIdentity = verifiedGoogleIdentity,
  ) {
    const verifyGoogleIdToken = vi
      .fn<GoogleIdTokenVerifier['verify']>()
      .mockResolvedValue(googleIdentity);
    const googleIdTokenVerifier: GoogleIdTokenVerifier = {
      verify: verifyGoogleIdToken,
    };
    const accountsRepository = new InMemoryAccountsRepository();
    const authSessionsRepository = new InMemoryAuthSessionsRepository();
    const externalIdentitiesRepository =
      new InMemoryExternalIdentitiesRepository();
    const createAuthSession = new CreateAuthSessionUseCase(
      accountsRepository,
      authSessionsRepository,
      new RefreshTokenHasher(),
      new TokenService(authSettings),
      authSettings,
    );
    const useCase = new GoogleSignInUseCase(
      googleIdTokenVerifier,
      externalIdentitiesRepository,
      accountsRepository,
      createAuthSession,
    );

    return {
      accountsRepository,
      authSessionsRepository,
      externalIdentitiesRepository,
      googleIdTokenVerifier,
      useCase,
      verifyGoogleIdToken,
    };
  }

  it('rejects invalid Google tokens without creating local state', async () => {
    const {
      accountsRepository,
      authSessionsRepository,
      useCase,
      verifyGoogleIdToken,
    } = makeSut();
    verifyGoogleIdToken.mockRejectedValue(
      invalidGoogleCredential({
        action: 'verify_google_id_token',
        reason: authErrorReasons.verificationFailed,
      }),
    );

    await expect(
      useCase.execute({ credential: 'invalid-google-token' }),
    ).rejects.toMatchObject({
      code: 'invalid_google_credential',
    });
    expect(accountsRepository.accounts).toHaveLength(0);
    expect(authSessionsRepository.authSessions).toHaveLength(0);
  });

  it('rejects Google identities without a verified email', async () => {
    const { authSessionsRepository, externalIdentitiesRepository, useCase } =
      makeSut({
        ...verifiedGoogleIdentity,
        emailVerified: false,
      });

    await expect(
      useCase.execute({ credential: 'unverified-email-token' }),
    ).rejects.toMatchObject({
      code: 'invalid_google_credential',
    });
    expect(externalIdentitiesRepository.externalIdentities).toHaveLength(0);
    expect(authSessionsRepository.authSessions).toHaveLength(0);
  });

  it('signs in the account linked to an existing Google provider subject', async () => {
    const {
      accountsRepository,
      authSessionsRepository,
      externalIdentitiesRepository,
      useCase,
    } = makeSut({
      ...verifiedGoogleIdentity,
      email: 'changed-email@example.com',
    });
    const linkedAccount = await accountsRepository.create({
      email: 'original@example.com',
      normalizedEmail: 'original@example.com',
      displayName: 'Original Player',
    });
    await externalIdentitiesRepository.create({
      accountId: linkedAccount.id,
      provider: authProviderCodes.google,
      providerSubject: verifiedGoogleIdentity.subject,
    });

    const result = await useCase.execute({
      credential: 'valid-google-token',
      ipAddress: '127.0.0.1',
      userAgent: 'Vitest',
    });

    expect(accountsRepository.accounts).toHaveLength(1);
    expect(externalIdentitiesRepository.externalIdentities).toHaveLength(1);
    expect(result.account.id).toBe(linkedAccount.id);
    expect(authSessionsRepository.authSessions).toHaveLength(1);
    expect(authSessionsRepository.authSessions[0]).toMatchObject({
      accountId: linkedAccount.id,
      creationSource: 'google',
      ipAddress: '127.0.0.1',
      userAgent: 'Vitest',
    });
  });

  it('creates an account, stores Google sub, and creates a session for a new verified identity', async () => {
    const {
      accountsRepository,
      authSessionsRepository,
      externalIdentitiesRepository,
      useCase,
    } = makeSut();

    const result = await useCase.execute({ credential: 'valid-google-token' });

    expect(accountsRepository.accounts).toHaveLength(1);
    expect(accountsRepository.accounts[0]).toMatchObject({
      email: verifiedGoogleIdentity.email,
      normalizedEmail: 'player@example.com',
      displayName: verifiedGoogleIdentity.displayName,
    });
    expect(externalIdentitiesRepository.externalIdentities).toHaveLength(1);
    expect(externalIdentitiesRepository.externalIdentities[0]).toMatchObject({
      accountId: result.account.id,
      provider: authProviderCodes.google,
      providerSubject: verifiedGoogleIdentity.subject,
    });
    expect(authSessionsRepository.authSessions).toHaveLength(1);
    expect(authSessionsRepository.authSessions[0]?.creationSource).toBe(
      'google',
    );
    expect(result.accessToken).toContain('.');
    expect(result.refreshToken).toBeDefined();
  });

  it('links a verified Google identity to an existing account with the same verified email', async () => {
    const {
      accountsRepository,
      authSessionsRepository,
      externalIdentitiesRepository,
      useCase,
    } = makeSut();
    const existingAccount = await accountsRepository.create({
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      displayName: null,
    });

    const result = await useCase.execute({ credential: 'valid-google-token' });

    expect(accountsRepository.accounts).toHaveLength(1);
    expect(result.account.id).toBe(existingAccount.id);
    expect(externalIdentitiesRepository.externalIdentities).toHaveLength(1);
    expect(externalIdentitiesRepository.externalIdentities[0]).toMatchObject({
      accountId: existingAccount.id,
      providerSubject: verifiedGoogleIdentity.subject,
    });
    expect(authSessionsRepository.authSessions).toHaveLength(1);
  });

  it('rejects account linking when the account already has another Google identity', async () => {
    const {
      accountsRepository,
      authSessionsRepository,
      externalIdentitiesRepository,
      useCase,
    } = makeSut();
    const existingAccount = await accountsRepository.create({
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      displayName: null,
    });
    await externalIdentitiesRepository.create({
      accountId: existingAccount.id,
      provider: authProviderCodes.google,
      providerSubject: 'other-google-sub',
    });

    await expect(
      useCase.execute({ credential: 'valid-google-token' }),
    ).rejects.toMatchObject({
      code: 'external_identity_conflict',
    });
    expect(externalIdentitiesRepository.externalIdentities).toHaveLength(1);
    expect(authSessionsRepository.authSessions).toHaveLength(0);
  });
});
