import { ConfigType, registerAs } from '@nestjs/config';
import type { Env } from '../env/env.schema';
import { getEnv } from '../env/env.schema';
import { resolveAppEnvironment } from '../app/app-environment';

const localAccessTokenSecret =
  'local-development-auth-secret-change-before-production';

function buildAuthConfig(env: Env) {
  const environment = resolveAppEnvironment(env);
  const secureEnvironment =
    environment === 'staging' || environment === 'production';

  return {
    accessTokenSecret: env.AUTH_ACCESS_TOKEN_SECRET ?? localAccessTokenSecret,
    accessTokenTtlSeconds: env.AUTH_ACCESS_TOKEN_TTL_SECONDS,
    google: {
      clientId: env.AUTH_GOOGLE_CLIENT_ID ?? null,
    },
    magicLinkTtlSeconds: env.AUTH_MAGIC_LINK_TTL_SECONDS,
    refreshTokenIdleTtlSeconds: env.AUTH_REFRESH_TOKEN_IDLE_TTL_SECONDS,
    refreshTokenAbsoluteTtlSeconds: env.AUTH_REFRESH_TOKEN_ABSOLUTE_TTL_SECONDS,
    refreshTokenCookie: {
      name: env.AUTH_REFRESH_TOKEN_COOKIE_NAME,
      path: env.AUTH_REFRESH_TOKEN_COOKIE_PATH,
      sameSite: env.AUTH_COOKIE_SAME_SITE,
      secure: env.AUTH_COOKIE_SECURE ?? secureEnvironment,
      httpOnly: true,
    },
  };
}

const authConfig = registerAs('auth', () => buildAuthConfig(getEnv()));

type AuthConfig = ConfigType<typeof authConfig>;

export { authConfig, buildAuthConfig };
export type { AuthConfig };
