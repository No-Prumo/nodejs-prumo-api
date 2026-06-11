import type { AuthProvider } from '../../domain/auth-provider';

const EXTERNAL_IDENTITIES_REPOSITORY = Symbol('EXTERNAL_IDENTITIES_REPOSITORY');

type ExternalIdentityRecord = {
  id: string;
  accountId: string;
  provider: AuthProvider;
  providerSubject: string;
  createdAt: Date;
};

type ProviderSubjectLookup = {
  provider: AuthProvider;
  providerSubject: string;
};

type AccountProviderLookup = {
  accountId: string;
  provider: AuthProvider;
};

type CreateExternalIdentityData = {
  accountId: string;
  provider: AuthProvider;
  providerSubject: string;
};

type ExternalIdentitiesRepository = {
  create(data: CreateExternalIdentityData): Promise<ExternalIdentityRecord>;
  findByAccountAndProvider(
    lookup: AccountProviderLookup,
  ): Promise<ExternalIdentityRecord | null>;
  findByProviderAndSubject(
    lookup: ProviderSubjectLookup,
  ): Promise<ExternalIdentityRecord | null>;
};

export { EXTERNAL_IDENTITIES_REPOSITORY };
export type {
  AccountProviderLookup,
  CreateExternalIdentityData,
  ExternalIdentitiesRepository,
  ExternalIdentityRecord,
  ProviderSubjectLookup,
};
