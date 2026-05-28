import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../app.module';
import {
  appConfig,
  docsConfig,
  type AppConfig,
  type DocsConfig,
} from '../config';
import { setupDocs } from './setup-docs';
import { setupGlobalPrefix } from './setup-global-prefix';
import { setupLogger } from './setup-logger';
import { setupShutdownHooks } from './setup-shutdown-hooks';

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  setupLogger(app);
  setupShutdownHooks(app);

  const appSettings = app.get<AppConfig>(appConfig.KEY);
  const docsSettings = app.get<DocsConfig>(docsConfig.KEY);

  setupGlobalPrefix(app, appSettings);
  setupDocs(app, docsSettings);

  await app.listen(appSettings.port, appSettings.host);
}
