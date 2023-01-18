import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobRepository } from './job.repository';

@Injectable()
export class JobService {

  private readonly repository: JobRepository;

  constructor(private readonly databaseService: DatabaseService) {
    this.repository = new JobRepository(this.databaseService);
  }

}
