import { Injectable } from '@nestjs/common';
import { job } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { JobEntity } from './entity/job.entity';
import { JobRepository } from './job.repository';

@Injectable()
export class JobService {

  public static READ_CSV_QUEUE: string = 'read_csv';
  public static TRY_PAYMENT_QUEUE: string = 'try_payment';

  private readonly repository: JobRepository;

  constructor(private readonly databaseService: DatabaseService) {
    this.repository = new JobRepository(this.databaseService);
  }

  public async createJob(queue: string, reference: string, input: string = ''): Promise<JobEntity> {
    const job: job = await this.repository.createJob(queue, reference, input);

    return new JobEntity(job.id, job.queue, job.reference, job.status, job.input);
  }

  public async getPendingJobsFromQueue(queue: string): Promise<JobEntity[]> {
    const jobs: job[] = await this.repository.getPendingJobsFromQueue(queue);

    return jobs.map((job: job) => {return new JobEntity(job.id, job.queue, job.reference, job.status, job.input)});
  }

}
