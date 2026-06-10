import { NestExpressApplication } from '@nestjs/platform-express';

function setupShutdownHooks(app: NestExpressApplication) {
  app.enableShutdownHooks();
}

export { setupShutdownHooks };
