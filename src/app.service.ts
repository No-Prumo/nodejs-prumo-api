import { Injectable } from '@nestjs/common';
import {
  type GreetingBody,
  type GreetingParams,
  type GreetingQuery,
} from './app.schemas';

@Injectable()
export class AppService {
  getStatus(): { message: string } {
    return { message: 'Hello World!' };
  }

  createGreeting(
    params: GreetingParams,
    query: GreetingQuery,
    body: GreetingBody,
  ) {
    const baseGreeting = body.message?.trim() || `Hello, ${body.name}!`;
    const greeting =
      query.style === 'upper' ? baseGreeting.toUpperCase() : baseGreeting;

    return {
      tenantId: params.tenantId,
      style: query.style,
      greeting,
    };
  }
}
