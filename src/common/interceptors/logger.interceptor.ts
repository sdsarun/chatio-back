import {
  CallHandler,
  ContextType,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  getExceptionHttpStatus,
  getExceptionMessage,
} from '../../shared/utils/exception.utils';
import { Logger } from '../../logger/logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}
  
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const type: ContextType | 'graphql' = context.getType();
    
    switch (type) {
      case 'graphql': {
        return this.handleGraphQLContext(context, next);
      }
      case 'http': {
        return this.handleHttpContext(context, next);
      }
      default: {
        return next.handle(); // Handle other context types gracefully
      }
    }
  }

  private handleGraphQLContext(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req: request } = gqlContext.getContext();
    const requestId = request?._requestId;
    const info = gqlContext.getInfo();
    
    const requestInfo = {
      requestId,
      operation: info?.operation?.operation,
      fieldName: info?.fieldName,
      variables: this.sanitize(gqlContext.getArgs()),
      headers: request?.headers ? this.sanitize(request.headers) : {},
    };

    return next.handle().pipe(
      tap((responseInfo) => {
        this.logger.setContext(LoggerInterceptor.name);
        this.logger.log(
          {
            request: requestInfo,
            response: responseInfo,
          },
          requestId,
        );
      }),
      catchError((error: Error) => {
        this.logger.setContext(LoggerInterceptor.name);
        this.logger.error(
          {
            request: requestInfo,
            error: {
              name: error?.name,
              status: getExceptionHttpStatus(error),
              message: getExceptionMessage(error),
            },
          },
          error?.stack,
          requestId,
        );
        return throwError(() => error);
      }),
    );
  }

  private handleHttpContext(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    
    if (!request) {
      return next.handle(); // Handle case where request might be undefined
    }
    
    const requestId = request._requestId;
    const requestInfo = {
      requestId,
      method: request.method,
      url: request.originalUrl,
      headers: this.sanitize(request.headers),
      body: this.sanitize(request.body),
      query: request.query,
    };

    return next.handle().pipe(
      tap((responseInfo) => {
        this.logger.setContext(LoggerInterceptor.name);
        this.logger.log(
          {
            request: requestInfo,
            response: responseInfo,
          },
          requestId,
        );
      }),
      catchError((error: Error) => {
        this.logger.setContext(LoggerInterceptor.name);
        this.logger.error(
          {
            request: requestInfo,
            error: {
              name: error?.name,
              status: getExceptionHttpStatus(error),
              message: getExceptionMessage(error),
            },
          },
          error?.stack,
          requestId,
        );
        return throwError(() => error);
      }),
    );
  }

  private sanitize(data: Record<string, any>): Record<string, any> {
    if (!data) return {};
    const sanitized = structuredClone(data);
    // delete sanitized['authorization'];
    // delete sanitized['password'];
    return sanitized;
  }
}