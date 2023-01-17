export class BillingEntity {

    private debtId: string;
    private debtAmount: number;
    private debtDueDate: string;
    private debtStatus: string;
    private name: string;
    private governmentId: string;
    private email: string;
    
    constructor(
        debtId: string,
        debtAmount: number,
        debtDueDate: string,
        debtStatus: string,
        name: string,
        governmentId: string,
        email: string,
    ) {
        this.debtId = debtId;
        this.debtAmount = debtAmount;
        this.debtDueDate = debtDueDate;
        this.debtStatus = debtStatus;
        this.name = name;
        this.governmentId = governmentId;
        this.email = email;
    }

}