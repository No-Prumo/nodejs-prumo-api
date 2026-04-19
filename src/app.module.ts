import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { createZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  appConfig,
  type AppConfig,
  databaseConfig,
  docsConfig,
  loggerConfig,
  type LoggerConfig,
  observabilityConfig,
  type ObservabilityConfig,
  validateEnv,
} from './config';
import { createPinoLoggerOptions } from './logging/pino-logger.factory';

const AppZodValidationPipe = createZodValidationPipe({
  strictSchemaDeclaration: true,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: validateEnv,
      load: [
        appConfig,
        databaseConfig,
        loggerConfig,
        docsConfig,
        observabilityConfig,
      ],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [appConfig.KEY, loggerConfig.KEY, observabilityConfig.KEY],
      useFactory: (
        appSettings: AppConfig,
        loggerSettings: LoggerConfig,
        observabilitySettings: ObservabilityConfig,
      ) =>
        createPinoLoggerOptions(
          appSettings,
          loggerSettings,
          observabilitySettings,
        ),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: AppZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
