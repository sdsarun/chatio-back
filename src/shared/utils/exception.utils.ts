import { HttpException, HttpStatus } from '@nestjs/common';

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
  }

  if (exception instanceof Error) {
    return exception.message;
  }

  return 'Internal Server Error';
}
