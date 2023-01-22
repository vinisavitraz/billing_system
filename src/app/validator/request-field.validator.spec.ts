import { HttpException } from "@nestjs/common";
import { RequestFieldValidator } from "./request-field.validator";

describe('RequestFieldValidator', () => {
  
  const mockValidData = [
    {
      requestField: '8291',
      fieldType: 'string',
      fieldName: 'debtId',
    },
    {
      requestField: '2022-06-09 10:00:00',
      fieldType: 'date',
      fieldName: 'paidAt',
    },
    {
      requestField: 100000.00,
      fieldType: 'number',
      fieldName: 'paidAmount',
    },
  ];

  describe.each(mockValidData)(`Test field validator with valid data`, (mockRequest) => {
    it('should not throw exception for field `' + mockRequest.fieldName + '`', () => {
      expect(() => { RequestFieldValidator.validateField(mockRequest.requestField, mockRequest.fieldName, mockRequest.fieldType) }).not.toThrow(HttpException);
    });
  });

  const mockInvalidData = [
    {
      requestField: null,
      fieldType: 'string',
      fieldName: 'debtId',
    },
    {
      requestField: 123,
      fieldType: 'string',
      fieldName: 'debtId',
    },
    {
      requestField: null,
      fieldType: 'date',
      fieldName: 'paidAt',
    },
    {
      requestField: 'abc',
      fieldType: 'date',
      fieldName: 'paidAt',
    },
    {
      requestField: null,
      fieldType: 'number',
      fieldName: 'paidAmount',
    },
    {
      requestField: 'abc',
      fieldType: 'number',
      fieldName: 'paidAmount',
    },
  ];

  describe.each(mockInvalidData)(`Test field validator with invalid data`, (mockRequest) => {
    it('should throw exception for field `' + mockRequest.fieldName + '`', () => {
      expect(() => { RequestFieldValidator.validateField(mockRequest.requestField, mockRequest.fieldName, mockRequest.fieldType) }).toThrow(HttpException);
    });
  });

});