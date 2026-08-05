import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { HealthController } from './health.controller';
import type { HealthService } from './health.service';

describe('HealthController', () => {
  it('keeps liveness independent from external dependencies', () => {
    const isReady = vi.fn();
    const health = { isReady } as unknown as HealthService;
    const controller = new HealthController(health);

    expect(controller.liveness()).toEqual({ status: 'ok' });
    expect(isReady).not.toHaveBeenCalled();
  });

  it('returns service unavailable when a required dependency is down', async () => {
    const health = {
      isReady: vi.fn().mockResolvedValue(false),
    } as unknown as HealthService;
    const status = vi.fn();
    const response = { status } as unknown as Response;
    const controller = new HealthController(health);

    await expect(controller.readiness(response)).resolves.toEqual({
      status: 'unavailable',
    });
    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
