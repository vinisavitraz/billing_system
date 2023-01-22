import { HttpException, HttpStatus } from "@nestjs/common";

export class RequestFieldValidator {

  public static validateField(requestField: any, fieldName: string, fieldType: string): void {
    if (fieldType === 'date') {
      return this.validateFieldDate(requestField, fieldName);
    }

    if (!requestField || typeof requestField !== fieldType) {
      throw new HttpException(
        'Invalid request field `' + fieldName + '`',
        HttpStatus.BAD_REQUEST, 
      );
    }
  }

  private static validateFieldDate(requestField: any, fieldName: string): void {
    if (!requestField || typeof requestField !== 'string') {
      throw new HttpException(
        'Invalid request field date `' + fieldName + '`',
        HttpStatus.BAD_REQUEST, 
      );
    }
    if (isNaN(Date.parse(requestField)) == true) {
      throw new HttpException(
        'Invalid request field date `' + fieldName + '`',
        HttpStatus.BAD_REQUEST, 
      );
    }
  }

}