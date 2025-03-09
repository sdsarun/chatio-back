import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { getExceptionHttpStatus, getExceptionMessage } from '../../shared/utils/exception.utils';
import { Logger } from '../../logger/logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    const requestId = request?._requestId;

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
