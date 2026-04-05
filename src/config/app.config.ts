import { ConfigType, registerAs } from '@nestjs/config';
import { getEnv } from './env.schema';

export const appConfig = registerAs('app', () => {
  const env = getEnv();

  return {
    nodeEnv: env.NODE_ENV,
    host: env.APP_HOST,
    port: env.PORT,
    globalPrefix: env.APP_GLOBAL_PREFIX,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
  };
});

export type AppConfig = ConfigType<typeof appConfig>;
