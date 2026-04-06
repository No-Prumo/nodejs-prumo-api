import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { AppService } from './app.service';
import {
  AppStatusDto,
  CreateGreetingBodyDto,
  GreetingQueryDto,
  GreetingResponseDto,
  GreetingTenantParamsDto,
} from './app.schemas';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Check API status',
    description:
      'Simple status endpoint with Zod-backed response documentation.',
  })
  @ZodResponse({
    status: 200,
    description: 'Application status response',
    type: AppStatusDto,
  })
  getStatus(): AppStatusDto {
    return this.appService.getStatus();
  }

  @Post('tenants/:tenantId/greetings')
  @ApiOperation({
    summary: 'Create a greeting',
    description:
      'Validates params, query and body with Zod and exposes the same schemas in Swagger.',
  })
  @ZodResponse({
    status: 201,
    description: 'Greeting generated from validated input',
    type: GreetingResponseDto,
  })
  createGreeting(
    @Param() params: GreetingTenantParamsDto,
    @Query() query: GreetingQueryDto,
    @Body() body: CreateGreetingBodyDto,
  ): GreetingResponseDto {
    return this.appService.createGreeting(params, query, body);
  }
}
