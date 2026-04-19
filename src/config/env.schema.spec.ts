import { validateEnv } from './env.schema';

describe('validateEnv', () => {
  it('coerces env values and applies defaults', () => {
    const env = validateEnv({
      APP_ENV: 'staging',
      APP_VERSION: '1.2.3',
      DATABASE_URL: 'postgresql://postgres:no-prumo@localhost:5432/no-prumo',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'no-prumo',
      POSTGRES_DB: 'no-prumo',
      PORT: '4000',
      LOG_PRETTY: 'false',
      DOCS_ENABLED: 'true',
    });

    expect(env.NODE_ENV).toBe('development');
    expect(env.APP_ENV).toBe('staging');
    expect(env.APP_VERSION).toBe('1.2.3');
    expect(env.PORT).toBe(4000);
    expect(env.POSTGRES_PORT).toBe(5432);
    expect(env.LOG_PRETTY).toBe(false);
    expect(env.DOCS_ENABLED).toBe(true);
    expect(env.APP_HOST).toBe('0.0.0.0');
    expect(env.DOCS_PATH).toBe('docs');
  });

  it('throws when required env vars are invalid', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'not-a-url',
        POSTGRES_HOST: '',
        POSTGRES_PORT: 'abc',
        POSTGRES_USER: '',
        POSTGRES_PASSWORD: '',
        POSTGRES_DB: '',
      }),
    ).toThrow('Invalid environment variables');
  });
});
