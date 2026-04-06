// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import request from 'supertest';
// import { App } from 'supertest/types';
// import { AppModule } from './../src/app.module';

// describe('AppController (e2e)', () => {
//   let app: INestApplication<App>;

//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     await app.init();
//   });

//   it('/ (GET)', () => {
//     return request(app.getHttpServer())
//       .get('/')
//       .expect(200)
//       .expect({ message: 'Hello World!' });
//   });

//   it('/tenants/:tenantId/greetings (POST) validates and returns the response', () => {
//     return request(app.getHttpServer())
//       .post('/tenants/acme/greetings?style=upper')
//       .send({ name: 'Maria' })
//       .expect(201)
//       .expect({
//         tenantId: 'acme',
//         style: 'upper',
//         greeting: 'HELLO, MARIA!',
//       });
//   });

//   it('/tenants/:tenantId/greetings (POST) rejects invalid payload', () => {
//     return request(app.getHttpServer())
//       .post('/tenants/a/greetings?style=upper')
//       .send({ name: 'M' })
//       .expect(400);
//   });

//   it('/docs-json (GET) exposes OpenAPI generated from Zod-backed controllers', () => {
//     return request(app.getHttpServer())
//       .get('/docs-json')
//       .expect(200)
//       .expect(
//         ({
//           body,
//         }: {
//           body: { openapi: string; paths: Record<string, unknown> };
//         }) => {
//           expect(body.openapi).toBe('3.1.0');
//           expect(body.paths['/tenants/{tenantId}/greetings']).toBeDefined();
//         },
//       );
//   });
// });
