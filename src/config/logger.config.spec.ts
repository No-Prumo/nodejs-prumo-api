import { validateEnv } from './env.schema';
import { buildLoggerConfig } from './logger.config';

const baseEnv = {
  DATABASE_URL: 'postgresql://postgres:no-prumo@localhost:5432/no-prumo',
  POSTGRES_DB: 'no-prumo',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PASSWORD: 'no-prumo',
  POSTGRES_PORT: '5432',
  POSTGRES_USER: 'postgres',
};

describe('buildLoggerConfig', () => {
  it('defaults to pretty debug logs in local development', () => {
    const env = validateEnv(baseEnv);

    expect(buildLoggerConfig(env)).toEqual({
      level: 'debug',
      pretty: true,
    });
  });

  it('defaults to JSON info logs in staging', () => {
    const env = validateEnv({
      ...baseEnv,
      APP_ENV: 'staging',
      NODE_ENV: 'production',
    });

    expect(buildLoggerConfig(env)).toEqual({
      level: 'info',
      pretty: false,
    });
  });

  it('normalizes Nest logger aliases to native pino levels', () => {
    const env = validateEnv({
      ...baseEnv,
      LOG_LEVEL: 'verbose',
      LOG_PRETTY: 'false',
    });

    expect(buildLoggerConfig(env)).toEqual({
      level: 'trace',
      pretty: false,
    });
  });
});
