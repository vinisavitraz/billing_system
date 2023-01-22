import { Test, TestingModule } from '@nestjs/testing';
import { billing, payment } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { BillingRepository } from './billing.repository';
import { BillingService } from './billing.service';

describe('BillingRepository', () => {
  
  let databaseService: DatabaseService;
  let repository: BillingRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);
    repository = new BillingRepository(databaseService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('test find billing by id with billing created', () => {
    it('should return billing', async () => {
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

      const billing: billing | null = await repository.findBillingById('1');
      
      expect(billing).toEqual({
          id: "1",
          government_id: '11111111111',
          email: 'test@mail.com',
          name: 'test',
          amount: 1,
          due_date: dueDate,
          status: 'pending',
        });
    });
  });
  
  describe('test find billing by id without billing created', () => {
    it('should return null', async () => {
      databaseService.billing.findFirst = jest.fn().mockReturnValueOnce(null);
      
      const billing: billing | null = await repository.findBillingById('1');
      
      expect(billing).toEqual(null);
    });
  });
  
  describe('test find expired billings', () => {
    it('should return expired billings', async () => {
      databaseService.billing.findMany = jest.fn().mockReturnValueOnce(
        [
          {
            id: '1',
            government_id: '11111111111',
            email: 'test@mail.com',
            name: 'test',
            amount: 1,
            due_date: new Date('2022-01-12 23:59:59'),
            status: 'pending',
          }
        ]
      );

      const expiredBillings: billing[] = await repository.findExpiredBillings();
      
      expect(expiredBillings).toEqual(
        [
          {
            id: "1",
            government_id: '11111111111',
            email: 'test@mail.com',
            name: 'test',
            amount: 1,
            due_date: new Date('2022-01-12 23:59:59'),
            status: 'pending',
          }
        ]
      );
    });
  });

  describe('test find expired billings', () => {
    it('should return empty list', async () => {
      databaseService.billing.findMany = jest.fn().mockReturnValueOnce([]);

      const expiredBillings: billing[] = await repository.findExpiredBillings();
      
      expect(expiredBillings).toEqual([]);
    });
  });
  
  describe('test find expiring billings', () => {
    it('should return expiring billings', async () => {
      const dueDate: Date = new Date();
      dueDate.setHours(dueDate.getHours() - 6);
      const remindAfterDate: Date = new Date();
      remindAfterDate.setDate(remindAfterDate.getDate() - BillingService.REMAINING_DAYS_TO_REMINDER_PAYMENT);
  
      databaseService.billing.findMany = jest.fn().mockReturnValueOnce(
        [
          {
            id: '1',
            government_id: '11111111111',
            email: 'test@mail.com',
            name: 'test',
            amount: 1,
            due_date: dueDate,
            status: 'pending',
          }
        ]
      );

      const expiringBillings: billing[] = await repository.findExpiringBillings(remindAfterDate);
      
      expect(expiringBillings).toEqual(
        [
          {
            id: '1',
            government_id: '11111111111',
            email: 'test@mail.com',
            name: 'test',
            amount: 1,
            due_date: dueDate,
            status: 'pending',
          }
        ]
      );
    });
  });

  describe('test find expiring billings', () => {
    it('should return empty list', async () => {
      const dueDate: Date = new Date();
      dueDate.setHours(dueDate.getHours() - 6);
      const remindAfterDate: Date = new Date();
      remindAfterDate.setDate(remindAfterDate.getDate() - BillingService.REMAINING_DAYS_TO_REMINDER_PAYMENT);
  
      databaseService.billing.findMany = jest.fn().mockReturnValueOnce([]);

      const expiringBillings: billing[] = await repository.findExpiringBillings(remindAfterDate);
      
      expect(expiringBillings).toEqual([]);
    });
  });

  describe('test find billing payments', () => {
    it('should return payments from billing', async () => {
      const paidAt: Date = new Date();
      databaseService.payment.findMany = jest.fn().mockReturnValueOnce(
        [
          {
            id: '1',
            paid_by: 'test',
            paid_amount: 1,
            paid_at: paidAt,
            billing_id: '123',
          }
        ]
      );

      const payments: payment[] = await repository.findBillingPayments('123');
      
      expect(payments).toEqual(
        [
          {
            id: '1',
            paid_by: 'test',
            paid_amount: 1,
            paid_at: paidAt,
            billing_id: '123',
          }
        ]
      );
    });
  });

  describe('test find billing payments', () => {
    it('should return empty list', async () => {
      const paidAt: Date = new Date();
      databaseService.payment.findMany = jest.fn().mockReturnValueOnce([]);

      const payments: payment[] = await repository.findBillingPayments('123');
      
      expect(payments).toEqual([]);
    });
  });
  
  describe('test save payment', () => {
    it('should save and return new payment', async () => {
      const paidAt: Date = new Date();
      databaseService.payment.create = jest.fn().mockReturnValueOnce(
        {
          id: '1',
          paid_by: 'test',
          paid_amount: 1,
          paid_at: paidAt,
          billing_id: '123',
        }
      );

      const payment: payment = await repository.executePayment(1, paidAt, 'test', '123');
      
      expect(payment).toEqual(
        {
          id: '1',
          paid_by: 'test',
          paid_amount: 1,
          paid_at: paidAt,
          billing_id: '123',
        }
      );
    });
  });
  
  describe('test update billing status', () => {
    it('should update billing status and return billing', () => {
      const dueDate: Date = new Date();
      databaseService.billing.update = jest.fn().mockReturnValueOnce(
        {
          id: '1',
          government_id: '11111111111',
          email: 'test@mail.com',
          name: 'test',
          amount: 1,
          due_date: dueDate,
          status: 'paid',
        }
      );
      
      expect(repository.updateBillingStatus('1', 'paid')).resolves.toEqual(
        {
          id: '1',
          government_id: '11111111111',
          email: 'test@mail.com',
          name: 'test',
          amount: 1,
          due_date: dueDate,
          status: 'paid',
        }
      );
    });
  });

});
