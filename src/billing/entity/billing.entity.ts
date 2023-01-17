export class BillingEntity {

    private name: string;
    private governmentId: string;
    private email: string;
    private id: string;
    private amount: number;
    private dueDate: Date;
    private status: string;
    private paidAt: Date | null;
    private paidAmount: number | null;
    private paidBy: string | null;
    
    constructor(
        name: string,
        governmentId: string,
        email: string,
        id: string,
        amount: number,
        dueDate: Date,
        status: string,
        paidAt: Date | null,
        paidAmount: number | null,
        paidBy: string | null,
    ) {
        this.name = name;
        this.governmentId = governmentId;
        this.email = email;
        this.id = id;
        this.amount = amount;
        this.dueDate = dueDate;
        this.status = status;
        this.paidAt = paidAt;
        this.paidAmount = paidAmount;
        this.paidBy = paidBy;
    }

}