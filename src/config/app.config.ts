import { ConfigType, registerAs } from '@nestjs/config';
import { resolveAppEnvironment } from './app-environment';
import type { Env } from './env.schema';
import { getEnv } from './env.schema';
import { getPackageMetadata } from './package-metadata';

const packageMetadata = getPackageMetadata();

export function buildAppConfig(env: Env) {
  const environment = resolveAppEnvironment(env);

  return {
    environment,
    nodeEnv: env.NODE_ENV,
    version: env.APP_VERSION ?? packageMetadata.version ?? '0.0.0',
    host: env.APP_HOST,
    port: env.PORT,
    globalPrefix: env.APP_GLOBAL_PREFIX,
    isDevelopmentRuntime: env.NODE_ENV === 'development',
    isTestRuntime: env.NODE_ENV === 'test',
    isProductionRuntime: env.NODE_ENV === 'production',
    isLocalEnvironment: environment === 'local',
    isTestEnvironment: environment === 'test',
    isStagingEnvironment: environment === 'staging',
    isProductionEnvironment: environment === 'production',
  };
}

export const appConfig = registerAs('app', () => buildAppConfig(getEnv()));

export type AppConfig = ConfigType<typeof appConfig>;
