type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type AccessTokenClaims = {
  sub: string;
  sessionId: string;
  role?: string;
  partnerId?: string;
};

type IssuedAccessToken = {
  token: string;
  expiresAt: Date;
};

type VerifiedAccessTokenClaims = AccessTokenClaims & {
  exp: number;
  iat: number;
};

export type {
  AccessTokenClaims,
  IssuedAccessToken,
  JsonPrimitive,
  JsonValue,
  VerifiedAccessTokenClaims,
};
