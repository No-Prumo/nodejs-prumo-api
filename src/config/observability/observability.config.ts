import { ConfigType, registerAs } from '@nestjs/config';
import { getEnv } from '../env/env.schema';

const observabilityConfig = registerAs('observability', () => {
  const env = getEnv();

  return {
    enabled: env.OBSERVABILITY_ENABLED,
    serviceName: env.OBSERVABILITY_SERVICE_NAME,
  };
});

type ObservabilityConfig = ConfigType<typeof observabilityConfig>;

export { observabilityConfig };
export type { ObservabilityConfig };
