import { NestExpressApplication } from '@nestjs/platform-express';

export function setupShutdownHooks(app: NestExpressApplication) {
  app.enableShutdownHooks();
}
