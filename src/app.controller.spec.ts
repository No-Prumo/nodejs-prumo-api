import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import type {
  CreateGreetingBodyDto,
  GreetingQueryDto,
  GreetingTenantParamsDto,
} from './app.schemas';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the API status', () => {
      expect(appController.getStatus()).toEqual({ message: 'Hello World!' });
    });

    it('should create a greeting', () => {
      const params = { tenantId: 'tenant-a' } as GreetingTenantParamsDto;
      const query = { style: 'upper' } as GreetingQueryDto;
      const body = { name: 'Maria' } as CreateGreetingBodyDto;

      expect(appController.createGreeting(params, query, body)).toEqual({
        tenantId: 'tenant-a',
        style: 'upper',
        greeting: 'HELLO, MARIA!',
      });
    });
  });
});
