import { ConfigType, registerAs } from '@nestjs/config';
import { getEnv } from '../env/env.schema';

const docsConfig = registerAs('docs', () => {
  const env = getEnv();

  return {
    enabled: env.DOCS_ENABLED,
    path: env.DOCS_PATH,
  };
});

type DocsConfig = ConfigType<typeof docsConfig>;

export { docsConfig };
export type { DocsConfig };
