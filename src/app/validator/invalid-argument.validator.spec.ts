import { InvalidArgumentException } from "../exception/invalid-argument.exception";
import { InvalidArgumentValidator } from "./invalid-argument.validator";

describe('InvalidArgumentValidator', () => {
  
  const mockValidData = [
    {
      argument: '8291',
      name: 'debtId',
      type: 'string',
    },
    {
      argument: 100000.00,
      name: 'paidAmount',
      type: 'number',
    },
  ];

  describe.each(mockValidData)(`test invalid argument validator with valid argument`, (mockArgument) => {
    it('should not throw exception for argument `' + mockArgument.name + '`', () => {
      expect(() => { InvalidArgumentValidator.validate(mockArgument.argument, mockArgument.name, mockArgument.type) }).not.toThrow(InvalidArgumentException);
    });
  });

  const mockInvalidData = [
    {
      argument: null,
      name: 'debtId',
      type: 'string',
    },
    {
      argument: '',
      name: 'debtId',
      type: 'string',
    },
    {
      argument: 123,
      name: 'debtId',
      type: 'string',
    },
    {
      argument: null,
      name: 'paidAmount',
      type: 'number',
    },
    {
      argument: 0,
      name: 'paidAmount',
      type: 'number',
    },
    {
      argument: 'abc',
      name: 'paidAmount',
      type: 'number',
    },
  ];

  describe.each(mockInvalidData)(`Test invalid argument validator with invalid argument`, (mockArgument) => {
    it('should throw exception for argument `' + mockArgument.name + '`', () => {
      expect(() => { InvalidArgumentValidator.validate(mockArgument.argument, mockArgument.name, mockArgument.type) }).toThrow(InvalidArgumentException);
    });
  });

});