import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { buildOpenApiDocument } from '@infra/http/openapi/openapi-document';

const openApiOutputPath = path.resolve('openapi', 'sandicts-api.json');

async function generateOpenApiArtifact() {
  applyGenerationEnvironmentDefaults();

  const { AppModule } = await import('../app.module.js');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    logger: false,
  });

  try {
    const document = buildOpenApiDocument(app);

    await mkdir(path.dirname(openApiOutputPath), { recursive: true });
    await writeFile(
      openApiOutputPath,
      `${JSON.stringify(document, null, 2)}\n`,
      'utf8',
    );
  } finally {
    await app.close();
  }
}

function applyGenerationEnvironmentDefaults() {
  const defaults = {
    NODE_ENV: 'test',
    APP_ENV: 'test',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/sandicts',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'postgres',
    POSTGRES_PASSWORD: 'postgres',
    POSTGRES_DB: 'sandicts',
  } as const;

  for (const [name, value] of Object.entries(defaults)) {
    process.env[name] ??= value;
  }
}

void generateOpenApiArtifact().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
