import { job } from "@prisma/client";
import { JobStatus } from "src/app/enum/status.enum";
import { DatabaseService } from "src/database/database.service";
import { JobEntity } from "./entity/job.entity";

export class JobRepository {

  readonly connection: DatabaseService;

  constructor(databaseService: DatabaseService) {
      this.connection = databaseService;
  }
  
  public async createJob(
    queue: string,
    reference: string,
  ): Promise<JobEntity> {
    const job: job = await this.connection.job.create({
      data: {
        queue: queue,
        reference: reference,
        status: JobStatus.PENDING,
      },
    });

    return new JobEntity(job.id, job.queue, job.reference, job.status);
  }

  public async getPendingJobsFromQueue(queue: string): Promise<JobEntity[]> {
    const jobs: job[] = await this.connection.job.findMany({
      where: {
        queue: queue,
        status: JobStatus.PENDING,
      },
    });

    return jobs.map((job: job) => {return new JobEntity(job.id, job.queue, job.reference, job.status)});
  }

  public async updateJobStatus(jobId: number, newStatus: string): Promise<JobEntity> {
    const job: job = await this.connection.job.update({
      where: {
        id: jobId,
      },
      data: {
        status: newStatus,
      },
    });

    return new JobEntity(job.id, job.queue, job.reference, job.status);
  }

}