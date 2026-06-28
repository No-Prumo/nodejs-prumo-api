const { spawnSync } = require('node:child_process');

const generationEnvironment = {
  NODE_ENV: 'test',
  APP_ENV: 'test',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/sandicts',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PORT: '5432',
  POSTGRES_USER: 'postgres',
  POSTGRES_PASSWORD: 'postgres',
  POSTGRES_DB: 'sandicts',
  ...process.env,
};

const npmCliPath = process.env.npm_execpath;

if (!npmCliPath) {
  throw new Error('npm_execpath is required to generate the OpenAPI artifact');
}

run(process.execPath, [npmCliPath, 'run', 'build']);
run(process.execPath, ['dist/scripts/generate-openapi.js']);

function run(command, args) {
  const result = spawnSync(command, args, {
    env: generationEnvironment,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(result.error);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
