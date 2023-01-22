import { InvalidArgumentException } from "../exception/invalid-argument.exception";
import { InvalidArgumentValidator } from "./invalid-argument.validator";

describe('InvalidArgumentValidator', () => {
  
  const mockValidArguments = [
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

  describe.each(mockValidArguments)(`test invalid argument validator with valid argument`, (mockArgument) => {
    it('should not throw exception for argument `' + mockArgument.name + '`', () => {
      expect(() => { InvalidArgumentValidator.validate(mockArgument.argument, mockArgument.name, mockArgument.type) }).not.toThrow(InvalidArgumentException);
    });
  });

  const mockInvalidArguments = [
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

  describe.each(mockInvalidArguments)(`test invalid argument validator with invalid argument`, (mockArgument) => {
    it('should throw exception for argument `' + mockArgument.name + '`', () => {
      expect(() => { InvalidArgumentValidator.validate(mockArgument.argument, mockArgument.name, mockArgument.type) }).toThrow(InvalidArgumentException);
    });
  });

  const mockValidArgumentsDateString = [
    {
      argument: '2023-01-31 10:00:00',
      name: 'debtDueDate',
    },
  ];

  describe.each(mockValidArgumentsDateString)(`test invalid argument validator with valid argument date string`, (mockArgument) => {
    it('should not throw exception for argument `' + mockArgument.name + '`', () => {
      expect(() => { InvalidArgumentValidator.validateDateString(mockArgument.argument, mockArgument.name) }).not.toThrow(InvalidArgumentException);
    });
  });

  const mockInvalidArgumentsDateString = [
    {
      argument: '',
      name: 'debtDueDate',
    },
  ];

  describe.each(mockInvalidArgumentsDateString)(`test invalid argument validator with invalid argument date string`, (mockArgument) => {
    it('should throw exception for argument `' + mockArgument.name + '`', () => {
      expect(() => { InvalidArgumentValidator.validateDateString(mockArgument.argument, mockArgument.name) }).toThrow(InvalidArgumentException);
    });
  });

  const mockValidArgumentsDate = [
    {
      argument: new Date('2023-01-31 10:00:00'),
      name: 'debtDueDate',
    },
  ];

  describe.each(mockValidArgumentsDate)(`test invalid argument validator with valid argument date`, (mockArgument) => {
    it('should not throw exception for argument `' + mockArgument.name + '`', () => {
      expect(() => { InvalidArgumentValidator.validateDate(mockArgument.argument, mockArgument.name) }).not.toThrow(InvalidArgumentException);
    });
  });

  const mockInvalidArgumentsDate = [
    {
      argument: new Date('test'),
      name: 'debtDueDate',
    },
  ];

  describe.each(mockInvalidArgumentsDate)(`test invalid argument validator with invalid argument date`, (mockArgument) => {
    it('should throw exception for argument `' + mockArgument.name + '`', () => {
      expect(() => { InvalidArgumentValidator.validateDate(mockArgument.argument, mockArgument.name) }).toThrow(InvalidArgumentException);
    });
  });

});