import type { AccountStatus } from '../../domain/account-status';

const ACCOUNTS_REPOSITORY = Symbol('ACCOUNTS_REPOSITORY');

type AccountRecord = {
  id: string;
  email: string;
  normalizedEmail: string;
  displayName: string | null;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
};

type CreateAccountData = {
  email: string;
  normalizedEmail: string;
  displayName?: string | null;
};

type AccountsRepository = {
  create(data: CreateAccountData): Promise<AccountRecord>;
  findById(id: string): Promise<AccountRecord | null>;
  findByNormalizedEmail(normalizedEmail: string): Promise<AccountRecord | null>;
};

export { ACCOUNTS_REPOSITORY };
export type { AccountRecord, AccountsRepository, CreateAccountData };
