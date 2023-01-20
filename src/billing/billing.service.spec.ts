import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime';
import { DatabaseService } from 'src/database/database.service';
import { JobService } from 'src/job/job.service';
import { MailService } from 'src/mail/mail.service';
import { BillingService } from './billing.service';
import { PaymentEntity } from './entity/payment.entity';

describe('BillingService', () => {
  let service: BillingService;
  let jobService: JobService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingService, DatabaseService, MailService, JobService],
    }).compile();

    service = module.get<BillingService>(BillingService);
    jobService = module.get<JobService>(JobService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find billing by ID or cry', () => {
    const dueDate: Date = new Date();
    databaseService.billing.findFirst = jest.fn().mockReturnValueOnce(
      {
        id: '1',
        government_id: '11111111111',
        email: 'test@mail.com',
        name: 'test',
        amount: 1,
        due_date: dueDate,
        status: 'pending',
      }
    );

    expect(service['findBillingByIdOrCry']('1')).resolves.toEqual(
      {
        id: '1',
        government_id: '11111111111',
        email: 'test@mail.com',
        name: 'test',
        amount: 1,
        due_date: dueDate,
        status: 'pending',
      }
    );    
  });

  it('validate payment date, should throw exception for payment date above debt due date', () => {
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

  it('validate debt status, should throw exception for debt not allowed/pending', () => {
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

  it('validate payment and debt amount, should throw exception when payment amount greater', () => {
    expect(() => { 
      service['validateBillingAndPaymentAmounts'](
        1,
        2
      )
     }).toThrow('Payment amount is greater than debt amount.'); 
  });

  it('validate payment and debt amount, should not throw exception when debt amount greater', () => {
    expect(() => { 
      service['validateBillingAndPaymentAmounts'](
        2,
        1
      )
     }).not.toThrow('Payment amount is greater than debt amount.'); 
  });

  it('validate payment and debt amount, should not throw exception when debt amount equal', () => {
    expect(() => { 
      service['validateBillingAndPaymentAmounts'](
        1,
        1
      )
     }).not.toThrow('Payment amount is greater than debt amount.'); 
  });

});
