export class MailEntity {

  readonly mailTo: string;
  readonly subject: string;
  readonly body: string;

  constructor(
    mailTo: string,
    subject: string,
    body: string,
  ) {
    this.mailTo = mailTo;
    this.subject = subject;
    this.body = body;
  }

}