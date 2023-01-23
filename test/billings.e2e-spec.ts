import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { BillingModule } from 'src/billing/billing.module';
import * as request from 'supertest';
import { ExecutePaymentRequest } from 'src/billing/request/execute-payment.request';
import { prisma } from './mocks/client';
import { billing, job, payment } from '@prisma/client';

describe('Billings (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BillingModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('POST /billing ', () => {
    it('should save csv file and schedule new job to queue `read_csv`', async () => {
      const res = await request(app.getHttpServer())
        .post('/billing')
        .set('Content-Type', 'multipart/form-data')
        .attach('billings', './test/mocks/data/test.csv')
        .expect(201)
        .expect('{"status":"Added to processing queue. Billings will be created in a few seconds."}');
  
      const scheduledJob: job | null = await prisma.job.findFirst({
        where: {
          queue: 'read_csv',
        },
      });
  
      expect(scheduledJob).not.toBeNull();
      expect(scheduledJob!.queue).toEqual('read_csv');
      expect(scheduledJob!.status).toEqual('pending');
    });
  });
  
  describe('POST /billing/pay without billing on database', () => {
    it('should return not found', () => {
      const mockedRequestBody: ExecutePaymentRequest = new ExecutePaymentRequest(
        '8291',
        '2022-06-09 10:00:00',
        100000.00,
        'John Doe',
      );
      
      return request(app.getHttpServer())
        .post('/billing/pay')
        .send(mockedRequestBody)
        .expect(404)
        .expect('{"statusCode":404,"message":"Billing with ID `8291` not found."}');
    });
  });
  
  const mockRequestInvalidFields = [
    {
      debtId: 123,
      paidAt: '2023-01-30 10:00:00',
      paidAmount: 100,
      paidBy: 'John Doe',
      expectedMessage: '{"statusCode":400,"message":"Invalid request field `debtId`"}',
    },
    {
      debtId: '8291',
      paidAt: 'abc',
      paidAmount: 100,
      paidBy: 'John Doe',
      expectedMessage: '{"statusCode":400,"message":"Invalid request field date `paidAt`"}',
    },
    {
      debtId: '8291',
      paidAt: 123,
      paidAmount: 100,
      paidBy: 'John Doe',
      expectedMessage: '{"statusCode":400,"message":"Invalid request field date `paidAt`"}',
    },
    {
      debtId: '8291',
      paidAt: '2023-01-30 10:00:00',
      paidAmount: 'abc',
      paidBy: 'John Doe',
      expectedMessage: '{"statusCode":400,"message":"Invalid request field `paidAmount`"}',
    },
    {
      debtId: '8291',
      paidAt: '2023-01-30 10:00:00',
      paidAmount: 100,
      paidBy: 12,
      expectedMessage: '{"statusCode":400,"message":"Invalid request field `paidBy`"}',
    },
    {
      paidAt: '2023-01-30 10:00:00',
      paidAmount: 100,
      paidBy: 12,
      expectedMessage: '{"statusCode":400,"message":"Invalid request field `debtId`"}',
    },
    {
      debtId: '8291',
      paidAmount: 100,
      paidBy: 12,
      expectedMessage: '{"statusCode":400,"message":"Invalid request field date `paidAt`"}',
    },
    {
      debtId: '8291',
      paidAt: '2023-01-30 10:00:00',
      paidBy: 12,
      expectedMessage: '{"statusCode":400,"message":"Invalid request field `paidAmount`"}',
    },
    {
      debtId: '8291',
      paidAt: '2023-01-30 10:00:00',
      paidAmount: 100,
      expectedMessage: '{"statusCode":400,"message":"Invalid request field `paidBy`"}',
    },
  ];

  describe.each(mockRequestInvalidFields)('POST /billing/pay with invalid fields', (mockRequest) => {
    it('should return bad request', async () => {
      const billings: billing = await prisma.billing.create({
        data: {
          name: 'teste',
          government_id: '11111111111',
          email: 'viniciusemd@g,ao;.c',
          id: '8291',
          amount: 1,
          due_date: new Date(),
          status: 'pending_payment',
          }
      });

      const mockedRequestBody: ExecutePaymentRequest = new ExecutePaymentRequest(
        mockRequest.debtId,
        mockRequest.paidAt,
        mockRequest.paidAmount,
        mockRequest.paidBy,
      );
      
      return request(app.getHttpServer())
        .post('/billing/pay')
        .send(mockedRequestBody)
        .expect(400)
        .expect(mockRequest.expectedMessage);

    });
  });

  const mockRequestValidFields = [
    {
      debtId: '8291',
      paidAt: '2023-01-24 10:00:00',
      paidAmount: 5,
      paidBy: 'John Doe',
      expectedMessage: '{"debtStatus":"pending_payment"}',
    },
    {
      debtId: '8291',
      paidAt: '2023-01-24 10:00:00',
      paidAmount: 9,
      paidBy: 'John Doe',
      expectedMessage: '{"debtStatus":"paid"}',
    },
  ];

  describe.each(mockRequestValidFields)('POST /billing/pay with valid fields', (mockRequest) => {
    it('should execute payment and return billing status', async () => {
      const billings: billing = await prisma.billing.create({
        data: {
          name: 'teste',
          government_id: '11111111111',
          email: 'viniciusemd@g,ao;.c',
          id: '8291',
          amount: 10,
          due_date: new Date('2023-01-30 23:59:59'),
          status: 'pending_payment',
          }
      });
      const payment: payment = await prisma.payment.create({
        data: {
          paid_amount: 1,
          paid_at: new Date('2023-01-20 10:00:00'),
          paid_by: 'Me',
          billing_id: '8291',
        },
      });
      
      const mockedRequestBody: ExecutePaymentRequest = new ExecutePaymentRequest(
        mockRequest.debtId,
        mockRequest.paidAt,
        mockRequest.paidAmount,
        mockRequest.paidBy,
      );

      const res = await request(app.getHttpServer())
        .post('/billing/pay')
        .send(mockedRequestBody)
        .expect(201)
        .expect(mockRequest.expectedMessage);
  
      const lastPayment: payment | null = await prisma.payment.findFirst({
        orderBy: [
          {
            id: 'desc',
          },
        ],
      });
  
      expect(lastPayment).not.toBeNull();
    });
  });

});
