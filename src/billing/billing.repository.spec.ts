import { Test, TestingModule } from '@nestjs/testing';
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

  it('should find billing by id', () => {
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
    
    expect(repository.findBillingById('1')).resolves.toEqual({
        id: "1",
        government_id: '11111111111',
        email: 'test@mail.com',
        name: 'test',
        amount: 1,
        due_date: dueDate,
        status: 'pending',
      });
  });

  it('should not find billing by id', () => {
    databaseService.billing.findFirst = jest.fn().mockReturnValueOnce(null);
    
    expect(repository.findBillingById('1')).resolves.toEqual(null);
  });

  it('should return expired billings', () => {
    databaseService.billing.findFirst = jest.fn().mockReturnValueOnce(
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
    
    expect(repository.findExpiredBillings()).resolves.toEqual(
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

  it('should return expiring billings', () => {
    const dueDate: Date = new Date();
    dueDate.setHours(dueDate.getHours() - 6);
    const remindAfterDate: Date = new Date();
    remindAfterDate.setDate(remindAfterDate.getDate() - BillingService.REMAINING_DAYS_TO_REMINDER_PAYMENT);

    databaseService.billing.findFirst = jest.fn().mockReturnValueOnce(
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
    
    expect(repository.findExpiringBillings(remindAfterDate)).resolves.toEqual(
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

  it('should return payments from billing', () => {
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
    
    expect(repository.findBillingPayments('123')).resolves.toEqual(
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

  it('should save payment', () => {
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
    
    expect(repository.executePayment(1, paidAt, 'test', '123')).resolves.toEqual(
      {
        id: '1',
        paid_by: 'test',
        paid_amount: 1,
        paid_at: paidAt,
        billing_id: '123',
      }
    );
  });

  it('should update billing status', () => {
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
