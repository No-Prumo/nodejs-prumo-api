import type { AuthConfig } from '@config';
import type { RefreshTokenCookieOptions } from './auth-cookie.types';

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

function readCookieValue(
  cookieHeader: string | undefined,
  cookieName: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');

  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.split('=');
    const name = rawName?.trim();

    if (name !== cookieName) {
      continue;
    }

    const value = rawValueParts.join('=').trim();

    if (value.length === 0) {
      return null;
    }

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}

export {
  buildClearRefreshTokenCookieOptions,
  buildRefreshTokenCookieOptions,
  readCookieValue,
};
