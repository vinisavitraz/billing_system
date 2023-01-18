import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { BillingRepository } from './billing.repository';

@Injectable()
export class BillingService {

  private readonly repository: BillingRepository;

  constructor(private readonly databaseService: DatabaseService) {
    this.repository = new BillingRepository(this.databaseService);
  }

}
