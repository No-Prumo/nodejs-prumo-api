export const nodeEnvironmentValues = [
  'development',
  'test',
  'production',
] as const;

export type NodeEnvironment = (typeof nodeEnvironmentValues)[number];

export const appEnvironmentValues = [
  'local',
  'test',
  'staging',
  'production',
] as const;

export type AppEnvironment = (typeof appEnvironmentValues)[number];

export function resolveAppEnvironment(env: {
  NODE_ENV: NodeEnvironment;
  APP_ENV?: AppEnvironment | undefined;
}): AppEnvironment {
  if (env.APP_ENV) {
    return env.APP_ENV;
  }

  switch (env.NODE_ENV) {
    case 'development':
      return 'local';
    case 'test':
      return 'test';
    case 'production':
      return 'production';
  }
}
