import { Test, TestingModule } from '@nestjs/testing';
import { MailEntity } from './entity/mail.entity';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Test send invoice created mail', () => {
    it('should log expected invoice created mail', () => {
      const consoleSpy: any = jest.spyOn(console, 'log');
      const expectedBodyMail: string = `Olá testBillingTo! O boleto '123' foi gerado no seu nome com o valor de R$100.00. Voce tem até 17/01 para realizar o pagamento. Após essa data, o boleto será cancelado.`;
      const expectedMail: MailEntity = new MailEntity('testMailTo', 'Boleto gerado com sucesso', expectedBodyMail);

      service['sendInvoiceCreatedMail'](
        'testMailTo',
        '123',
        'testBillingTo',
        100,
        new Date('2023-01-17 23:59:59')
      );
  
      expect(consoleSpy).toHaveBeenCalledWith(expectedMail);    
    });
  });
  
  describe('Test send payment reminder mail', () => {
    it('should log expected payment reminder mail', () => {
      const consoleSpy: any = jest.spyOn(console, 'log');
      const expectedBodyMail: string = `Olá testBillingTo! Não esqueça de realizar o pagamento do boleto '123' no valor de R$100.00. Voce tem até 17/01 para realizar o pagamento. Após essa data, o boleto será cancelado.`;
      const expectedMail: MailEntity = new MailEntity('testMailTo', 'Lembrete: realize o pagamento do seu boleto', expectedBodyMail);
      
      service['sendPaymentReminderMail'](
        'testMailTo',
        '123',
        'testBillingTo',
        100,
        new Date('2023-01-17 23:59:59')
      );
  
      expect(consoleSpy).toHaveBeenCalledWith(expectedMail);    
    });
  });

  describe('Test send mail', () => {
    it('should log mail content', () => {
      const consoleSpy: any = jest.spyOn(console, 'log');
      const mailEntity: MailEntity = new MailEntity('testMailTo', 'testSubject', 'testBody');
      
      service['sendMail'](mailEntity);
  
      expect(consoleSpy).toHaveBeenCalledWith(mailEntity);    
    });
  });
  
  describe('Test build due date message', () => {
    it('should build expected due date message', () => {
      const billingDueDate: Date = new Date('2023-01-17 23:59:59');
      const expectedDueDateMessage: string = 'Voce tem até 17/01 para realizar o pagamento. Após essa data, o boleto será cancelado.';
      
      const dueDateMessage: string = service['builDueDateMessage'](billingDueDate);
  
      expect(dueDateMessage).toBe(expectedDueDateMessage);
    }); 
  }); 
  
  const mockDateStringCases = [
    {
      dateInput: 1,
      expectedFormattedDate: '01',
    },
    {
      dateInput: 10,
      expectedFormattedDate: '10',
    },
  ];

  describe.each(mockDateStringCases)(`Test append zeros to date string`, (dateStringCase) => {
    it('should append zeros according to expected case', () => {
      const date: string = service['appendZeroToDateIfNeeded'](dateStringCase.dateInput);
  
      expect(date).toBe(dateStringCase.expectedFormattedDate);
    }); 
  });
  
});
