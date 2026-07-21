import type {
  AccountRecord,
  CreateAccountData,
} from './accounts.repository.types';

const ACCOUNTS_REPOSITORY = Symbol('ACCOUNTS_REPOSITORY');

type AccountsRepository = {
  create(data: CreateAccountData): Promise<AccountRecord>;
  findById(id: string): Promise<AccountRecord | null>;
  findByNormalizedEmail(normalizedEmail: string): Promise<AccountRecord | null>;
  resolveOrCreateByEmail(data: CreateAccountData): Promise<AccountRecord>;
};

export { ACCOUNTS_REPOSITORY };
export type { AccountsRepository };
