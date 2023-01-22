export class InvalidArgumentException extends Error {

    constructor(errorMessage: string) {
      super(errorMessage);
    }

}