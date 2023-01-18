export class JobEntity {

  readonly id: number;
  readonly queue: string;
  readonly reference: string;
  readonly status: string;
  readonly input: string;

  constructor(
    id: number,
    queue: string,
    reference: string,
    status: string,
    input: string,
  ) {
    this.id = id;
    this.queue = queue;
    this.reference = reference;
    this.status = status;
    this.input = input;
  }

}