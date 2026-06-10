import type { AppEnvironment } from '../app/app-environment';

const loggerLevelInputValues = [
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

type LoggerLevelInput = (typeof loggerLevelInputValues)[number];

const pinoLevelValues = [
  'silent',
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
] as const;

type PinoLogLevel = (typeof pinoLevelValues)[number];

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

function normalizeLogLevel(level?: LoggerLevelInput): PinoLogLevel | undefined {
  return level ? loggerLevelAliasMap[level] : undefined;
}

function getDefaultLogLevel(environment: AppEnvironment): PinoLogLevel {
  return defaultLogLevelByEnvironment[environment];
}

export {
  getDefaultLogLevel,
  loggerLevelInputValues,
  normalizeLogLevel,
  pinoLevelValues,
};
export type { LoggerLevelInput, PinoLogLevel };
