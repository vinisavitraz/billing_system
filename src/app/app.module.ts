import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BillingModule } from 'src/billing/billing.module';
import { DatabaseModule } from 'src/database/database.module';
import { JobModule } from 'src/job/job.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    BillingModule, 
    JobModule, 
    MailModule, 
    DatabaseModule, 
    ScheduleModule.forRoot()
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
