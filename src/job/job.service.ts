import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobEntity } from './entity/job.entity';
import { JobRepository } from './job.repository';

@Injectable()
export class JobService {

  public static READ_CSV_QUEUE: string = 'read_csv';

  readonly repository: JobRepository;

  constructor(private readonly databaseService: DatabaseService) {
    this.repository = new JobRepository(this.databaseService);
  }

  public async createJob(queue: string, reference: string): Promise<JobEntity> {
    return await this.repository.createJob(queue, reference);
  }

  public async getPendingJobsFromQueue(queue: string): Promise<JobEntity[]> {
    return await this.repository.getPendingJobsFromQueue(queue);
  }

  public async updateJobStatus(jobId: number, newStatus: string): Promise<JobEntity> {
    return await this.repository.updateJobStatus(jobId, newStatus);
  }

}
