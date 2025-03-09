import { HttpException } from '@nestjs/common';
import { getExceptionHttpStatus, getExceptionMessage } from './exception.utils';

describe('exceptionUtils', () => {
  describe('getExceptionHttpStatus', () => {
    it('should return status 400 once instance is HttpException', () => {
      const status = getExceptionHttpStatus(new HttpException('Notfound', 400));
      expect(status).toBe(400);
    });

    it('should return status 401 once instance is HttpException', () => {
      const status = getExceptionHttpStatus(new HttpException('Notfound', 401));
      expect(status).toBe(401);
    });

    it("should return 500 once instance is Error", () => {
      const status = getExceptionHttpStatus(new Error());
      expect(status).toBe(500);
    });

    it('should return status 500 once not HttpException instance', () => {
      const status1 = getExceptionHttpStatus({});
      const status2 = getExceptionHttpStatus('hello');
      const status3 = getExceptionHttpStatus(new Map());
      const status4 = getExceptionHttpStatus(new Set());
      const status5 = getExceptionHttpStatus([]);
      const status6 = getExceptionHttpStatus(undefined);
      const status7 = getExceptionHttpStatus(55);
      const status8 = getExceptionHttpStatus(new Error('message'));

      expect(status1).toBe(500);
      expect(status2).toBe(500);
      expect(status3).toBe(500);
      expect(status4).toBe(500);
      expect(status5).toBe(500);
      expect(status6).toBe(500);
      expect(status7).toBe(500);
      expect(status8).toBe(500);
    });
  });

  describe('getExceptionMessage', () => {
    it('should return message once instance is HttpException or Error', () => {
      const errorMessage = 'This is should got this error message';
      const message1 = getExceptionMessage(new HttpException(errorMessage, 400));
      const message2 = getExceptionMessage(new Error(errorMessage));

      expect(message1).toBe(errorMessage);
      expect(message2).toBe(errorMessage);
    });

    it("should return default internal server error once error is not instanceof HttpException", () => {
      const message1 = getExceptionMessage({});
      const message2 = getExceptionMessage('hello');
      const message3 = getExceptionMessage(new Map());
      const message4 = getExceptionMessage(new Set());
      const message5 = getExceptionMessage([]);
      const message6 = getExceptionMessage(undefined);
      const message7 = getExceptionMessage(55);
      
      expect(message1).toBe('Internal Server Error');
      expect(message2).toBe('Internal Server Error');
      expect(message3).toBe('Internal Server Error');
      expect(message4).toBe('Internal Server Error');
      expect(message5).toBe('Internal Server Error');
      expect(message6).toBe('Internal Server Error');
      expect(message7).toBe('Internal Server Error');
    });
  });
});
