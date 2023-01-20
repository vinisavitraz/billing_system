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

  it('test payment flow with error', () => {
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

  it('test payment flow', async () => {
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
    const payment: payment = await prisma.payment.create({
      data: {
        paid_amount: 1,
        paid_at: new Date(),
        paid_by: 'Me',
        billing_id: '8291',
      },
    });
    
    const mockedRequestBody: ExecutePaymentRequest = new ExecutePaymentRequest(
      '8291',
      '2022-06-09 10:00:00',
      100000.00,
      'John Doe',
    );
    
    return request(app.getHttpServer())
      .post('/billing/pay')
      .send(mockedRequestBody)
      .expect(422)
      .expect('{"statusCode":422,"message":"Payment amount is greater than debt amount."}');
  });

  it('should save csv file and schedule new job to queue `read_csv`', async () => {
    const res = await request(app.getHttpServer())
      .post('/billing')
      .set('Content-Type', 'multipart/form-data')
      .attach('billings', './test/mocks/data/test.csv')
      .expect(201)
      .expect('{"status":"Added to queue"}');

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
