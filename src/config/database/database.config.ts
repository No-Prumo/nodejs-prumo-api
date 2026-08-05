import { ConfigType, registerAs } from '@nestjs/config';
import { getEnv } from '../env/env.schema';

const databaseConfig = registerAs('database', () => {
  const env = getEnv();

  return {
    url: env.DATABASE_URL,
  };
});

type DatabaseConfig = ConfigType<typeof databaseConfig>;

export { databaseConfig };
export type { DatabaseConfig };
