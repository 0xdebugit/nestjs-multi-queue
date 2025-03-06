// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const configService = new ConfigService();
  const queueProvidersEnv = configService.get<string>('QUEUE_TYPE') || 'RBQ';
  const totalQueueProviders = queueProvidersEnv.split(',').length;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/publish (POST)', () => {
    return request(app.getHttpServer())
      .post('/publish')
      .send({ value: 'Hello, test!' })
      .expect(201)
      .then((response) => {
        const queueResponse = Object.keys(response.body?.response).length;
        expect(queueResponse).toEqual(totalQueueProviders);
      });
  });

  it('/consume (GET)', () => {
    return request(app.getHttpServer())
      .get('/consume')
      .expect(200)
      .then((response) => {
        expect(response.body?.status).toContain(
          '[LOGS] Consumer is listening now....',
        );
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
