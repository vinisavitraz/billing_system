import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import LocalFilesInterceptor from 'src/app/api/local-files.interceptor';
import { BillingService } from './billing.service';
import { SaveBillingsFileResponse } from './response/save-billings-file.response';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @UseInterceptors(LocalFilesInterceptor({
    fieldName: 'billings',
    path: '/csv'
  }))
  public async saveBillingsFile(@UploadedFile() fileCSV: Express.Multer.File): Promise<SaveBillingsFileResponse> {
    return await this.billingService.saveBillingsFile(fileCSV.filename);
  }
}
