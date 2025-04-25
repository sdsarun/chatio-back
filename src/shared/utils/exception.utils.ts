import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export function getExceptionHttpStatus(exception: any): number {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
}

export function getExceptionMessage(exception: any): string {
  if (exception instanceof HttpException) {
    const responseError: string | Record<string, any> = exception.getResponse();
    if (typeof responseError === 'string') {
      return responseError;
    } else {
      return responseError?.message as string;
    }
  } else if (exception instanceof WsException) {
    const error = exception.getError();
    if (typeof error === "object") {
      if (error instanceof HttpException) {
        const responseError: string | Record<string, any> = error.getResponse();
        if (typeof responseError === 'string') {
          return responseError;
        } else {
          return responseError?.message as string;
        }
      } else if (error instanceof Error) {
        return error.message;
      } else {
        return new InternalServerErrorException().message;
      }
    } else {
      return error;
    }
  } else if (exception instanceof Error) {
    return exception.message;
  }

  return new InternalServerErrorException().message;
}

export function getExceptionName(exception: any): string {
  if (exception instanceof WsException) {
    const error = exception.getError();
    if (typeof error === "object") {
      if (error instanceof Error) {
        return error.name;
      }
      return new InternalServerErrorException().name;
    } else {
      return error;
    }
  }
  return new InternalServerErrorException().name;
}

export function parseException(exception: any): {
  httpStatus: number;
  message: string;
  name: string;
} {
  return {
    httpStatus: getExceptionHttpStatus(exception),
    message: getExceptionMessage(exception),
    name: getExceptionName(exception)
  }
}