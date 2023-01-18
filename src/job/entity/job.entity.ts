export class JobEntity {

  private id: number;
  private queue: string;
  private reference: string;
  private status: string;

  constructor(
    id: number,
    queue: string,
    reference: string,
    status: string,
  ) {
    this.id = id;
    this.queue = queue;
    this.reference = reference;
    this.status = status;
  }

}