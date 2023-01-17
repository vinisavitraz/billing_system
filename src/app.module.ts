import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillingModule } from './billing/billing.module';
import { JobModule } from './job/job.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [BillingModule, JobModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
