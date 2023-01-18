import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JobModule } from 'src/job/job.module';

@Module({
  imports: [DatabaseModule, JobModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
