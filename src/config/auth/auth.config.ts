import { ConfigType, registerAs } from '@nestjs/config';
import type { Env } from '../env/env.schema';
import { getEnv } from '../env/env.schema';

const localAccessTokenSecret =
  'local-development-auth-secret-change-before-production';

function buildAuthConfig(env: Env) {
  return {
    accessTokenSecret: env.AUTH_ACCESS_TOKEN_SECRET ?? localAccessTokenSecret,
    accessTokenTtlSeconds: env.AUTH_ACCESS_TOKEN_TTL_SECONDS,
    magicLinkTtlSeconds: env.AUTH_MAGIC_LINK_TTL_SECONDS,
    refreshTokenIdleTtlSeconds: env.AUTH_REFRESH_TOKEN_IDLE_TTL_SECONDS,
    refreshTokenAbsoluteTtlSeconds: env.AUTH_REFRESH_TOKEN_ABSOLUTE_TTL_SECONDS,
    refreshTokenCookie: {
      name: env.AUTH_REFRESH_TOKEN_COOKIE_NAME,
      path: env.AUTH_REFRESH_TOKEN_COOKIE_PATH,
      sameSite: env.AUTH_COOKIE_SAME_SITE,
      secure: env.AUTH_COOKIE_SECURE ?? env.NODE_ENV === 'production',
      httpOnly: true,
    },
  };
}

const authConfig = registerAs('auth', () => buildAuthConfig(getEnv()));

type AuthConfig = ConfigType<typeof authConfig>;

export { authConfig, buildAuthConfig };
export type { AuthConfig };
