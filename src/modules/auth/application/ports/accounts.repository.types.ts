import type { AccountStatus } from '../../domain/account-status';

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

export type { AccountRecord, CreateAccountData };
