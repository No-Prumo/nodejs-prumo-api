import type { CreateAuthSessionUseCaseResponse } from '../create-auth-session/create-auth-session.use-case.types';

type ConsumeMagicLinkUseCaseRequest = {
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

type ConsumeMagicLinkUseCaseResponse = {
  account: CreateAuthSessionUseCaseResponse['account'];
  session: CreateAuthSessionUseCaseResponse['session'];
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenIdleExpiresAt: Date;
  refreshTokenAbsoluteExpiresAt: Date;
};

export type { ConsumeMagicLinkUseCaseRequest, ConsumeMagicLinkUseCaseResponse };
