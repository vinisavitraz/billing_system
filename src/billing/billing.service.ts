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
import { InvalidArgumentValidator } from 'src/app/validator/invalid-argument.validator';
import { BillingStatus, JobStatus } from 'src/app/enum/status.enum';
import { Queue } from 'src/app/enum/queue.enum';

@Injectable()
export class BillingService {

  public static CSV_FILES_BASE_PATH: string = './files/csv/';
  public static BATCH_SIZE: number = 250;
  public static REMAINING_DAYS_TO_REMINDER_PAYMENT: number = 1;

  readonly repository: BillingRepository;

  constructor(
    private readonly jobService: JobService, 
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService
  ) {
    this.repository = new BillingRepository(this.databaseService);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async executeReadCSVPendingJobs(): Promise<void> {
    const pendingJobs: JobEntity[] = await this.jobService.getPendingJobsFromQueue(Queue.READ_CSV);
    
    for (let i = 0; i < pendingJobs.length; i++) {
      const pendingJob: JobEntity = pendingJobs[i];
      await this.createBillingsFromCSVFile(pendingJob.reference, BillingService.BATCH_SIZE);
      await this.jobService.updateJobStatus(pendingJob.id, JobStatus.EXECUTED);
    }
  }
  
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  public async checkBillingsDueDateAndUpdateStatus(): Promise<void> {
    const remindAfterDate: Date = new Date();
    remindAfterDate.setDate(remindAfterDate.getDate() - BillingService.REMAINING_DAYS_TO_REMINDER_PAYMENT);

    const expiringBillings: billing[] = await this.repository.findExpiringBillings(remindAfterDate);
    
    for (let i = 0; i < expiringBillings.length; i++) {
      const billing: billing = expiringBillings[i];
      this.mailService.sendPaymentReminderMail(
        billing.email,
        billing.id,
        billing.name,
        billing.amount.toNumber(),
        billing.due_date,
      );
    }
    
    const expiredBillings: billing[] = await this.repository.findExpiredBillings();
    
    for (let i = 0; i < expiredBillings.length; i++) {
      const billing: billing = expiredBillings[i];
      await this.repository.updateBillingStatus(billing.id, BillingStatus.EXPIRED);
    }
  }

  public async scheduleReadCSVJob(fileName: string): Promise<SaveBillingsFileResponse> {
    InvalidArgumentValidator.validate(fileName, 'fileName', 'string');

    await this.jobService.createJob(Queue.READ_CSV, fileName);
    
    return new SaveBillingsFileResponse('Added to processing queue. Billings will be created in a few seconds.');
  }

  public async executePayment(paymentEntity: PaymentEntity): Promise<ExecutePaymentResponse> {
    const billing: billing | null = await this.findBillingByIdOrCry(paymentEntity.debtId);

    this.validateBillingState(billing, paymentEntity);
    this.validateBillingAndPaymentAmounts(billing.amount.toNumber(), paymentEntity.paidAmount);

    const payments: payment[] = await this.repository.findBillingPayments(billing.id);
    let paymentRemainingAmount: number = billing.amount.toNumber();

    if (payments.length > 0) {
      paymentRemainingAmount = this.calculateRemainingPaymentAmount(paymentRemainingAmount, payments);
    }

    this.validateBillingAndPaymentAmounts(paymentRemainingAmount, paymentEntity.paidAmount);

    if (paymentEntity.paidAmount === paymentRemainingAmount) {
      await this.createPayment(billing.id, paymentEntity);
      await this.repository.updateBillingStatus(billing.id, BillingStatus.PAID);

      return new ExecutePaymentResponse(BillingStatus.PAID);
    }

    await this.createPayment(billing.id, paymentEntity);

    return new ExecutePaymentResponse(BillingStatus.PENDING_PAYMENT);
  }

  private async createBillingsFromCSVFile(fileName: string, maxBatchSize: number): Promise<void> {
    const filePath: string = BillingService.CSV_FILES_BASE_PATH + fileName;
    const fileRowsJson: any[] = await this.readAndDeleteFile(filePath);
    
    if (fileRowsJson.length === 0) {
      console.log('Invalid file content.');
      return;
    }

    const billingsInput: object[] = await this.mapFileContentToBillings(fileRowsJson);

    if (billingsInput.length > maxBatchSize) {
      console.log('Processing file in batches.');
      for (let i = 0; i < billingsInput.length; i += maxBatchSize) {
        const batch: object[] = billingsInput.slice(i, i + maxBatchSize);
        await this.repository.createNewBillings(batch);
      }
    } else {
      await this.repository.createNewBillings(billingsInput);
    }
    
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

  private async readAndDeleteFile(filePath: string): Promise<any[]> {
    const fileRowsJson: any[] = await csvToJson().fromFile(filePath);
    await fs.promises.unlink(filePath);

    return fileRowsJson;
  }

  private async findBillingByIdOrCry(debtId: string): Promise<billing> {
    const billing: billing | null = await this.repository.findBillingById(debtId);

    if (!billing) {
      throw new HttpException(
        'Billing with ID `' + debtId + '` not found.',
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

    if (billing.status !== BillingStatus.PENDING_PAYMENT) {
      throw new HttpException(
        'Debt not allowed to receive payments.',
        HttpStatus.UNPROCESSABLE_ENTITY, 
      );
    }
  }

  private validateBillingAndPaymentAmounts(billingAmount: number, paymentAmount: number): void {
    if (paymentAmount > billingAmount) {
      throw new HttpException(
        'Payment amount is greater than debt amount.',
        HttpStatus.UNPROCESSABLE_ENTITY, 
      );
    }
  }

  private calculateRemainingPaymentAmount(billingAmount: number, payments: payment[]): number {
    let totalPaidAmount: number = 0;

    payments.forEach((payment: payment) => {
      totalPaidAmount += payment.paid_amount.toNumber();
    });

    return billingAmount - totalPaidAmount;
  }

  private async createPayment(billingId: string, paymentEntity: PaymentEntity): Promise<payment> {
    return await this.repository.executePayment(
      paymentEntity.paidAmount,
      new Date(paymentEntity.paidAt),
      paymentEntity.paidBy,
      billingId,
    );
  }

  private async mapFileContentToBillings(fileRowsJson: any[]): Promise<object[]> {
    const billingsInput: object[] = [];

    for (let i = 0; i < fileRowsJson.length; i++) {
      const fileRow: any = fileRowsJson[i];
      
      try {
        this.validateFileRow(fileRow);
      } catch (error) {
        console.log('Invalid content. Skipping row ' + i);
        continue;
      }
      const billing: billing | null = await this.repository.findBillingById(fileRow['debtId']);

      if (billing) {
        console.log('Billing with debtId ' + fileRow['debtId'] + ' already on database. Skipping row ' + i);
        continue;
      }

      billingsInput.push(
        {
          name: fileRow['name'],
          government_id: fileRow['governmentId'],
          email: fileRow['email'],
          id: fileRow['debtId'],
          amount: Number(fileRow['debtAmount']),
          due_date: new Date(fileRow['debtDueDate'] + ' 23:59:59'),
          status: BillingStatus.PENDING_PAYMENT,
        }
      );
    }

    return billingsInput;
  }

  private validateFileRow(fileRow: any): void {
    InvalidArgumentValidator.validate(fileRow['name'], 'name', 'string');
    InvalidArgumentValidator.validate(fileRow['governmentId'], 'governmentId', 'string');
    InvalidArgumentValidator.validate(fileRow['email'], 'email', 'string');
    InvalidArgumentValidator.validate(fileRow['debtAmount'], 'debtAmount', 'number');
    InvalidArgumentValidator.validateDateString(fileRow['debtDueDate'], 'debtDueDate');
    InvalidArgumentValidator.validate(fileRow['debtId'], 'debtId', 'string');
  }

}
