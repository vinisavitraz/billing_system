export class ExecutePaymentRequest {

  debtId: string | undefined;
  paidAt: string | undefined;
  paidAmount: number | undefined;
  paidBy: string | undefined;
  
  constructor(
    debtId: string | undefined,
    paidAt: string | undefined,
    paidAmount: number | undefined,
    paidBy: string | undefined,
  ) {
    this.debtId = debtId;
    this.paidAt = paidAt;
    this.paidAmount = paidAmount;
    this.paidBy = paidBy;
  }

}