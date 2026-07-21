import type {
  AccountProviderLookup,
  CreateExternalIdentityData,
  ExternalIdentityRecord,
  ProviderSubjectLookup,
} from './external-identities.repository.types';

const EXTERNAL_IDENTITIES_REPOSITORY = Symbol('EXTERNAL_IDENTITIES_REPOSITORY');

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
export type { ExternalIdentitiesRepository };
