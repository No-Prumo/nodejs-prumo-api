import type {
  AccountProviderLookup,
  CreateExternalIdentityData,
  ExternalIdentitiesRepository,
  ExternalIdentityRecord,
  ProviderSubjectLookup,
} from '../../../application/ports/external-identities.repository';

class InMemoryExternalIdentitiesRepository implements ExternalIdentitiesRepository {
  readonly externalIdentities: ExternalIdentityRecord[] = [];

  create(data: CreateExternalIdentityData): Promise<ExternalIdentityRecord> {
    const identity: ExternalIdentityRecord = {
      id: crypto.randomUUID(),
      accountId: data.accountId,
      provider: data.provider,
      providerSubject: data.providerSubject,
      createdAt: new Date(),
    };

    this.externalIdentities.push(identity);

    return Promise.resolve(identity);
  }

  findByAccountAndProvider(
    lookup: AccountProviderLookup,
  ): Promise<ExternalIdentityRecord | null> {
    return Promise.resolve(
      this.externalIdentities.find(
        (identity) =>
          identity.accountId === lookup.accountId &&
          identity.provider === lookup.provider,
      ) ?? null,
    );
  }

  findByProviderAndSubject(
    lookup: ProviderSubjectLookup,
  ): Promise<ExternalIdentityRecord | null> {
    return Promise.resolve(
      this.externalIdentities.find(
        (identity) =>
          identity.provider === lookup.provider &&
          identity.providerSubject === lookup.providerSubject,
      ) ?? null,
    );
  }
}

export { InMemoryExternalIdentitiesRepository };
