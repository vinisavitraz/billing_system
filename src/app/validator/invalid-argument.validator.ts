import { InvalidArgumentException } from "../exception/invalid-argument.exception";

export class InvalidArgumentValidator {

  public static validate(argument: any, name: string, type: string): void {
    if (!argument) {
      throw new InvalidArgumentException('Invalid argument `' + name + '`');
    }

    if (typeof argument !== type) {
      throw new InvalidArgumentException('Invalid argument type `' + name + '`');
    }

    if (type === 'string' && argument === '') {
      throw new InvalidArgumentException('Empty argument `' + name + '`');
    }

    if (type === 'number' && argument <= 0) {
      throw new InvalidArgumentException('Argument less or equal to zero `' + name + '`');
    }
  }

  public static validateDateString(argument: string, name: string): void {
    if (!argument) {
      throw new InvalidArgumentException('Invalid argument `' + name + '`');
    }

    if (argument === '') {
      throw new InvalidArgumentException('Empty argument `' + name + '`');
    }
    
    if (isNaN(Date.parse(argument)) == true) {
      throw new InvalidArgumentException('Invalid argument date `' + name + '`');
    }
  }

  public static validateDate(argument: Date, name: string): void {
    if (!argument) {
      throw new InvalidArgumentException('Invalid argument `' + name + '`');
    }

    if (isNaN(argument.getTime()) == true) {
      throw new InvalidArgumentException('Invalid argument date `' + name + '`');
    }
  }

}