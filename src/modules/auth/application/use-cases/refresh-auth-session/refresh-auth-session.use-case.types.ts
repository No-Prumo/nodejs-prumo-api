import type { AccountRecord } from '../../ports/accounts.repository';

type RefreshAuthSessionUseCaseRequest = {
  refreshToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

type RefreshAuthSessionUseCaseResponse = {
  account: AuthenticatedAccount;
  session: RefreshedAuthSession;
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenIdleExpiresAt: Date;
  refreshTokenAbsoluteExpiresAt: Date;
};

type AuthenticatedAccount = Pick<AccountRecord, 'displayName' | 'email' | 'id'>;

type RefreshedAuthSession = {
  id: string;
};

export type {
  AuthenticatedAccount,
  RefreshedAuthSession,
  RefreshAuthSessionUseCaseRequest,
  RefreshAuthSessionUseCaseResponse,
};
