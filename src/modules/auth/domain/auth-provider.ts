const authProviders = ['google'] as const;

type AuthProvider = (typeof authProviders)[number];

export { authProviders };
export type { AuthProvider };
