const nodeEnvironmentValues = ['development', 'test', 'production'] as const;

type NodeEnvironment = (typeof nodeEnvironmentValues)[number];

const appEnvironmentValues = [
  'local',
  'test',
  'staging',
  'production',
] as const;

type AppEnvironment = (typeof appEnvironmentValues)[number];

function resolveAppEnvironment(env: {
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

export { appEnvironmentValues, nodeEnvironmentValues, resolveAppEnvironment };
export type { AppEnvironment, NodeEnvironment };
