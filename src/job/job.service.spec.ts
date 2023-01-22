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

  describe('test create job', () => {
    it('should create job with the expected queue and reference', async () => {
      const repositorySpy = jest.spyOn(service.repository, 'createJob').mockImplementation(async (queue: string, reference: string) => {
        return new JobEntity(1, queue, reference, 'pending');
      });
      
      const jobEntity: JobEntity = await service.createJob('test_queue', '1');
      
      expect(repositorySpy).toHaveBeenCalledWith('test_queue', '1');
      expect(jobEntity.queue).toEqual('test_queue');
      expect(jobEntity.reference).toEqual('1');
    });
  });
  
  describe('test get pending jobs from queue', () => {
    it('should get pending jobs from the expected queue', async () => {
      const repositorySpy = jest.spyOn(service.repository, 'getPendingJobsFromQueue').mockImplementation(async (queue: string) => {
        return [new JobEntity(1, queue, '1', 'pending')];
      });
      
      const pendingJobs: JobEntity[] = await service.getPendingJobsFromQueue('test_queue');
  
      expect(repositorySpy).toHaveBeenCalledWith('test_queue');
      expect(pendingJobs[0].queue).toEqual('test_queue');
      expect(pendingJobs[0].status).toEqual('pending');
    });
  });

  describe('test get pending jobs from empty queue', () => {
    it('should get empty response', async () => {
      const repositorySpy = jest.spyOn(service.repository, 'getPendingJobsFromQueue').mockImplementation(async (queue: string) => {
        return [];
      });
      
      const pendingJobs: JobEntity[] = await service.getPendingJobsFromQueue('test_queue');
  
      expect(repositorySpy).toHaveBeenCalledWith('test_queue');
      expect(pendingJobs.length).toEqual(0);
    });
  });

  it('should call repository to update job status with the expected id and new status', () => {
    const repositorySpy = jest.spyOn(service.repository, 'updateJobStatus').mockImplementation(async () => {
      return new JobEntity(1, 'test_queue', '1', 'executed');
    });
    
    service.updateJobStatus(1, 'executed');

    expect(repositorySpy).toHaveBeenCalledWith(1, 'executed');
  });

});
