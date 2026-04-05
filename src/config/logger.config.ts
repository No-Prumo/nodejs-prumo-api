import { ConfigType, registerAs } from '@nestjs/config';
import { getEnv } from './env.schema';

export const loggerConfig = registerAs('logger', () => {
  const env = getEnv();

  return {
    level: env.LOG_LEVEL,
    pretty: env.LOG_PRETTY,
  };
});

export type LoggerConfig = ConfigType<typeof loggerConfig>;
