import { job } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";

export class JobRepository {

  private readonly connection: DatabaseService;

  constructor(databaseService: DatabaseService) {
      this.connection = databaseService;
  }
  
  public async createJob(
    queue: string,
    reference: string,
    input: string,
  ): Promise<job> {
    return await this.connection.job.create({
      data: {
        queue: queue,
        reference: reference,
        status: 'pending',
        input: input,
      },
    });
  }

  public async getPendingJobsFromQueue(queue: string): Promise<job[]> {
    return await this.connection.job.findMany({
      where: {
        queue: queue,
        status: 'pending',
      },
    });
  }

  public async updateJobStatus(jobId: number, newStatus: string): Promise<job> {
    return await this.connection.job.update({
      where: {
        id: jobId,
      },
      data: {
        status: newStatus,
      },
    });
  }

}