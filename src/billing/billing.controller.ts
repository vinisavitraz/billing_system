import { Body, Controller, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import LocalFilesInterceptor from 'src/app/interceptor/local-files.interceptor';
import { RequestFieldValidator } from 'src/app/validator/request-field.validator';
import { BillingService } from './billing.service';
import { PaymentEntity } from './entity/payment.entity';
import { ExecutePaymentRequest } from './request/execute-payment.request';
import { ExecutePaymentResponse } from './response/execute-payment.response';
import { SaveBillingsFileResponse } from './response/save-billings-file.response';
import * as path from 'node:path';
import * as fs from 'fs';

@Controller('billing')
export class BillingController {
  
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @UseInterceptors(LocalFilesInterceptor({
    fieldName: 'billings',
    path: '/csv'
  }))
  public async saveBillingsFile(
    @UploadedFile() file: Express.Multer.File
  ): Promise<SaveBillingsFileResponse> {
    if (!file) {
      throw new HttpException(
        'Invalid request file',
        HttpStatus.BAD_REQUEST, 
      );
    }
    
    RequestFieldValidator.validateField(file.originalname, 'fileOriginalName', 'string');

    const fileExtension: string = path.extname(file.originalname).replace('.', '');

    if (fileExtension !== 'csv') {
      RequestFieldValidator.validateField(file.path, 'filePath', 'string');
      await fs.promises.unlink(file.path);
      throw new HttpException(
        'Invalid request file type',
        HttpStatus.BAD_REQUEST, 
      );
    }

    RequestFieldValidator.validateField(file.filename, 'fileName', 'string');
    
    return await this.billingService.scheduleReadCSVJob(file.filename);
  }

  @Post('pay')
  public async executePayment(@Body() executePaymentRequest: ExecutePaymentRequest): Promise<ExecutePaymentResponse> {
    this.validateRequestBody(executePaymentRequest);

    const payment: PaymentEntity = new PaymentEntity(
      executePaymentRequest.debtId,
      new Date(executePaymentRequest.paidAt),
      executePaymentRequest.paidAmount,
      executePaymentRequest.paidBy,
    );

    return await this.billingService.executePayment(payment);
  }

  private validateRequestBody(executePaymentRequest: ExecutePaymentRequest): void {
    RequestFieldValidator.validateField(executePaymentRequest.debtId, 'debtId', 'string');
    RequestFieldValidator.validateField(executePaymentRequest.paidAt, 'paidAt', 'date');
    RequestFieldValidator.validateField(executePaymentRequest.paidAmount, 'paidAmount', 'number');
    RequestFieldValidator.validateField(executePaymentRequest.paidBy, 'paidBy', 'string');
  }

}
