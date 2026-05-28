import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { createZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

const AppZodValidationPipe = createZodValidationPipe({
  strictSchemaDeclaration: true,
});

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: AppZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class HttpPlatformModule {}
