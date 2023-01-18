import { DatabaseService } from "src/database/database.service";

export class JobRepository {

  constructor(private readonly databaseService: DatabaseService) {}
  
}