import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';
import {
  appConfig,
  docsConfig,
  type AppConfig,
  type DocsConfig,
} from './config';

function setupDocs(app: NestExpressApplication, docs: DocsConfig) {
  if (!docs.enabled) {
    return;
  }

  const openApiConfig = new DocumentBuilder()
    .setTitle('No Prumo API')
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

function setupLogger(app: NestExpressApplication) {
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  setupLogger(app);

  const { host, port, globalPrefix } = app.get<AppConfig>(appConfig.KEY);
  const docsSettings = app.get<DocsConfig>(docsConfig.KEY);

  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  setupDocs(app, docsSettings);

  await app.listen(port, host);
}

void bootstrap();
