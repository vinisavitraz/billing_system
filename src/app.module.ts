import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillingModule } from './billing/billing.module';
import { JobModule } from './job/job.module';

@Module({
  imports: [BillingModule, JobModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
