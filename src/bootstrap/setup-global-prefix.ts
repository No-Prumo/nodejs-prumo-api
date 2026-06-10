import { NestExpressApplication } from '@nestjs/platform-express';
import type { AppConfig } from '../config';

function setupGlobalPrefix(
  app: NestExpressApplication,
  appSettings: AppConfig,
) {
  if (appSettings.globalPrefix) {
    app.setGlobalPrefix(appSettings.globalPrefix);
  }
}

export { setupGlobalPrefix };
