import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '../../../../../shared/errors/app-error';
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
import {
  CreateAuthSessionUseCase,
  type CreateAuthSessionUseCaseResponse,
} from '../create-auth-session/create-auth-session.use-case';

type GoogleSignInUseCaseRequest = {
  credential: string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

type GoogleSignInUseCaseResponse = {
  account: CreateAuthSessionUseCaseResponse['account'];
  session: CreateAuthSessionUseCaseResponse['session'];
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenIdleExpiresAt: Date;
  refreshTokenAbsoluteExpiresAt: Date;
};

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
      throw invalidGoogleCredential('unverified_email');
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
        provider: 'google',
        providerSubject: googleIdentity.subject,
      });

    if (existingIdentity) {
      const account = await this.accountsRepository.findById(
        existingIdentity.accountId,
      );

      if (!account) {
        throw new AppError('resource_not_found', 'Account was not found', {
          details: { accountId: existingIdentity.accountId },
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
      provider: 'google',
      providerSubject: googleIdentity.subject,
    });

    return account;
  }

  private async linkGoogleIdentity(
    account: AccountRecord,
    providerSubject: string,
  ) {
    if (account.status !== 'active') {
      throw new AppError('forbidden', 'Account cannot create auth sessions', {
        details: { accountId: account.id, status: account.status },
      });
    }

    const existingAccountIdentity =
      await this.externalIdentitiesRepository.findByAccountAndProvider({
        accountId: account.id,
        provider: 'google',
      });

    if (existingAccountIdentity) {
      if (existingAccountIdentity.providerSubject === providerSubject) {
        return;
      }

      throw new AppError(
        'conflict',
        'Account is already linked to an external identity',
        {
          details: {
            accountId: account.id,
            provider: 'google',
          },
        },
      );
    }

    await this.externalIdentitiesRepository.create({
      accountId: account.id,
      provider: 'google',
      providerSubject,
    });
  }
}

function invalidGoogleCredential(reason: string): AppError {
  return new AppError('unauthorized', 'Invalid authentication credentials', {
    details: { reason },
  });
}

export { GoogleSignInUseCase };
export type { GoogleSignInUseCaseRequest, GoogleSignInUseCaseResponse };
