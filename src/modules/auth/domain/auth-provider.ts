const authProviders = ['google'] as const;
const authProviderCodes = {
  google: 'google',
} as const;

type AuthProvider = (typeof authProviders)[number];

export { authProviderCodes, authProviders };
export type { AuthProvider };
