import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { createZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { minutesToMilliseconds } from '@shared/time/time.helpers';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

const AppZodValidationPipe = createZodValidationPipe({
  strictSchemaDeclaration: true,
});
const defaultThrottleWindowMinutes = 1;
const defaultThrottleWindowMilliseconds = minutesToMilliseconds(
  defaultThrottleWindowMinutes,
);
const defaultThrottleRequestLimit = 120;

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: defaultThrottleWindowMilliseconds,
          limit: defaultThrottleRequestLimit,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
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
class HttpPlatformModule {}

export { HttpPlatformModule };
