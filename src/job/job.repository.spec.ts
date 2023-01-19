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

  it('should create new job', () => {
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
    
    expect(repository.createJob('test_queue', '123')).resolves.toEqual(expectedJobEntity);
  });

  it('should get pending jobs from queue', () => {
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
    
    expect(repository.getPendingJobsFromQueue('test_queue')).resolves.toEqual(expectedJobEntities);
  });

  it('should update job status', () => {
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
    
    expect(repository.updateJobStatus(1, 'executed')).resolves.toEqual(expectedJobEntity);
  });

});
