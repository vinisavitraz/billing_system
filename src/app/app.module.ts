import { Module } from '@nestjs/common';
import { BillingModule } from 'src/billing/billing.module';
import { JobModule } from 'src/job/job.module';
import { MailModule } from 'src/mail/mail.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [BillingModule, JobModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
