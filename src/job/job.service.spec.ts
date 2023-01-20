import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { JobEntity } from './entity/job.entity';
import { JobService } from './job.service';

describe('JobService', () => {
  let service: JobService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobService, DatabaseService],
    }).compile();

    service = module.get<JobService>(JobService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repository create job with the expected queue and reference', () => {
    const repositorySpy = jest.spyOn(service.repository, 'createJob').mockImplementation(async () => {
      return new JobEntity(1, 'test_queue', '1', 'pending');
    });
    
    service.createJob('test_queue', '1');

    expect(repositorySpy).toHaveBeenCalledWith('test_queue', '1');
  });

  it('should call repository get pending jobs from the expected queue', () => {
    const repositorySpy = jest.spyOn(service.repository, 'getPendingJobsFromQueue').mockImplementation(async (queue: string) => {
      return [new JobEntity(1, 'test_queue', '1', 'pending')];
    });
    
    service.getPendingJobsFromQueue('test_queue');

    expect(repositorySpy).toHaveBeenCalledWith('test_queue');
  });

  it('should call repository to update job status with the expected id and new status', () => {
    const repositorySpy = jest.spyOn(service.repository, 'updateJobStatus').mockImplementation(async () => {
      return new JobEntity(1, 'test_queue', '1', 'executed');
    });
    
    service.updateJobStatus(1, 'executed');

    expect(repositorySpy).toHaveBeenCalledWith(1, 'executed');
  });

});
