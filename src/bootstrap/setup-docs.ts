import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import type { DocsConfig } from '../config';
import { buildOpenApiDocument } from '../infra/http/openapi/openapi-document';

function setupDocs(app: NestExpressApplication, docs: DocsConfig) {
  if (!docs.enabled) {
    return;
  }

  SwaggerModule.setup(docs.path, app, buildOpenApiDocument(app));
}

export { setupDocs };
