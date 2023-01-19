export class PaymentEntity {

  readonly debtId: string;
  readonly paidAt: Date;
  readonly paidAmount: number;
  readonly paidBy: string;
  
  constructor(
    debtId: string,
    paidAt: Date,
    paidAmount: number,
    paidBy: string,
  ) {
    this.debtId = debtId;
    this.paidAt = paidAt;
    this.paidAmount = paidAmount;
    this.paidBy = paidBy;
  }

}