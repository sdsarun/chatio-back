import { ArgumentsHost, Catch, ContextType, ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  getExceptionHttpStatus,
  getExceptionMessage,
} from '../../shared/utils/exception.utils';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const type: ContextType | 'graphql' = host.getType();
    switch (type) {
      case 'graphql': {
        return exception;
      }

      case 'http': {
        this.handleHttpContext(exception, host);
        break;
      }

      default: {
        return exception;
      }
    }
  }

  private handleHttpContext(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

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
