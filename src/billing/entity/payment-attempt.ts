export class PaymentAttemptEntity {

  readonly debtId: string;
  readonly paidAt: string;
  readonly paidAmount: number;
  readonly paidBy: string;
  
  constructor(
    debtId: string,
    paidAt: string,
    paidAmount: number,
    paidBy: string,
  ) {
    this.debtId = debtId;
    this.paidAt = paidAt;
    this.paidAmount = paidAmount;
    this.paidBy = paidBy;
  }

}