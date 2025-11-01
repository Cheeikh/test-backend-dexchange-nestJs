import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Transfers (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const validApiKey = 'test-api-key-123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /transfers', () => {
    it('should create a transfer successfully', () => {
      return request(app.getHttpServer())
        .post('/transfers')
        .set('x-api-key', validApiKey)
        .send({
          amount: 12500,
          currency: 'XOF',
          channel: 'WAVE',
          recipient: {
            phone: '+221770000000',
            name: 'Jane Doe',
          },
          metadata: { orderId: 'ABC-123' },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('reference');
          expect(res.body.status).toBe('PENDING');
          expect(res.body.amount).toBe(12500);
          expect(res.body.fees).toBe(100);
          expect(res.body.total).toBe(12600);
        });
    });

    it('should return 401 when API key is missing', () => {
      return request(app.getHttpServer())
        .post('/transfers')
        .send({
          amount: 12500,
          channel: 'WAVE',
          recipient: {
            phone: '+221770000000',
            name: 'Jane Doe',
          },
        })
        .expect(401);
    });

    it('should return 403 when API key is invalid', () => {
      return request(app.getHttpServer())
        .post('/transfers')
        .set('x-api-key', 'invalid-key')
        .send({
          amount: 12500,
          channel: 'WAVE',
          recipient: {
            phone: '+221770000000',
            name: 'Jane Doe',
          },
        })
        .expect(403);
    });

    it('should return 400 for invalid amount', () => {
      return request(app.getHttpServer())
        .post('/transfers')
        .set('x-api-key', validApiKey)
        .send({
          amount: -100,
          channel: 'WAVE',
          recipient: {
            phone: '+221770000000',
            name: 'Jane Doe',
          },
        })
        .expect(400);
    });
  });

  describe('GET /transfers', () => {
    it('should return paginated list of transfers', () => {
      return request(app.getHttpServer())
        .get('/transfers')
        .set('x-api-key', validApiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(Array.isArray(res.body.items)).toBe(true);
        });
    });

    it('should filter transfers by status', () => {
      return request(app.getHttpServer())
        .get('/transfers?status=PENDING')
        .set('x-api-key', validApiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          res.body.items.forEach((item) => {
            expect(item.status).toBe('PENDING');
          });
        });
    });

    it('should filter transfers by channel', () => {
      return request(app.getHttpServer())
        .get('/transfers?channel=WAVE')
        .set('x-api-key', validApiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
        });
    });
  });

  describe('GET /transfers/:id', () => {
    let transferId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/transfers')
        .set('x-api-key', validApiKey)
        .send({
          amount: 10000,
          channel: 'WAVE',
          recipient: {
            phone: '+221770000001',
            name: 'John Doe',
          },
        });

      transferId = response.body.id;
    });

    it('should return a transfer by id', () => {
      return request(app.getHttpServer())
        .get(`/transfers/${transferId}`)
        .set('x-api-key', validApiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(transferId);
          expect(res.body).toHaveProperty('reference');
        });
    });

    it('should return 404 for non-existent transfer', () => {
      return request(app.getHttpServer())
        .get('/transfers/non-existent-id')
        .set('x-api-key', validApiKey)
        .expect(404);
    });
  });

  describe('POST /transfers/:id/process', () => {
    let transferId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/transfers')
        .set('x-api-key', validApiKey)
        .send({
          amount: 15000,
          channel: 'WAVE',
          recipient: {
            phone: '+221770000002',
            name: 'Alice Smith',
          },
        });

      transferId = response.body.id;
    });

    it('should process a pending transfer', async () => {
      const response = await request(app.getHttpServer())
        .post(`/transfers/${transferId}/process`)
        .set('x-api-key', validApiKey)
        .expect(200);

      expect(['SUCCESS', 'FAILED']).toContain(response.body.status);
    }, 10000);

    it('should return 409 when trying to process already processed transfer', async () => {
      await request(app.getHttpServer())
        .post(`/transfers/${transferId}/process`)
        .set('x-api-key', validApiKey);

      return request(app.getHttpServer())
        .post(`/transfers/${transferId}/process`)
        .set('x-api-key', validApiKey)
        .expect(409);
    }, 10000);
  });

  describe('POST /transfers/:id/cancel', () => {
    let transferId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/transfers')
        .set('x-api-key', validApiKey)
        .send({
          amount: 20000,
          channel: 'ORANGE_MONEY',
          recipient: {
            phone: '+221770000003',
            name: 'Bob Johnson',
          },
        });

      transferId = response.body.id;
    });

    it('should cancel a pending transfer', () => {
      return request(app.getHttpServer())
        .post(`/transfers/${transferId}/cancel`)
        .set('x-api-key', validApiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('CANCELED');
        });
    });

    it('should return 409 when trying to cancel non-pending transfer', async () => {
      await request(app.getHttpServer())
        .post(`/transfers/${transferId}/cancel`)
        .set('x-api-key', validApiKey);

      return request(app.getHttpServer())
        .post(`/transfers/${transferId}/cancel`)
        .set('x-api-key', validApiKey)
        .expect(409);
    });
  });
});
