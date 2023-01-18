import { Test, TestingModule } from '@nestjs/testing';
import { BillingRepository } from './billing.repository';

describe('BillingRepository', () => {
  
  let service: BillingRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingRepository],
    }).compile();

    service = module.get<BillingRepository>(BillingRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
