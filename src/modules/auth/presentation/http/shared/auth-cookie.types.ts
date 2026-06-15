type RefreshTokenCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  expires?: Date;
  maxAge?: number;
};

export type { RefreshTokenCookieOptions };
