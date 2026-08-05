import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { ZodResponse } from 'nestjs-zod';
import { HealthResponseDto } from './health.schemas';
import { HealthService } from './health.service';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('live')
  @ApiOperation({ summary: 'Check whether the API process is running' })
  @ZodResponse({
    status: HttpStatus.OK,
    description: 'The API process is running',
    type: HealthResponseDto,
  })
  liveness(): HealthResponseDto {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Check whether the API can receive application traffic',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'A required dependency is unavailable',
    type: HealthResponseDto,
  })
  @ZodResponse({
    status: HttpStatus.OK,
    description: 'The API and its required dependencies are ready',
    type: HealthResponseDto,
  })
  async readiness(
    @Res({ passthrough: true }) response: Response,
  ): Promise<HealthResponseDto> {
    const isReady = await this.health.isReady();

    if (!isReady) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return { status: isReady ? 'ok' : 'unavailable' };
  }
}

export { HealthController };
