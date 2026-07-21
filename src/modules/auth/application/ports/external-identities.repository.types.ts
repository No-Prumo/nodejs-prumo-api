import type { AuthProvider } from '../../domain/auth-provider';

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

export type {
  AccountProviderLookup,
  CreateExternalIdentityData,
  ExternalIdentityRecord,
  ProviderSubjectLookup,
};
