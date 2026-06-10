import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import {
  appConfig,
  type AppConfig,
  loggerConfig,
  type LoggerConfig,
  observabilityConfig,
  type ObservabilityConfig,
} from '../../config';
import { createPinoLoggerOptions } from './pino-logger.factory';

@Module({
  imports: [
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
  exports: [LoggerModule],
})
class LoggingModule {}

export { LoggingModule };
