import type { AuthConfig } from '../../../../config/auth/auth.config';

type RefreshTokenCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  expires?: Date;
  maxAge?: number;
};

function buildRefreshTokenCookieOptions(
  authSettings: AuthConfig,
  expiresAt: Date,
): RefreshTokenCookieOptions {
  return {
    httpOnly: authSettings.refreshTokenCookie.httpOnly,
    secure: authSettings.refreshTokenCookie.secure,
    sameSite: authSettings.refreshTokenCookie.sameSite,
    path: authSettings.refreshTokenCookie.path,
    expires: expiresAt,
  };
}

function buildClearRefreshTokenCookieOptions(
  authSettings: AuthConfig,
): RefreshTokenCookieOptions {
  return {
    httpOnly: authSettings.refreshTokenCookie.httpOnly,
    secure: authSettings.refreshTokenCookie.secure,
    sameSite: authSettings.refreshTokenCookie.sameSite,
    path: authSettings.refreshTokenCookie.path,
    maxAge: 0,
  };
}

export { buildClearRefreshTokenCookieOptions, buildRefreshTokenCookieOptions };
export type { RefreshTokenCookieOptions };
