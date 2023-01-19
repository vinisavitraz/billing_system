export class BillingEntity {

  readonly name: string;
  readonly governmentId: string;
  readonly email: string;
  readonly id: string;
  readonly amount: number;
  readonly dueDate: Date;
  readonly status: string;
  
  constructor(
    name: string,
    governmentId: string,
    email: string,
    id: string,
    amount: number,
    dueDate: Date,
    status: string,
  ) {
    this.name = name;
    this.governmentId = governmentId;
    this.email = email;
    this.id = id;
    this.amount = amount;
    this.dueDate = dueDate;
    this.status = status;
  }

}