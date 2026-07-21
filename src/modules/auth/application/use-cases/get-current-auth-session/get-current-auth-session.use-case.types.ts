import type { AccountRecord } from '../../ports/accounts.repository.types';

type GetCurrentAuthSessionUseCaseRequest = {
  accessToken: string;
};

type GetCurrentAuthSessionUseCaseResponse = {
  account: CurrentAuthAccount;
  session: CurrentAuthSession;
};

type CurrentAuthAccount = Pick<AccountRecord, 'displayName' | 'email' | 'id'>;

type CurrentAuthSession = {
  id: string;
};

export type {
  CurrentAuthAccount,
  CurrentAuthSession,
  GetCurrentAuthSessionUseCaseRequest,
  GetCurrentAuthSessionUseCaseResponse,
};
