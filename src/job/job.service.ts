import { Injectable } from '@nestjs/common';
import { InvalidArgumentValidator } from 'src/app/validator/invalid-argument.validator';
import { DatabaseService } from 'src/database/database.service';
import { JobEntity } from './entity/job.entity';
import { JobRepository } from './job.repository';

@Injectable()
export class JobService {

  readonly repository: JobRepository;

  constructor(private readonly databaseService: DatabaseService) {
    this.repository = new JobRepository(this.databaseService);
  }

  public async createJob(queue: string, reference: string): Promise<JobEntity> {
    InvalidArgumentValidator.validate(queue, 'queue', 'string');
    InvalidArgumentValidator.validate(reference, 'reference', 'string');
    
    return await this.repository.createJob(queue, reference);
  }

  public async getPendingJobsFromQueue(queue: string): Promise<JobEntity[]> {
    InvalidArgumentValidator.validate(queue, 'queue', 'string');

    return await this.repository.getPendingJobsFromQueue(queue);
  }

  public async updateJobStatus(jobId: number, newStatus: string): Promise<JobEntity> {
    InvalidArgumentValidator.validate(jobId, 'jobId', 'number');
    InvalidArgumentValidator.validate(newStatus, 'newStatus', 'string');

    return await this.repository.updateJobStatus(jobId, newStatus);
  }

}
