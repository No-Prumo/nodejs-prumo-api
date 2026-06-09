const authSessionCreationSources = [
  'magic_link',
  'google',
  'password',
] as const;

type AuthSessionCreationSource = (typeof authSessionCreationSources)[number];

export { authSessionCreationSources };
export type { AuthSessionCreationSource };
