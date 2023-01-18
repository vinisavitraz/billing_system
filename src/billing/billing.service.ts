import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { JobEntity } from 'src/job/entity/job.entity';
import { JobService } from 'src/job/job.service';
import { BillingRepository } from './billing.repository';
import { SaveBillingsFileResponse } from './response/save-billings-file.response';
import * as fs from 'fs';
import { PaymentAttemptEntity } from './entity/payment-attempt';

@Injectable()
export class BillingService {

  private readonly repository: BillingRepository;

  constructor(private readonly jobService: JobService, private readonly databaseService: DatabaseService) {
    this.repository = new BillingRepository(this.databaseService);
  }

  public async saveBillingsFile(fileName: string): Promise<SaveBillingsFileResponse> {
    await this.jobService.createJob(JobService.READ_CSV_QUEUE, fileName);

    return new SaveBillingsFileResponse('Added to queue');
  }

  public async savePaymentAttempt(paymentAttemptEntity: PaymentAttemptEntity): Promise<SaveBillingsFileResponse> {
    await this.jobService.createJob(JobService.TRY_PAYMENT_QUEUE, paymentAttemptEntity.debtId, JSON.stringify(paymentAttemptEntity));

    return new SaveBillingsFileResponse('We are processing your payment. Thank you!');
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  private async executeReadCSVPendingJobs(): Promise<void> {
    const pendingJobs: JobEntity[] = await this.jobService.getPendingJobsFromQueue(JobService.READ_CSV_QUEUE);
    
    for (let i = 0; i < pendingJobs.length; i++) {
      const pendingJob: JobEntity = pendingJobs[i];
      this.createBillingsFromFile(pendingJob.reference);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  private async executeTryPaymentPendingJobs(): Promise<void> {
    const pendingJobs: JobEntity[] = await this.jobService.getPendingJobsFromQueue(JobService.TRY_PAYMENT_QUEUE);
    
    for (let i = 0; i < pendingJobs.length; i++) {
      const pendingJob: JobEntity = pendingJobs[i];
      const paymentAttemptEntity: any = JSON.parse(pendingJob.input);
      
      this.tryPayment(paymentAttemptEntity.debtId);
    }
  }

  private async createBillingsFromFile(fileName: string): Promise<void> {
    const filePath: string = './files/csv/' + fileName;
    const file = await fs.promises.open(filePath, 'r');
    console.log(fileName);
    console.log(file);
  }

  private async tryPayment(debtId: string): Promise<void> {
    console.log(debtId);
  }

}
