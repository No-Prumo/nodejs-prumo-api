import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const openApiConfig = new DocumentBuilder()
    .setTitle('Sandicts API')
    .setDescription(
      'API documentation generated from Nest controllers and Zod schemas.',
    )
    .setVersion('1.0.0')
    .setOpenAPIVersion('3.1.0')
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);

  return cleanupOpenApiDoc(openApiDocument, {
    version: '3.1',
  });
}

export { buildOpenApiDocument };
