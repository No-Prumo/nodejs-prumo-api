import { Inject, Injectable } from '@nestjs/common';
import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import {
  accountAuthForbidden,
  accountNotFound,
  externalIdentityConflict,
  invalidGoogleCredential,
} from '@auth/application/errors/auth-errors';
import { authProviderCodes } from '@auth/domain/auth-provider';
import type { AccountRecord } from '../../ports/accounts.repository';
import {
  ACCOUNTS_REPOSITORY,
  type AccountsRepository,
} from '../../ports/accounts.repository';
import {
  EXTERNAL_IDENTITIES_REPOSITORY,
  type ExternalIdentitiesRepository,
} from '../../ports/external-identities.repository';
import {
  GOOGLE_ID_TOKEN_VERIFIER,
  type VerifiedGoogleIdentity,
  type GoogleIdTokenVerifier,
} from '../../ports/google-id-token-verifier';
import { normalizeEmail } from '../../services/email/normalize-email';
import { CreateAuthSessionUseCase } from '../create-auth-session/create-auth-session.use-case';
import type {
  GoogleSignInUseCaseRequest,
  GoogleSignInUseCaseResponse,
} from './google-sign-in.use-case.types';

@Injectable()
class GoogleSignInUseCase {
  constructor(
    @Inject(GOOGLE_ID_TOKEN_VERIFIER)
    private readonly googleIdTokenVerifier: GoogleIdTokenVerifier,
    @Inject(EXTERNAL_IDENTITIES_REPOSITORY)
    private readonly externalIdentitiesRepository: ExternalIdentitiesRepository,
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
    private readonly createAuthSession: CreateAuthSessionUseCase,
  ) {}

  async execute(
    request: GoogleSignInUseCaseRequest,
  ): Promise<GoogleSignInUseCaseResponse> {
    const googleIdentity = await this.googleIdTokenVerifier.verify({
      idToken: request.credential,
    });

    if (!googleIdentity.emailVerified) {
      throw invalidGoogleCredential({
        action: 'google_sign_in',
        reason: authErrorReasons.unverifiedEmail,
      });
    }

    const account = await this.resolveAccount(googleIdentity);
    const authSession = await this.createAuthSession.execute({
      accountId: account.id,
      creationSource: 'google',
      userAgent: request.userAgent,
      ipAddress: request.ipAddress,
    });

    return {
      account: authSession.account,
      session: authSession.session,
      accessToken: authSession.accessToken,
      accessTokenExpiresAt: authSession.accessTokenExpiresAt,
      refreshToken: authSession.refreshToken,
      refreshTokenIdleExpiresAt: authSession.refreshTokenIdleExpiresAt,
      refreshTokenAbsoluteExpiresAt: authSession.refreshTokenAbsoluteExpiresAt,
    };
  }

  private async resolveAccount(
    googleIdentity: VerifiedGoogleIdentity,
  ): Promise<AccountRecord> {
    const existingIdentity =
      await this.externalIdentitiesRepository.findByProviderAndSubject({
        provider: authProviderCodes.google,
        providerSubject: googleIdentity.subject,
      });

    if (existingIdentity) {
      const account = await this.accountsRepository.findById(
        existingIdentity.accountId,
      );

      if (!account) {
        throw accountNotFound({
          accountId: existingIdentity.accountId,
          action: 'google_sign_in',
          provider: authProviderCodes.google,
          reason: authErrorReasons.linkedAccountNotFound,
        });
      }

      return account;
    }

    const normalizedEmail = normalizeEmail(googleIdentity.email);
    const existingAccount =
      await this.accountsRepository.findByNormalizedEmail(normalizedEmail);

    if (existingAccount) {
      await this.linkGoogleIdentity(existingAccount, googleIdentity.subject);

      return existingAccount;
    }

    const account = await this.accountsRepository.resolveOrCreateByEmail({
      email: googleIdentity.email,
      normalizedEmail,
      displayName: googleIdentity.displayName,
    });

    await this.externalIdentitiesRepository.create({
      accountId: account.id,
      provider: authProviderCodes.google,
      providerSubject: googleIdentity.subject,
    });

    return account;
  }

  private async linkGoogleIdentity(
    account: AccountRecord,
    providerSubject: string,
  ) {
    if (account.status !== 'active') {
      throw accountAuthForbidden({
        accountId: account.id,
        action: 'google_sign_in',
        provider: authProviderCodes.google,
        reason: authErrorReasons.accountStatusNotActive,
        status: account.status,
      });
    }

    const existingAccountIdentity =
      await this.externalIdentitiesRepository.findByAccountAndProvider({
        accountId: account.id,
        provider: authProviderCodes.google,
      });

    if (existingAccountIdentity) {
      if (existingAccountIdentity.providerSubject === providerSubject) {
        return;
      }

      throw externalIdentityConflict({
        accountId: account.id,
        action: 'google_sign_in',
        provider: authProviderCodes.google,
        reason: authErrorReasons.accountProviderAlreadyLinked,
      });
    }

    await this.externalIdentitiesRepository.create({
      accountId: account.id,
      provider: authProviderCodes.google,
      providerSubject,
    });
  }
}

export { GoogleSignInUseCase };
