import { ConfigType, registerAs } from '@nestjs/config';
import { resolveAppEnvironment } from '../app/app-environment';
import { getEnv } from '../env/env.schema';
import type { Env } from '../env/env.schema';
import { getDefaultLogLevel, normalizeLogLevel } from './logger-level';

export function buildLoggerConfig(env: Env) {
  const environment = resolveAppEnvironment(env);

  return {
    level: normalizeLogLevel(env.LOG_LEVEL) ?? getDefaultLogLevel(environment),
    pretty: env.LOG_PRETTY ?? environment === 'local',
  };
}

export const loggerConfig = registerAs('logger', () =>
  buildLoggerConfig(getEnv()),
);

export type LoggerConfig = ConfigType<typeof loggerConfig>;
