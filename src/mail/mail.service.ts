import { Injectable } from '@nestjs/common';
import { ArgumentValidator } from 'src/app/validator/argument.validator';
import { MailEntity } from './entity/mail.entity';

@Injectable()
export class MailService {

  public sendInvoiceCreatedMail(
    mailTo: string, 
    billingId: string,
    billingTo: string,
    billingAmount: number,
    billingDueDate: Date,
  ): void {
    ArgumentValidator.validate(mailTo, 'mailTo', 'string');
    ArgumentValidator.validate(billingId, 'billingId', 'string');
    ArgumentValidator.validate(billingTo, 'billingTo', 'string');
    ArgumentValidator.validate(billingAmount, 'billingAmount', 'number');

    const dueDateMessage: string = this.builDueDateMessage(billingDueDate);
    const mailEntity: MailEntity = new MailEntity(
      mailTo, 
      'Boleto gerado com sucesso', 
      `Olá ${billingTo}! O boleto '${billingId}' foi gerado no seu nome com o valor de R$${billingAmount.toFixed(2)}. ` + dueDateMessage,
    );

    this.sendMail(mailEntity);
  }

  public sendPaymentReminderMail(
    mailTo: string, 
    billingId: string,
    billingTo: string,
    billingAmount: number,
    billingDueDate: Date,
  ): void {
    ArgumentValidator.validate(mailTo, 'mailTo', 'string');
    ArgumentValidator.validate(billingId, 'billingId', 'string');
    ArgumentValidator.validate(billingTo, 'billingTo', 'string');
    ArgumentValidator.validate(billingAmount, 'billingAmount', 'number');
    
    const dueDateMessage: string = this.builDueDateMessage(billingDueDate);
    const mailEntity: MailEntity = new MailEntity(
      mailTo, 
      'Lembrete: realize o pagamento do seu boleto', 
      `Olá ${billingTo}! Não esqueça de realizar o pagamento do boleto '${billingId}' no valor de R$${billingAmount.toFixed(2)}. ` + dueDateMessage,
    );

    this.sendMail(mailEntity);
  }

  private sendMail(mailEntity: MailEntity): void {
    console.log(mailEntity);
  }

  private builDueDateMessage(billingDueDate: Date): string {
    const dayDueDate: number = billingDueDate.getDate();
    const monthdueDate: number = (billingDueDate.getMonth() + 1);
    const formattedDayDueDate: string = this.appendZeroToDateIfNeeded(dayDueDate);
    const formattedMonthDueDate: string = this.appendZeroToDateIfNeeded(monthdueDate);

    return `Voce tem até ${formattedDayDueDate}/${formattedMonthDueDate} para realizar o pagamento. Após essa data, o boleto será cancelado.`;
  }

  private appendZeroToDateIfNeeded(date: number): string {
    return date <= 9 ? '0' + date.toString() : date.toString();
  }

}
