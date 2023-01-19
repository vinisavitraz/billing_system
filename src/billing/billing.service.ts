import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { JobEntity } from 'src/job/entity/job.entity';
import { JobService } from 'src/job/job.service';
import { BillingRepository } from './billing.repository';
import { SaveBillingsFileResponse } from './response/save-billings-file.response';
import * as csvToJson from 'csvtojson';
import * as fs from 'fs';
import { PaymentEntity } from './entity/payment.entity';
import { billing, payment } from '@prisma/client';
import { ExecutePaymentResponse } from './response/execute-payment.response';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class BillingService {

  public static PENDING_PAYMENT: string = 'pending_payment';
  public static CANCELED: string = 'canceled';
  public static EXPIRED: string = 'expired';
  public static PAID: string = 'paid';
  public static EXECUTED: string = 'executed';
  public static CSV_FILES_BASE_PATH: string = './files/csv/';
  public static BATCH_SIZE: number = 250;
  public static REMAINING_DAYS_TO_REMINDER_PAYMENT: number = 1;

  private readonly repository: BillingRepository;

  constructor(
    private readonly jobService: JobService, 
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService
  ) {
    this.repository = new BillingRepository(this.databaseService);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private async executeReadCSVPendingJobs(): Promise<void> {
    const pendingJobs: JobEntity[] = await this.jobService.getPendingJobsFromQueue(JobService.READ_CSV_QUEUE);
    
    for (let i = 0; i < pendingJobs.length; i++) {
      const pendingJob: JobEntity = pendingJobs[i];
      await this.createBillingsFromCSVFile(pendingJob.reference);
      await this.jobService.updateJobStatus(pendingJob.id, BillingService.EXECUTED);
    }
  }
  
  //@Cron(CronExpression.EVERY_DAY_AT_1AM)
  @Cron(CronExpression.EVERY_10_SECONDS)
  private async checkBillingsDueDateAndUpdateStatus(): Promise<void> {
    const remindAfterDate: Date = new Date();
    remindAfterDate.setDate(remindAfterDate.getDate() - BillingService.REMAINING_DAYS_TO_REMINDER_PAYMENT);

    const expiringBillings: billing[] = await this.repository.findExpiringBillings(remindAfterDate);
    
    for (let i = 0; i < expiringBillings.length; i++) {
      const billing: billing = expiringBillings[i];
      this.mailService.sendPaymentReminderMail(
        billing.email,
        billing.debt_id,
        billing.name,
        billing.amount.toNumber(),
        billing.due_date,
      );
    }
    
    const expiredBillings: billing[] = await this.repository.findExpiredBillings();
    
    for (let i = 0; i < expiredBillings.length; i++) {
      
      const billing: billing = expiredBillings[i];
      await this.repository.updateBillingStatus(billing.id, BillingService.EXPIRED);
    }
  }

  public async scheduleReadCSVJob(fileName: string): Promise<SaveBillingsFileResponse> {
    await this.jobService.createJob(JobService.READ_CSV_QUEUE, fileName);

    return new SaveBillingsFileResponse('Added to queue');
  }

  public async executePayment(paymentEntity: PaymentEntity): Promise<ExecutePaymentResponse> {
    let billing: billing | null = await this.findBillingByDebtIdOrCry(paymentEntity.debtId);

    this.validateBillingState(billing, paymentEntity);
    this.validateDebtAndPaymentAmounts(billing.amount.toNumber(), paymentEntity.paidAmount);

    const payments: payment[] = await this.repository.findBillingPayments(billing.id);
    let paymentRemainingAmount: number = billing.amount.toNumber();

    if (payments.length > 0) {
      paymentRemainingAmount = this.calculatePaymentRemainingAmount(paymentRemainingAmount, payments);
    }

    this.validateDebtAndPaymentAmounts(paymentRemainingAmount, paymentEntity.paidAmount);

    if (paymentEntity.paidAmount === paymentRemainingAmount) {
      await this.createPayment(billing.id, paymentEntity);
      await this.repository.updateBillingStatus(billing.id, BillingService.PAID);

      return new ExecutePaymentResponse(BillingService.PAID);
    }

    await this.createPayment(billing.id, paymentEntity);

    return new ExecutePaymentResponse(BillingService.PENDING_PAYMENT);
  }

  private async createBillingsFromCSVFile(fileName: string): Promise<void> {
    const filePath: string = BillingService.CSV_FILES_BASE_PATH + fileName;
    const fileRowsJson: any[] = await csvToJson().fromFile(filePath);
    
    await fs.promises.unlink(filePath);
    
    if (fileRowsJson.length === 0) {
      console.log('Invalid file content.');
    }

    const billingsInput: object[] = await this.mapFileContentToBillings(fileRowsJson);

    if (billingsInput.length > BillingService.BATCH_SIZE) {
      console.log('File will be processed in batches.');
      for (let i = 0; i < billingsInput.length; i += BillingService.BATCH_SIZE) {
        await this.createNewBillings(billingsInput.slice(i, i + BillingService.BATCH_SIZE));
      }
      return;
    }
    
    await this.createNewBillings(billingsInput);
    
    billingsInput.forEach((billingInput: any) => {
      this.mailService.sendInvoiceCreatedMail(
        billingInput.email,
        billingInput.debt_id,
        billingInput.name,
        billingInput.amount,
        billingInput.due_date,
      );
    });

    console.log('File processed with success.');
  }

  private async findBillingByDebtIdOrCry(debtId: string): Promise<billing> {
    const billing: billing | null = await this.repository.findBillingByDebtId(debtId);

    if (!billing) {
      throw new HttpException(
        'Debt with ID `' + debtId + '` not found.',
        HttpStatus.NOT_FOUND, 
      );
    }

    return billing;
  }

  private validateBillingState(billing: billing, paymentEntity: PaymentEntity): void {
    if (billing.due_date.getTime() <= paymentEntity.paidAt.getTime()) {
      throw new HttpException(
        'Payment date after debt due date. Payment not allowed.',
        HttpStatus.UNPROCESSABLE_ENTITY, 
      );
    }

    if (billing.status !== BillingService.PENDING_PAYMENT) {
      throw new HttpException(
        'Debt not allowed to receive payments.',
        HttpStatus.UNPROCESSABLE_ENTITY, 
      );
    }
  }

  private validateDebtAndPaymentAmounts(debtAmount: number, paymentAmount: number): void {
    if (paymentAmount > debtAmount) {
      throw new HttpException(
        'Payment amount is greater than debt amount.',
        HttpStatus.UNPROCESSABLE_ENTITY, 
      );
    }
  }

  private calculatePaymentRemainingAmount(debtAmount: number, payments: payment[]): number {
    let totalPaidAmount: number = 0;

    payments.forEach((payment: payment) => {
      totalPaidAmount += payment.paid_amount.toNumber();
    });

    return debtAmount - totalPaidAmount;
  }

  private async createPayment(billingId: number, paymentEntity: PaymentEntity): Promise<payment> {
    return await this.repository.executePayment(
      paymentEntity.paidAmount,
      new Date(paymentEntity.paidAt),
      paymentEntity.paidBy,
      billingId,
    );
  }

  private async createNewBillings(billingsInput: object[]): Promise<void> {
    await this.repository.createNewBillings(billingsInput);
  }

  private async mapFileContentToBillings(fileRowsJson: any[]): Promise<object[]> {
    const billingsInput: object[] = [];

    for (let i = 0; i < fileRowsJson.length; i++) {
      const fileRow: any = fileRowsJson[i];
      
      if (!this.validateFileRow(fileRow)) {
        console.log('Invalid row content. Skipping row ' + i);
        continue;
      }

      const billing: billing | null = await this.repository.findBillingByDebtId(fileRow['debtId']);

      if (billing) {
        console.log('Billing with debtId ' + fileRow['debtId'] + ' already on database. Skipping row ' + i);
        continue;
      }

      billingsInput.push(this.buildBillingInput(fileRow));
    }

    return billingsInput;
  }

  private buildBillingInput(fileRow: any): object {
    return {
      name: fileRow['name'],
      government_id: fileRow['governmentId'],
      email: fileRow['email'],
      debt_id: fileRow['debtId'],
      amount: Number(fileRow['debtAmount']),
      due_date: new Date(fileRow['debtDueDate'] + ' 23:59:59'),
      status: BillingService.PENDING_PAYMENT,
    };
  }

  private validateFileRow(fileRow: any): boolean {
    if (!fileRow['name'] || typeof fileRow['name'] !== 'string') {
      return false;
    } 
    if (!fileRow['governmentId'] || typeof fileRow['name'] !== 'string') {
      return false;
    } 
    if (!fileRow['email'] || typeof fileRow['name'] !== 'string') {
      return false;
    } 
    if (!fileRow['debtAmount'] || isNaN(fileRow['debtAmount'])) {
      return false;
    }
    if (!fileRow['debtDueDate']) {
      return false;
    }
    if (isNaN(Date.parse(fileRow['debtDueDate'])) == true) {
      return false;
    }
    if (!fileRow['debtId'] || typeof fileRow['name'] !== 'string') {
      return false;
    } 

    return true;
  }

}
