import type {
  AccountRecord,
  AccountsRepository,
  CreateAccountData,
} from '../../../application/ports/accounts.repository';

class InMemoryAccountsRepository implements AccountsRepository {
  readonly accounts: AccountRecord[] = [];

  create(data: CreateAccountData): Promise<AccountRecord> {
    const now = new Date();
    const account: AccountRecord = {
      id: crypto.randomUUID(),
      email: data.email,
      normalizedEmail: data.normalizedEmail,
      displayName: data.displayName ?? null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.accounts.push(account);

    return Promise.resolve(account);
  }

  findById(id: string): Promise<AccountRecord | null> {
    return Promise.resolve(
      this.accounts.find((account) => account.id === id) ?? null,
    );
  }

  findByNormalizedEmail(
    normalizedEmail: string,
  ): Promise<AccountRecord | null> {
    return Promise.resolve(
      this.accounts.find(
        (account) => account.normalizedEmail === normalizedEmail,
      ) ?? null,
    );
  }
}

export { InMemoryAccountsRepository };
