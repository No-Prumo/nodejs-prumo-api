import type { AppEnvironment } from './app-environment';

export const loggerLevelInputValues = [
  'silent',
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'log',
  'verbose',
] as const;

export type LoggerLevelInput = (typeof loggerLevelInputValues)[number];

export const pinoLevelValues = [
  'silent',
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
] as const;

export type PinoLogLevel = (typeof pinoLevelValues)[number];

const loggerLevelAliasMap: Record<LoggerLevelInput, PinoLogLevel> = {
  silent: 'silent',
  fatal: 'fatal',
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
  trace: 'trace',
  log: 'info',
  verbose: 'trace',
};

const defaultLogLevelByEnvironment: Record<AppEnvironment, PinoLogLevel> = {
  local: 'debug',
  test: 'warn',
  staging: 'info',
  production: 'info',
};

export function normalizeLogLevel(
  level?: LoggerLevelInput,
): PinoLogLevel | undefined {
  return level ? loggerLevelAliasMap[level] : undefined;
}

export function getDefaultLogLevel(environment: AppEnvironment): PinoLogLevel {
  return defaultLogLevelByEnvironment[environment];
}
