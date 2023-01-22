import { InvalidArgumentException } from "../exception/invalid-argument.exception";

export class ArgumentValidator {

  public static validate(argument: any, fieldName: string, fieldType: string): void {
    if (!argument) {
      throw new InvalidArgumentException('Invalid `' + fieldName + '`');
    }

    if (typeof argument !== fieldType) {
      throw new InvalidArgumentException('Invalid type `' + fieldName + '`');
    }

    if (fieldType === 'string' && argument === '') {
      throw new InvalidArgumentException('Empty `' + fieldName + '`');
    }

    if (fieldType === 'number' && argument <= 0) {
      throw new InvalidArgumentException('Less or equal to zero `' + fieldName + '`');
    }
  }

}