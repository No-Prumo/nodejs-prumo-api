import { ConfigType, registerAs } from '@nestjs/config';
import { getEnv } from './env.schema';

export const databaseConfig = registerAs('database', () => {
  const env = getEnv();

  return {
    url: env.DATABASE_URL,
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  };
});

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
