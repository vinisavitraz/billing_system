import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BillingStatus } from 'src/app/enum/status.enum';
import { DatabaseService } from 'src/database/database.service';
import { JobService } from 'src/job/job.service';
import { MailService } from 'src/mail/mail.service';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PaymentEntity } from './entity/payment.entity';
import { ExecutePaymentRequest } from './request/execute-payment.request';
import { ExecutePaymentResponse } from './response/execute-payment.response';
import { SaveBillingsFileResponse } from './response/save-billings-file.response';

describe('BillingController', () => {
  let controller: BillingController;
  let service: BillingService;
  let jobService: JobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingService, DatabaseService, MailService, JobService],
      controllers: [BillingController],
    }).compile();

    controller = module.get<BillingController>(BillingController);
    service = module.get<BillingService>(BillingService);
    jobService = module.get<JobService>(JobService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('POST /billing ', () => {
  //   it('should call service with the expected file name', () => {
  //     const serviceSpy = jest.spyOn(service, 'scheduleReadCSVJob').mockImplementation(async () => {
  //       return new SaveBillingsFileResponse('Added to queue');
  //     });
  //     const mockedFile: Express.Multer.File = {
  //       fieldname: 'billings',
  //       originalname: 'billings.csv',
  //       mimetype: 'text/csv',
  //       path: 'something',
  //       buffer: Buffer.from('one,two,three'),
  //     } as Express.Multer.File;
  
  //     controller.saveBillingsFile(mockedFile);
  
  //     expect(serviceSpy).toHaveBeenCalledWith(mockedFile.filename);
  //   });
  // });


  describe('POST /billing ', () => {});

  it('should call service with the expected payment entity', () => {
    const serviceSpy = jest.spyOn(service, 'executePayment').mockImplementation(async () => {
      return new ExecutePaymentResponse(BillingStatus.PAID);
    });
    const requestBody: ExecutePaymentRequest = new ExecutePaymentRequest(
      '8291',
      '2022-06-09 10:00:00',
      100000.00,
      'John Doe',
    );
    const expectedPaymentEntity: PaymentEntity = new PaymentEntity(
      '8291',
      new Date('2022-06-09 10:00:00'),
      100000.00,
      'John Doe',
    );

    controller.executePayment(requestBody);

    expect(serviceSpy).toHaveBeenCalledWith(expectedPaymentEntity);
  });

  it('should validate request body and not throw exception', () => {
    const executePaymentRequest: ExecutePaymentRequest = new ExecutePaymentRequest(
      '8291',
      '2022-06-09 10:00:00',
      100000.00,
      'John Doe',
    );

    expect(() => { controller['validateRequestBody'](executePaymentRequest); }).not.toThrow(HttpException);
  });

  it('should validate request body parameter `debtId` and throw exception', () => {
    const executePaymentRequest: ExecutePaymentRequest = new ExecutePaymentRequest(
      123,
      '2022-06-09 10:00:00',
      100,
      'John Doe',
    );

    expect(() => { controller['validateRequestBody'](executePaymentRequest); }).toThrow('Invalid request field `debtId`');
  });

  it('should validate request body parameter `paidAt` and throw exception', () => {
    const executePaymentRequest: ExecutePaymentRequest = new ExecutePaymentRequest(
      '8291',
      'abc',
      100,
      'John Doe',
    );

    expect(() => { controller['validateRequestBody'](executePaymentRequest); }).toThrow('Invalid request field date `paidAt`');
  });

  it('should validate request body parameter `paidAt` with number and throw exception', () => {
    const executePaymentRequest: ExecutePaymentRequest = new ExecutePaymentRequest(
      '8291',
      123,
      100,
      'John Doe',
    );

    expect(() => { controller['validateRequestBody'](executePaymentRequest); }).toThrow('Invalid request field date `paidAt`');
  });

  it('should validate request body parameter `paidAmount` and throw exception', () => {
    const executePaymentRequest: ExecutePaymentRequest = new ExecutePaymentRequest(
      '8291',
      '2022-06-09 10:00:00',
      'abc',
      'John Doe',
    );

    expect(() => { controller['validateRequestBody'](executePaymentRequest); }).toThrow('Invalid request field `paidAmount`');
  });

  it('should validate request body parameter `paidBy` and throw exception', () => {
    const executePaymentRequest: ExecutePaymentRequest = new ExecutePaymentRequest(
      '8291',
      '2022-06-09 10:00:00',
      100,
      12,
    );

    expect(() => { controller['validateRequestBody'](executePaymentRequest); }).toThrow('Invalid request field `paidBy`');
  });

});
