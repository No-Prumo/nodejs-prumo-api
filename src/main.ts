import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig, type AppConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const { host, port, globalPrefix } = app.get<AppConfig>(appConfig.KEY);

  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  await app.listen(port, host);
}

void bootstrap();
