export class ExecutePaymentResponse {

  readonly debtStatus: string;

  constructor(debtStatus: string) {
    this.debtStatus = debtStatus;
  }
}