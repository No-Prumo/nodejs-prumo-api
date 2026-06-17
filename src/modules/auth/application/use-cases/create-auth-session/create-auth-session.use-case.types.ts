import type { AccountRecord } from '../../ports/accounts.repository';
import type { AuthSessionCreationSource } from '../../../domain/auth-session-creation-source';

type CreateAuthSessionUseCaseRequest = {
  accountId: string;
  creationSource: AuthSessionCreationSource;
  userAgent?: string | null;
  ipAddress?: string | null;
};

type CreateAuthSessionUseCaseResponse = {
  account: AuthenticatedAccount;
  session: CreatedAuthSession;
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenIdleExpiresAt: Date;
  refreshTokenAbsoluteExpiresAt: Date;
};

type AuthenticatedAccount = Pick<AccountRecord, 'displayName' | 'email' | 'id'>;

type CreatedAuthSession = {
  id: string;
};

export type {
  AuthenticatedAccount,
  CreatedAuthSession,
  CreateAuthSessionUseCaseRequest,
  CreateAuthSessionUseCaseResponse,
};
