export class JobEntity {

  readonly id: number;
  readonly queue: string;
  readonly reference: string;
  readonly status: string;

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