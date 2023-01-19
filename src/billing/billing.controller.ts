import { Body, Controller, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import LocalFilesInterceptor from 'src/app/api/interceptor/local-files.interceptor';
import { BillingService } from './billing.service';
import { PaymentEntity } from './entity/payment.entity';
import { ExecutePaymentRequest } from './request/execute-payment.request';
import { ExecutePaymentResponse } from './response/execute-payment.response';
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
    return await this.billingService.scheduleReadCSVJob(fileCSV.filename);
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
    if (!executePaymentRequest.debtId || typeof executePaymentRequest.debtId !== 'string') {
      throw new HttpException(
        'Invalid parameter `debtId`',
        HttpStatus.BAD_REQUEST, 
      );
    }
    if (!executePaymentRequest.paidAt || typeof executePaymentRequest.paidAt !== 'string') {
      throw new HttpException(
        'Invalid parameter `paidAt`',
        HttpStatus.BAD_REQUEST, 
      );
    }
    if (isNaN(Date.parse(executePaymentRequest.paidAt)) == true) {
      throw new HttpException(
        'Invalid parameter `paidAt`',
        HttpStatus.BAD_REQUEST, 
      );
    }
    if (!executePaymentRequest.paidAmount || typeof executePaymentRequest.paidAmount !== 'number') {
      throw new HttpException(
        'Invalid parameter `paidAmount`',
        HttpStatus.BAD_REQUEST, 
      );
    }
    if (!executePaymentRequest.paidBy || typeof executePaymentRequest.paidBy !== 'string') {
      throw new HttpException(
        'Invalid parameter `paidBy`',
        HttpStatus.BAD_REQUEST, 
      );
    }
  }

}
