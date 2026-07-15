import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { ApiErrorResponses } from '@infra/http/openapi/api-error-responses.decorator';
import { ListSportsUseCase } from '../../../application/use-cases/list-sports/list-sports.use-case';
import { ListSportsResponseDto } from './list-sports.schemas';

@ApiTags('Sports')
@Controller('sports')
class ListSportsController {
  constructor(private readonly listSports: ListSportsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'List supported sports',
    description:
      'Returns the MVP sports catalog and simple levels available for player profiles.',
  })
  @ApiErrorResponses({
    tooManyRequests: ['rate_limited'],
    internalServerError: ['internal_error'],
  })
  @ZodResponse({
    status: HttpStatus.OK,
    description: 'Supported MVP sports and player levels',
    type: ListSportsResponseDto,
  })
  getSports(): ListSportsResponseDto {
    return this.listSports.execute();
  }
}

export { ListSportsController };
