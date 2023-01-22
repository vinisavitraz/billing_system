import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'src/database/database.service';
import { JobEntity } from './entity/job.entity';
import { JobRepository } from './job.repository';

describe('JobRepository', () => {
  
  let databaseService: DatabaseService;
  let repository: JobRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);
    repository = new JobRepository(databaseService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('test create job', () => {
    it('should create new job and return entity', async () => {
      databaseService.job.create = jest.fn().mockReturnValueOnce(
        {
          id: 1,
          queue: 'test_queue',
          reference: '123',
          status: 'pending',
        }
      );
      const expectedJobEntity: JobEntity = new JobEntity(
        1,
        'test_queue',
        '123',
        'pending',
      );

      const createdJob: JobEntity = await repository.createJob('test_queue', '123');
      
      expect(createdJob).toEqual(expectedJobEntity);
    });
  });

  describe('test get pending jobs with scheduled jobs', () => {
    it('should return pending jobs entities', async () => {
      databaseService.job.findMany = jest.fn().mockReturnValueOnce(
        [{
          id: 1,
          queue: 'test_queue',
          reference: '123',
          status: 'pending',  
        }]
      );
      const expectedJobEntities: JobEntity[] = [
        new JobEntity(
          1,
          'test_queue',
          '123',
          'pending',
        ),
      ];

      const pendingJobs: JobEntity[] = await repository.getPendingJobsFromQueue('test_queue');
      
      expect(pendingJobs).toEqual(expectedJobEntities);
    });
  });

  describe('test get pending jobs without scheduled jobs', () => {
    it('should return empty list', async () => {
      databaseService.job.findMany = jest.fn().mockReturnValueOnce([]);
      const expectedJobEntities: JobEntity[] = [];
      
      const pendingJobs: JobEntity[] = await repository.getPendingJobsFromQueue('test_queue');
      
      expect(pendingJobs).toEqual(expectedJobEntities);
    });
  });
  
  describe('test update job status', () => {
    it('should update job status and return entity', async () => {
      databaseService.job.update = jest.fn().mockReturnValueOnce(
        {
          id: 1,
          queue: 'test_queue',
          reference: '123',
          status: 'executed',  
        }
      );
      const expectedJobEntity: JobEntity = new JobEntity(
        1,
        'test_queue',
        '123',
        'executed',
      );

      const updatedJob: JobEntity = await repository.updateJobStatus(1, 'executed');
      
      expect(updatedJob).toEqual(expectedJobEntity);
    });
  });

});
