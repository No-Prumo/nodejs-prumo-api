import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

function ApiBearerAccessTokenHeader(description: string) {
  return applyDecorators(
    ApiHeader({
      name: 'Authorization',
      description,
      required: true,
    }),
  );
}

export { ApiBearerAccessTokenHeader };
