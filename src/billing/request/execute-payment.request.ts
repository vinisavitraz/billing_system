export class ExecutePaymentRequest {

  debtId: string | any;
  paidAt: string | any;
  paidAmount: number | any;
  paidBy: string | any;
  
  constructor(
    debtId: string | any,
    paidAt: string | any,
    paidAmount: number | any,
    paidBy: string | any,
  ) {
    this.debtId = debtId;
    this.paidAt = paidAt;
    this.paidAmount = paidAmount;
    this.paidBy = paidBy;
  }

}