import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './config/configuration.module';
import { HttpPlatformModule } from './infra/http/http-platform.module';
import { LoggingModule } from './infra/logging/logging.module';
import { PrismaModule } from './infra/prisma/prisma.module';

@Module({
  imports: [
    ConfigurationModule,
    LoggingModule,
    HttpPlatformModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
