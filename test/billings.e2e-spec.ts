import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ExecutePaymentResponse } from 'src/billing/response/execute-payment.response';
import { BillingService } from 'src/billing/billing.service';
import { BillingModule } from 'src/billing/billing.module';

describe('Billings (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BillingModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    //const expectedResponse: ExecutePaymentResponse = new ExecutePaymentResponse(BillingService.PAID);
    
    return request(app.getHttpServer())
      .post('/billings/pay')
      .expect(200);
  });
});
