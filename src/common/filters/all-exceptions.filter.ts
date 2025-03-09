import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  getExceptionHttpStatus,
  getExceptionMessage,
} from '../../shared/utils/exception.utils';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const httpStatus: number = getExceptionHttpStatus(exception);
    const message: string = getExceptionMessage(exception);

    const requestId = request?._requestId;

    const responseBody = {
      success: false,
      statusCode: httpStatus,
      message: message,
      error: {
        name: exception?.name,
        timestamp: new Date().toISOString(),
        requestPath: `${httpAdapter.getRequestMethod(request)} - ${httpAdapter.getRequestUrl(request)}`,
        requestId: requestId,
      },
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
