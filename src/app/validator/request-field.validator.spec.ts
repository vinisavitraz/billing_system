import { HttpException } from "@nestjs/common";
import { RequestFieldValidator } from "./request-field.validator";

describe('RequestFieldValidator', () => {
  
  const mockValidData = [
    {
      field: '8291',
      name: 'debtId',
      type: 'string',
    },
    {
      field: '2022-06-09 10:00:00',
      name: 'paidAt',
      type: 'date',
      
    },
    {
      field: 100000.00,
      name: 'paidAmount',
      type: 'number',
    },
  ];

  describe.each(mockValidData)(`Test field validator with valid data`, (mockRequest) => {
    it('should not throw exception for field `' + mockRequest.name + '`', () => {
      expect(() => { RequestFieldValidator.validateField(mockRequest.field, mockRequest.name, mockRequest.type) }).not.toThrow(HttpException);
    });
  });

  const mockInvalidData = [
    {
      field: null,
      name: 'debtId',
      type: 'string',
    },
    {
      field: 123,
      name: 'debtId',
      type: 'string',
    },
    {
      field: null,
      name: 'paidAt',
      type: 'date',
    },
    {
      field: 'abc',
      name: 'paidAt',
      type: 'date',
    },
    {
      field: null,
      name: 'paidAmount',
      type: 'number',
    },
    {
      field: 'abc',
      name: 'paidAmount',
      type: 'number',
    },
  ];

  describe.each(mockInvalidData)(`Test field validator with invalid data`, (mockRequest) => {
    it('should throw exception for field `' + mockRequest.name + '`', () => {
      expect(() => { RequestFieldValidator.validateField(mockRequest.field, mockRequest.name, mockRequest.type) }).toThrow(HttpException);
    });
  });

});