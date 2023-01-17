export class JobEntity {

    private id: string;
    private queue: string;
    private executeAt: Date;
    private reference: string;
    private status: string;

    constructor(
        id: string,
        queue: string,
        executeAt: Date,
        reference: string,
        status: string,
    ) {
        this.id = id;
        this.queue = queue;
        this.executeAt = executeAt;
        this.reference = reference;
        this.status = status;
    }

}