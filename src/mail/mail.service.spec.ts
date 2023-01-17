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

  it('should send invoice created mail', () => {
    const consoleSpy: any = jest.spyOn(console, 'log');
    const expectedBodyMail: string = `Olá testBillingTo!\nO boleto '123' foi gerado no seu nome com o valor de R$100.00.\nVoce tem até 17/01 para realizar o pagamento. Após essa data, o boleto será cancelado.`;
    const expectedLogMail: string = `
      SendTo: testMailTo \n
      Subject: Boleto gerado com sucesso \n
      Body: ${expectedBodyMail} \n
    `;
    
    service['sendInvoiceCreatedMail'](
      'testMailTo',
      '123',
      'testBillingTo',
      100,
      new Date('2023-01-17 23:59:59')
    );

    expect(consoleSpy).toHaveBeenCalledWith(expectedLogMail);    
  });

  it('should send payment reminder mail', () => {
    const consoleSpy: any = jest.spyOn(console, 'log');
    const expectedBodyMail: string = `Olá testBillingTo!\nNão esqueça de realizar o pagamento do boleto '123' no valor de R$100.00.\nVoce tem até 17/01 para realizar o pagamento. Após essa data, o boleto será cancelado.`;
    const expectedLogMail: string = `
      SendTo: testMailTo \n
      Subject: Lembrete: realize o pagamento do seu boleto \n
      Body: ${expectedBodyMail} \n
    `;
    
    service['sendPaymentReminderMail'](
      'testMailTo',
      '123',
      'testBillingTo',
      100,
      new Date('2023-01-17 23:59:59')
    );

    expect(consoleSpy).toHaveBeenCalledWith(expectedLogMail);    
  });

  it('should log mail', () => {
    const consoleSpy: any = jest.spyOn(console, 'log');
    const mailEntity: MailEntity = new MailEntity('testMailTo', 'testSubject', 'testBody');
    const expectedLogMail: string = `
      SendTo: ${mailEntity.mailTo} \n
      Subject: ${mailEntity.subject} \n
      Body: ${mailEntity.body} \n
    `;

    service['sendMail'](mailEntity);

    expect(consoleSpy).toHaveBeenCalledWith(expectedLogMail);    
  });

  it('should build due date message', () => {
    const billingDueDate: Date = new Date('2023-01-17 23:59:59');
    const expectedDueDateMessage: string = 'Voce tem até 17/01 para realizar o pagamento. Após essa data, o boleto será cancelado.';
    
    const dueDateMessage: string = service['builDueDateMessage'](billingDueDate);

    expect(dueDateMessage).toBe(expectedDueDateMessage);
  }); 

  it('should append zero to date', () => {
    const dateInput: number = 1;
    const expectedDate: string = '01';
    
    const date: string = service['appendZeroToDateIfNeeded'](dateInput);

    expect(date).toBe(expectedDate);
  }); 

  it('should not append zero to date', () => {
    const dateInput: number = 10;
    const expectedDate: string = '10';
    
    const date: string = service['appendZeroToDateIfNeeded'](dateInput);

    expect(date).toBe(expectedDate);
  }); 
  
});
