import { Test, TestingModule } from '@nestjs/testing';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

describe('BillingController', () => {
  let controller: BillingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [BillingService],
    }).compile();

    controller = module.get<BillingController>(BillingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should save CSV file and log file name', () => {
    const consoleSpy: any = jest.spyOn(console, 'log');
    const mockedFile: Express.Multer.File = {
      fieldname: 'billings',
      originalname: 'billings.csv',
      mimetype: 'text/csv',
      path: 'something',
      buffer: Buffer.from('one,two,three'),
    } as Express.Multer.File;

    controller.saveBillingsFile(mockedFile);

    expect(consoleSpy).toHaveBeenCalledWith('billings.csv');
  });

});
