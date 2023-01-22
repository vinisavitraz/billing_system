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

  describe('POST /billing ', () => {
    it('should call service with the expected file name', async () => {
      const serviceSpy = jest.spyOn(service, 'scheduleReadCSVJob').mockImplementation(async () => {
        return new SaveBillingsFileResponse('Added to queue');
      });
      const mockedFile: Express.Multer.File = {
        fieldname: 'billings',
        originalname: 'billings.csv',
        mimetype: 'text/csv',
        path: 'something',
        buffer: Buffer.from('one,two,three'),
        filename: 'filename'
      } as Express.Multer.File;
  
      await controller.saveBillingsFile(mockedFile);
  
      expect(serviceSpy).toHaveBeenCalledWith(mockedFile.filename);
    });
  });

  describe('POST /billing without filename', () => {
    it('should throw bad request exception', async () => {
      const serviceSpy = jest.spyOn(service, 'scheduleReadCSVJob').mockImplementation(async () => {
        return new SaveBillingsFileResponse('Added to queue');
      });
      const mockedFile: Express.Multer.File = {
        buffer: Buffer.from('one,two,three'),
        filename: ''
      } as Express.Multer.File;
  
      await expect(controller.saveBillingsFile(mockedFile))
        .rejects
        .toThrow(HttpException); 
    });
  });

  describe('POST /billing/pay ', () => {
    it('should call service with the expected payment entity', async () => {
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

      await controller.executePayment(requestBody);

      expect(serviceSpy).toHaveBeenCalledWith(expectedPaymentEntity);
    });
  });

  const mockRequestInvalidFields = [
    {
      debtId: 123,
      paidAt: '2023-01-30 10:00:00',
      paidAmount: 100,
      paidBy: 'John Doe',
      expectedMessage: 'Invalid request field `debtId`',
    },
    {
      debtId: '8291',
      paidAt: 'abc',
      paidAmount: 100,
      paidBy: 'John Doe',
      expectedMessage: 'Invalid request field date `paidAt`',
    },
    {
      debtId: '8291',
      paidAt: 123,
      paidAmount: 100,
      paidBy: 'John Doe',
      expectedMessage: 'Invalid request field date `paidAt`',
    },
    {
      debtId: '8291',
      paidAt: '2023-01-30 10:00:00',
      paidAmount: 'abc',
      paidBy: 'John Doe',
      expectedMessage: 'Invalid request field `paidAmount`',
    },
    {
      debtId: '8291',
      paidAt: '2023-01-30 10:00:00',
      paidAmount: 100,
      paidBy: 12,
      expectedMessage: 'Invalid request field `paidBy`',
    },
  ];

  describe.each(mockRequestInvalidFields)('POST /billing/pay with invalid fields', (mockRequest) => {
    it('should throw exception for request field', async () => {
      const executePaymentRequest: ExecutePaymentRequest = new ExecutePaymentRequest(
        mockRequest.debtId,
        mockRequest.paidAt,
        mockRequest.paidAmount,
        mockRequest.paidBy,
      );
      
      await expect(controller.executePayment(executePaymentRequest))
        .rejects
        .toThrow(mockRequest.expectedMessage);
    });
  });

  describe('test validate request body with valid fields ', () => {
    it('should validate request body and not throw exception', () => {
      const executePaymentRequest: ExecutePaymentRequest = new ExecutePaymentRequest(
        '8291',
        '2022-06-09 10:00:00',
        100000.00,
        'John Doe',
      );
  
      expect(() => { controller['validateRequestBody'](executePaymentRequest); }).not.toThrow(HttpException);
    });
  });

  describe.each(mockRequestInvalidFields)('test validate request body with invalid fields', (mockRequest) => {
    it('should throw exception for request field', () => {
      const executePaymentRequest: ExecutePaymentRequest = new ExecutePaymentRequest(
        mockRequest.debtId,
        mockRequest.paidAt,
        mockRequest.paidAmount,
        mockRequest.paidBy,
      );
  
      expect(() => { controller['validateRequestBody'](executePaymentRequest); })
      .toThrow(mockRequest.expectedMessage);
    });
  });

});
