import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { JobService } from './job.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
