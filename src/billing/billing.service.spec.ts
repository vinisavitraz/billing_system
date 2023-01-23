import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { billing, payment, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { InvalidArgumentException } from 'src/app/exception/invalid-argument.exception';
import { DatabaseService } from 'src/database/database.service';
import { JobEntity } from 'src/job/entity/job.entity';
import { JobService } from 'src/job/job.service';
import { MailService } from 'src/mail/mail.service';
import { BillingService } from './billing.service';
import { PaymentEntity } from './entity/payment.entity';
import { ExecutePaymentResponse } from './response/execute-payment.response';
import { SaveBillingsFileResponse } from './response/save-billings-file.response';
import * as fs from 'fs';
import * as csvToJson from 'csvtojson';

describe('BillingService', () => {
  let service: BillingService;
  let jobService: JobService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingService, DatabaseService, MailService, JobService],
    }).compile();

    service = module.get<BillingService>(BillingService);
    jobService = module.get<JobService>(JobService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('test execute read_csv pending jobs without pending jobs', () => {
    it('should not create new billing', async () => {
      const getJobsSpy = jest.spyOn(jobService, 'getPendingJobsFromQueue').mockImplementation(async (queue: string) => {return []});
      const createBillingsSpy = jest.spyOn(service as any, 'createBillingsFromCSVFile');
      const updateJobStatusSpy = jest.spyOn(jobService, 'updateJobStatus');

      await service.executeReadCSVPendingJobs();

      expect(getJobsSpy).toHaveBeenCalledWith('read_csv');    
      expect(createBillingsSpy).not.toBeCalled();    
      expect(updateJobStatusSpy).not.toBeCalled();
    });
  });

  describe('test execute read_csv pending jobs with pending jobs', () => {
    it('should create new billing and update job status', async () => {
      const getJobsSpy = jest.spyOn(jobService, 'getPendingJobsFromQueue').mockImplementation(async (queue: string) => {return [
        new JobEntity(1, queue, '123', 'pending')
      ]});
      const createBillingsSpy = jest.spyOn(service as any, 'createBillingsFromCSVFile').mockImplementation(async (fileName: string, maxBatchSize: number) => {return ;});
      const updateJobStatusSpy = jest.spyOn(jobService, 'updateJobStatus').mockImplementation(async (id: number, status: string) => {
        return new JobEntity(id, 'read_csv', '123', status);
      });

      await service.executeReadCSVPendingJobs();

      expect(getJobsSpy).toHaveBeenCalledWith('read_csv');    
      expect(createBillingsSpy).toHaveBeenCalledWith('123', 250);
      expect(updateJobStatusSpy).toHaveBeenCalledWith(1, 'executed');
    });
  });

  describe('test check billings due date', () => {
    it('should not find billings', async () => {
      const getExpiringBillingsSpy = jest.spyOn(service.repository as any, 'findExpiringBillings').mockImplementation(async (remindAfterDate: Date) => {return []});
      const getExpiredBillingsSpy = jest.spyOn(service.repository as any, 'findExpiredBillings').mockImplementation(async (remindAfterDate: Date) => {return []});
      const sendPaymentReminderSpy = jest.spyOn(mailService, 'sendPaymentReminderMail');
      const updateBillingStatusSpy = jest.spyOn(service.repository as any, 'updateBillingStatus');

      await service.checkBillingsDueDateAndUpdateStatus();

      expect(getExpiringBillingsSpy).toBeCalled();  
      expect(getExpiredBillingsSpy).toBeCalled();  
      expect(sendPaymentReminderSpy).not.toBeCalled();
      expect(updateBillingStatusSpy).not.toBeCalled();
    });
  });

  describe('test check billings due date', () => {
    it('should find expiring billings', async () => {
      const dueDate: Date = new Date();
      const getExpiringBillingsSpy = jest.spyOn(service.repository as any, 'findExpiringBillings').mockImplementation(async (remindAfterDate: Date) => {return [
        {
          id: '12',
          government_id: '11111111111',
          email: 'test@mail.com',
          name: 'John Doe',
          amount: new Prisma.Decimal(1),
          due_date: dueDate,
          status: 'pending_payment',
        }
      ]});
      const sendPaymentReminderSpy = jest.spyOn(mailService, 'sendPaymentReminderMail').mockImplementation(
        async (email: string, id: string, name: string, amount: number, dueDate: Date) => {return;}
      );
      const getExpiredBillingsSpy = jest.spyOn(service.repository as any, 'findExpiredBillings').mockImplementation(async (remindAfterDate: Date) => {return []});
      const updateBillingStatusSpy = jest.spyOn(service.repository as any, 'updateBillingStatus');

      await service.checkBillingsDueDateAndUpdateStatus();

      expect(getExpiringBillingsSpy).toBeCalled();  
      expect(getExpiredBillingsSpy).toBeCalled();  
      expect(sendPaymentReminderSpy).toBeCalledWith(
        'test@mail.com',
        '12',
        'John Doe',
        1,
        dueDate
      );
      expect(updateBillingStatusSpy).not.toBeCalled();
    });
  });

  describe('test check billings due date', () => {
    it('should find expired billings', async () => {
      const dueDate: Date = new Date();
      const getExpiringBillingsSpy = jest.spyOn(service.repository as any, 'findExpiringBillings').mockImplementation(async (remindAfterDate: Date) => {return []});
      const getExpiredBillingsSpy = jest.spyOn(service.repository as any, 'findExpiredBillings').mockImplementation(async (remindAfterDate: Date) => {return [
        {
          id: '12',
          government_id: '11111111111',
          email: 'test@mail.com',
          name: 'John Doe',
          amount: 1,
          due_date: dueDate,
          status: 'pending_payment',
        }
      ]});
      const sendPaymentReminderSpy = jest.spyOn(mailService, 'sendPaymentReminderMail');
      const updateBillingStatusSpy = jest.spyOn(service.repository as any, 'updateBillingStatus').mockImplementation(async (billingId: string, status: string) => {return {
        id: billingId,
        government_id: '11111111111',
        email: 'test@mail.com',
        name: 'John Doe',
        amount: 1,
        due_date: dueDate,
        status: status,
      }});;

      await service.checkBillingsDueDateAndUpdateStatus();

      expect(getExpiringBillingsSpy).toBeCalled();  
      expect(getExpiredBillingsSpy).toBeCalled();  
      expect(sendPaymentReminderSpy).not.toBeCalled();
      expect(updateBillingStatusSpy).toBeCalledWith('12', 'expired');
    });
  });

  describe('test schedule new job to read csv with invalid file name', () => {
    it('should throw invalid argument exception', async () => {
      await expect(service.scheduleReadCSVJob(''))
        .rejects
        .toThrow(InvalidArgumentException);        
    });
  });

  describe('test schedule new job to read csv', () => {
    it('should create new job and added to queue response', async () => {
      const createJobSpy = jest.spyOn(jobService, 'createJob').mockImplementation(async (queue: string, fileName: string) => {
        return new JobEntity(1, 'read_csv', '123', 'pending');
      });

      const response: SaveBillingsFileResponse = await service.scheduleReadCSVJob('testFile');

      expect(response.status).toEqual('Added to processing queue. Billings will be created in a few seconds.')
    });
  });

  const mockPaymentValidInput = [
    {
      billingAmount: 10,
      payments: [
        {
          id: 1,
          paid_at: new Date('2023-01-24 10:00:00'),
          paid_amount: new Prisma.Decimal(1),
          paid_by: 'John Doe',
          billing_id: '8291',
        }
      ],
      paymentAmount: 5,
      expectedStatus: 'pending_payment'
    },
    {
      billingAmount: 10,
      payments: [],
      paymentAmount: 5,
      expectedStatus: 'pending_payment'
    },
    {
      billingAmount: 10,
      payments: [
        {
          id: 1,
          paid_at: new Date('2023-01-24 10:00:00'),
          paid_amount: new Prisma.Decimal(5),
          paid_by: 'John Doe',
          billing_id: '8291',
        }
      ],
      paymentAmount: 5,
      expectedStatus: 'paid'
    },
    {
      billingAmount: 10,
      payments: [],
      paymentAmount: 10,
      expectedStatus: 'paid'
    },
  ];

  describe.each(mockPaymentValidInput)('test execute payment with valid input', (input) => {
    it('should execute payment and return billing status', async () => {
      const findBillingSpy = jest.spyOn(service as any, 'findBillingByIdOrCry').mockImplementation(async (billingId: string) => {
        return {
          id: billingId,
          government_id: '11111111111',
          email: 'test@mail.com',
          name: 'John Doe',
          amount: new Prisma.Decimal(input.billingAmount),
          due_date: new Date('2023-01-31 23:59:59'),
          status: 'pending_payment',
        };
      });
      const findPaymentsSpy = jest.spyOn(service.repository as any, 'findBillingPayments').mockImplementation(async (billingId: string) => {
        return input.payments;
      });
      const createPaymentSpy = jest.spyOn(service.repository as any, 'executePayment').mockImplementation(
        async (paidAmount: number, paidAt: Date, paidBy: string, billingId: string) => {
        return {
          id: 1,
          paid_at: paidAt,
          paid_amount: new Prisma.Decimal(paidAmount),
          paid_by: paidBy,
          billing_id: billingId,
        }
      });
      const updateBillingStatusSpy = jest.spyOn(service.repository as any, 'updateBillingStatus').mockImplementation(async (billingId: string, status: string) => {return {
        id: billingId,
        government_id: '11111111111',
        email: 'test@mail.com',
        name: 'John Doe',
        amount: new Prisma.Decimal(input.billingAmount),
        due_date: new Date('2023-01-31 23:59:59'),
        status: status,
      }});

      const paymentEntity: PaymentEntity = new PaymentEntity(
        '8291',
        new Date('2023-01-27 11:00:00'),
        input.paymentAmount,
        'John Doe',
      );

      const executePaymentResponse: ExecutePaymentResponse = await service.executePayment(paymentEntity);

      expect(executePaymentResponse.debtStatus).toEqual(input.expectedStatus);
    });
  });

  describe('test create billings from csv file with valid file', () => {
    it('should create billings and log message', async () => {
      const createJobSpy = jest.spyOn(service as any, 'readAndDeleteFile').mockImplementation(async (filePath: string) => {
        return [
          {
            name: 'John Doe',
            governmentId: '11111111111',
            email: 'test@mail.com',
            debtAmount: 100,
            debtDueDate: '2023-01-31',
            debtId: '8291',
          },
      ]});
      const mapFileContentSpy = jest.spyOn(service as any, 'mapFileContentToBillings').mockImplementation(async (fileRowsJson: []) => {
        return [
          {
            name: 'John Doe',
            government_id: '11111111111',
            email: 'test@mail.com',
            id: '8291',
            amount: 100,
            due_date: new Date('2023-01-31 23:59:59'),
            status: 'pending_payment',
          },
      ]});
      const mapCreateBillingsSpy = jest.spyOn(service.repository as any, 'createNewBillings').mockImplementation(async (billingsInput: []) => {return ;});
      const sendMailSpy = jest.spyOn(mailService, 'sendInvoiceCreatedMail');
      const consoleSpy: any = jest.spyOn(console, 'log');
      
      await service['createBillingsFromCSVFile']('filePath', 250);

      expect(mapCreateBillingsSpy).toHaveBeenCalledWith(
        [
          {
            name: 'John Doe',
            government_id: '11111111111',
            email: 'test@mail.com',
            id: '8291',
            amount: 100,
            due_date: new Date('2023-01-31 23:59:59'),
            status: 'pending_payment',
          },
        ],
      );
      expect(sendMailSpy).toHaveBeenCalledWith('test@mail.com', '8291', 'John Doe', 100, new Date('2023-01-31 23:59:59'));
      expect(consoleSpy).toHaveBeenCalledWith('File processed with success.');
    });
  });

  describe('test create billings from csv file with valid file', () => {
    it('should create billings in batches and log message', async () => {
      const createJobSpy = jest.spyOn(service as any, 'readAndDeleteFile').mockImplementation(async (filePath: string) => {
        return [
          {
            name: 'John Doe',
            governmentId: '11111111111',
            email: 'test@mail.com',
            debtAmount: 100,
            debtDueDate: '2023-01-31',
            debtId: '8291',
          },
          {
            name: 'John Doe',
            governmentId: '11111111111',
            email: 'test@mail.com',
            debtAmount: 1000,
            debtDueDate: '2023-01-31',
            debtId: '8292',
          },
      ]});
      const mapFileContentSpy = jest.spyOn(service as any, 'mapFileContentToBillings').mockImplementation(async (fileRowsJson: []) => {
        return [
          {
            name: 'John Doe',
            government_id: '11111111111',
            email: 'test@mail.com',
            id: '8291',
            amount: 100,
            due_date: new Date('2023-01-31 23:59:59'),
            status: 'pending_payment',
          },
          {
            name: 'John Doe',
            government_id: '11111111111',
            email: 'test@mail.com',
            id: '8292',
            amount: 1000,
            due_date: new Date('2023-01-31 23:59:59'),
            status: 'pending_payment',
          },
      ]});
      const mapCreateBillingsSpy = jest.spyOn(service.repository as any, 'createNewBillings').mockImplementation(async (billingsInput: []) => {return ;});
      const sendMailSpy = jest.spyOn(mailService, 'sendInvoiceCreatedMail');
      const consoleSpy: any = jest.spyOn(console, 'log');
      
      await service['createBillingsFromCSVFile']('filePath', 1);

      expect(mapCreateBillingsSpy).toBeCalledTimes(2);
      expect(sendMailSpy).toBeCalledTimes(2);
      expect(consoleSpy).toBeCalledWith('Processing file in batches.');
    });
  });


  describe('find billing by ID', () => {
    it('should return billing', async () => {
      const dueDate: Date = new Date();
      const createJobSpy = jest.spyOn(service.repository as any, 'findBillingById').mockImplementation(async (billingId: string) => {
        return {
          id: billingId,
          government_id: '11111111111',
          email: 'test@mail.com',
          name: 'John Doe',
          amount: new Prisma.Decimal(10),
          due_date: dueDate,
          status: 'pending_payment',
        };
      });

      const billing: billing = await service['findBillingByIdOrCry']('8291');

      expect(billing).toEqual(
        {
          id: '8291',
          government_id: '11111111111',
          email: 'test@mail.com',
          name: 'John Doe',
          amount: new Prisma.Decimal(10),
          due_date: dueDate,
          status: 'pending_payment',
        }
      );
    });
  });

  describe('find billing by ID', () => {
    it('should throw not found exception', async () => {
      const createJobSpy = jest.spyOn(service.repository as any, 'findBillingById').mockImplementation(async (billingId: string) => {
        return null;
      });

      await expect(service['findBillingByIdOrCry']('8291'))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('validate billing state with invalid payment date', () => {
    it('should throw exception for payment date above debt due date', () => {
      const paymentDate: Date = new Date();
      paymentDate.setDate(paymentDate.getDate() + 1);
      const dueDate: Date = new Date();
      const paymentEntity: PaymentEntity = new PaymentEntity(
        '8291',
        paymentDate,
        100000.00,
        'John Doe',
      );
  
      expect(() => { 
        service['validateBillingState'](
          {
            id: '1',
            government_id: '11111111111',
            email: 'test@mail.com',
            name: 'test',
            amount: new Decimal(2),
            due_date: dueDate,
            status: 'pending_payment',
          },
          paymentEntity
        )
       }).toThrow('Payment date after debt due date. Payment not allowed.'); 
    });
  });
  
  describe('validate billing state with invalid billing status', () => {
    it('should throw exception for debt not allowed/pending', () => {
      const paymentDate: Date = new Date();
      paymentDate.setDate(paymentDate.getDate() - 1);
      const dueDate: Date = new Date();
      const paymentEntity: PaymentEntity = new PaymentEntity(
        '8291',
        paymentDate,
        100000.00,
        'John Doe',
      );
  
      expect(() => { 
        service['validateBillingState'](
          {
            id: '1',
            government_id: '11111111111',
            email: 'test@mail.com',
            name: 'test',
            amount: new Decimal(2),
            due_date: dueDate,
            status: 'paid',
          },
          paymentEntity
        )
       }).toThrow('Debt not allowed to receive payments.'); 
    });
  });

  describe('validate billing and payment amounts with invalid payment amount', () => {
    it('should throw exception when payment amount greater', () => {
      expect(() => { 
        service['validateBillingAndPaymentAmounts'](
          1,
          2
        )
       }).toThrow('Payment amount is greater than debt amount.'); 
    });
  });
  
  describe('validate billing and payment amounts with valid payment amount', () => {
    it('should not throw exception when debt amount greater', () => {
      expect(() => { 
        service['validateBillingAndPaymentAmounts'](
          2,
          1
        )
       }).not.toThrow('Payment amount is greater than debt amount.'); 
    });
  });

  const mockBillingPayments = [
    {
      billingAmount: 10,
      payments: [
        {
          id: 1,
          paid_at: new Date(),
          paid_amount: new Prisma.Decimal(1),
          paid_by: 'John Doe',
          billing_id: '8291',
        }
      ],
      expectedAmount: 9,
    },
    {
      billingAmount: 10,
      payments: [
        {
          id: 1,
          paid_at: new Date(),
          paid_amount: new Prisma.Decimal(5),
          paid_by: 'John Doe',
          billing_id: '8291',
        }
      ],
      expectedAmount: 5,
    },
    {
      billingAmount: 10,
      payments: [],
      expectedAmount: 10,
    },
  ];

  describe.each(mockBillingPayments)('test calculate remaining payment amount', (billingPayments) => {
    it('should return expected amount', async () => {
      const remainingAmount: number = service['calculateRemainingPaymentAmount'](billingPayments.billingAmount, billingPayments.payments);

      expect(remainingAmount).toEqual(billingPayments.expectedAmount);
    });
  });

  describe('test create payment', () => {
    it('should create payment with expected arguments', async () => {
      const paidAt: Date = new Date();

      const executePaymentSpy = jest.spyOn(service.repository as any, 'executePayment').mockImplementation(
        async (paidAmount: number, paidAt: Date, paidBy: string, billingId: string) => {
        return {
          id: 1,
          paid_at: paidAt,
          paid_amount: new Prisma.Decimal(paidAmount),
          paid_by: paidBy,
          billing_id: billingId,
        }
      });
      const paymentEntity: PaymentEntity = new PaymentEntity(
        '8291',
        paidAt,
        100,
        'John Doe',
      );

      const payment: payment = await service['createPayment']('8291', paymentEntity);

      expect(payment).toEqual({
        id: 1,
        paid_at: paidAt,
        paid_amount: new Prisma.Decimal(100),
        paid_by: 'John Doe',
        billing_id: '8291',
      });
    });
  });

  describe('test map file content to billings payment', () => {
    it('should return expected billings input', async () => {
      const fileRows: any[] = [{
        name: 'John Doe',
        governmentId: '11111111111',
        email: 'test@mail.com',
        debtAmount: 100,
        debtDueDate: '2023-01-31',
        debtId: '8291',
      }];
      const findBillingSpy = jest.spyOn(service.repository as any, 'findBillingById').mockImplementation(async (billingId: string) => {
        return null;
      });
      const expectedBillingInput: object = [
        {
          name: 'John Doe',
          government_id: '11111111111',
          email: 'test@mail.com',
          id: '8291',
          amount: 100,
          due_date: new Date('2023-01-31 23:59:59'),
          status: 'pending_payment',
        }
      ];

      const billingsInput: object[] = await service['mapFileContentToBillings'](fileRows);

      expect(expectedBillingInput).toEqual(billingsInput);
    });
  });

  describe('test map file content to billings payment with invalid file row', () => {
    it('should skip billing and log message', async () => {
      const consoleSpy: any = jest.spyOn(console, 'log');
      const fileRows: any[] = [{
        name: 123,
        governmentId: '11111111111',
        email: 'test@mail.com',
        debtAmount: 100,
        debtDueDate: '2023-01-31',
        debtId: '8291',
      }];
      const findBillingSpy = jest.spyOn(service.repository as any, 'findBillingById').mockImplementation(async (billingId: string) => {
        return null;
      });
      const expectedBillingInput: object = [];

      const billingsInput: object[] = await service['mapFileContentToBillings'](fileRows);

      expect(expectedBillingInput).toEqual(billingsInput);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid content. Skipping row 0');    
    });
  });

  describe('test map file content to billings payment with billing already on database', () => {
    it('should skip billing and log message', async () => {
      const consoleSpy: any = jest.spyOn(console, 'log');
      const fileRows: any[] = [{
        name: 'John Doe',
        governmentId: '11111111111',
        email: 'test@mail.com',
        debtAmount: 100,
        debtDueDate: '2023-01-31',
        debtId: '8291',
      }];
      const findBillingSpy = jest.spyOn(service.repository as any, 'findBillingById').mockImplementation(
        async (billingId: string) => {
          return {
            id: 1,
            paid_at: new Date('2023-01-25 10:00:00'),
            paid_amount: new Prisma.Decimal(100),
            paid_by: 'John Doe',
            billing_id: billingId,
          }
      });
      const expectedBillingInput: object = [];

      const billingsInput: object[] = await service['mapFileContentToBillings'](fileRows);

      expect(expectedBillingInput).toEqual(billingsInput);
      expect(consoleSpy).toHaveBeenCalledWith('Billing with debtId 8291 already on database. Skipping row 0');    
    });
  });

  const mockValidFileRowContent = [
    {
      name: 'John Doe',
      governmentId: '11111111111',
      email: 'test@mail.com',
      debtAmount: 100,
      debtDueDate: '2023-01-31 10:00:00',
      debtId: '8291',
    },
  ];

  describe.each(mockValidFileRowContent)('test validate file row with valid content', (validFileRow) => {
    it('should not throw invalid argument exception', async () => {
      expect(() => { service['validateFileRow'](validFileRow); })
      .not.toThrow(InvalidArgumentException);
    });
  });

  const mockInvalidFileRowContent = [
    {
      name: 123,
      governmentId: '11111111111',
      email: 'test@mail.com',
      debtAmount: 100,
      debtDueDate: '2023-01-31 10:00:00',
      debtId: '8291',
    },
    {
      name: 'John Doe',
      governmentId: 123,
      email: 'test@mail.com',
      debtAmount: 100,
      debtDueDate: '2023-01-31 10:00:00',
      debtId: '8291',
    },
    {
      name: 'John Doe',
      governmentId: '11111111111',
      email: 123,
      debtAmount: 100,
      debtDueDate: '2023-01-31 10:00:00',
      debtId: '8291',
    },
    {
      name: 'John Doe',
      governmentId: '11111111111',
      email: 'test@mail.com',
      debtAmount: 'abc',
      debtDueDate: '2023-01-31 10:00:00',
      debtId: '8291',
    },
    {
      name: 'John Doe',
      governmentId: '11111111111',
      email: 'test@mail.com',
      debtAmount: 100,
      debtDueDate: 'abc',
      debtId: '8291',
    },
    {
      name: 'John Doe',
      governmentId: '11111111111',
      email: 'test@mail.com',
      debtAmount: 100,
      debtDueDate: '2023-01-31 10:00:00',
      debtId: 8291,
    },
    {
      governmentId: '11111111111',
      email: 'test@mail.com',
      debtDueDate: '2023-01-31 10:00:00',
      debtId: '8291',
    },
  ];

  describe.each(mockInvalidFileRowContent)('test validate file row with invalid content', (invalidFileRow) => {
    it('should throw invalid argument exception', async () => {
      expect(() => { service['validateFileRow'](invalidFileRow); })
      .toThrow(InvalidArgumentException);
    });
  });


});
