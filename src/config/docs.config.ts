import { ConfigType, registerAs } from '@nestjs/config';
import { getEnv } from './env.schema';

export const docsConfig = registerAs('docs', () => {
  const env = getEnv();

  return {
    enabled: env.DOCS_ENABLED,
    path: env.DOCS_PATH,
  };
});

export type DocsConfig = ConfigType<typeof docsConfig>;
