import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { BillingModule } from 'src/billing/billing.module';
import * as request from 'supertest';
import { ExecutePaymentRequest } from 'src/billing/request/execute-payment.request';

describe('Billings (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BillingModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('test payment flow', () => {
    const mockedRequestBody: ExecutePaymentRequest = new ExecutePaymentRequest(
      '8291',
      '2022-06-09 10:00:00',
      100000.00,
      'John Doe',
    );
    //const expectedResponse: ExecutePaymentResponse = new ExecutePaymentResponse(BillingService.PAID);
    
    return request(app.getHttpServer())
      .post('/billing/pay')
      .send(mockedRequestBody)
      .expect(404)
      .expect('{"statusCode":404,"message":"Billing with ID `8291` not found."}');
  });
});
