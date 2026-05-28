import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import type { DocsConfig } from '../config';

export function setupDocs(app: NestExpressApplication, docs: DocsConfig) {
  if (!docs.enabled) {
    return;
  }

  const openApiConfig = new DocumentBuilder()
    .setTitle('Sandicts API')
    .setDescription(
      'API documentation generated from Nest controllers and Zod schemas.',
    )
    .setVersion('1.0.0')
    .setOpenAPIVersion('3.1.0')
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);

  SwaggerModule.setup(
    docs.path,
    app,
    cleanupOpenApiDoc(openApiDocument, { version: '3.1' }),
  );
}
