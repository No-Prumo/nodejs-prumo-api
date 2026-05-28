import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app/app.config';
import { databaseConfig } from './database/database.config';
import { docsConfig } from './docs/docs.config';
import { validateEnv } from './env/env.schema';
import { loggerConfig } from './logger/logger.config';
import { observabilityConfig } from './observability/observability.config';

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
  ],
  exports: [ConfigModule],
})
export class ConfigurationModule {}
