import { ConfigType, registerAs } from '@nestjs/config';
import { getEnv } from './env.schema';

export const observabilityConfig = registerAs('observability', () => {
  const env = getEnv();

  return {
    enabled: env.OBSERVABILITY_ENABLED,
    serviceName: env.OBSERVABILITY_SERVICE_NAME,
  };
});

export type ObservabilityConfig = ConfigType<typeof observabilityConfig>;
