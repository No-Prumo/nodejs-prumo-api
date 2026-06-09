const authSessionStatuses = ['active', 'revoked'] as const;

type AuthSessionStatus = (typeof authSessionStatuses)[number];

export { authSessionStatuses };
export type { AuthSessionStatus };
