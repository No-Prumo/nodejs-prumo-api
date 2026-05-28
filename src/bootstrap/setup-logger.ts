import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

export function setupLogger(app: NestExpressApplication) {
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
}
