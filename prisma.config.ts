import { config as loadEnv } from 'dotenv';
import { expand } from 'dotenv-expand';
import { defineConfig, env } from 'prisma/config';

expand(loadEnv());

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
