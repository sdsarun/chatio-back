import { ArgumentsHost, Catch, ContextType, ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { Socket } from 'socket.io';
import {
  getExceptionHttpStatus,
  getExceptionMessage,
  parseException
} from '../../shared/utils/exception.utils';

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

      case 'ws': {
        this.handleWsContext(exception, host);
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

  private handleWsContext(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client: Socket = ctx.getClient();
    
    const { httpStatus, message, name } = parseException(exception);

    const responseBody = {
      success: false,
      statusCode: httpStatus,
      message: message,
      error: {
        name,
        timestamp: new Date().toISOString(),
      },
    };

    client.emit('exception', responseBody);
  }
}
