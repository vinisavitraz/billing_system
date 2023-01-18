import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { JobService } from 'src/job/job.service';
import { BillingRepository } from './billing.repository';
import { SaveBillingsFileResponse } from './response/save-billings-file.response';

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

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async createBillingsFromFile(): Promise<void> {
    
  }

}
