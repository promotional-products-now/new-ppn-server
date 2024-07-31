import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('SupplierController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET all suppliers', async () => {
    const page = 1,
      limit = 10;
    const response = await request(app.getHttpServer()).get(
      `/suppliers?page=${page}&limit=${limit}`,
    );

    console.log(response.body);
    expect(response.body).toBeDefined();
    //   expect(response.body.docs.length).toBeLessThanOrEqual(limit);
    //   expect(response.body.page).toEqual(page);
    //   expect(response.body.limit).toEqual(limit);
    //   expect(response.body.hasPrevPage).toBeFalsy();
  });
});
