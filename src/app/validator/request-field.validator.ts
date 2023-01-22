import { HttpException, HttpStatus } from "@nestjs/common";

export class RequestFieldValidator {

  public static validateField(field: any, name: string, type: string): void {
    if (type === 'date') {
      return this.validateFieldDate(field, name);
    }

    if (!field || typeof field !== type) {
      throw new HttpException(
        'Invalid request field `' + name + '`',
        HttpStatus.BAD_REQUEST, 
      );
    }
  }

  private static validateFieldDate(field: any, name: string): void {
    if (!field || typeof field !== 'string') {
      throw new HttpException(
        'Invalid request field date `' + name + '`',
        HttpStatus.BAD_REQUEST, 
      );
    }
    if (isNaN(Date.parse(field)) == true) {
      throw new HttpException(
        'Invalid request field date `' + name + '`',
        HttpStatus.BAD_REQUEST, 
      );
    }
  }

}