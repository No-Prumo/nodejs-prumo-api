import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/configuration.module';
import { HttpPlatformModule } from './infra/http/http-platform.module';
import { LoggingModule } from './infra/logging/logging.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigurationModule,
    LoggingModule,
    HttpPlatformModule,
    PrismaModule,
    AuthModule,
  ],
})
class AppModule {}

export { AppModule };
