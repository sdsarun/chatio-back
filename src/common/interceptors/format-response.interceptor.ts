import {
  CallHandler,
  ContextType,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { SkipFormatResponseInterceptorPropertyName } from '../decorators/skip-format-interceptor.decorator';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const isSkip = context.getHandler()[SkipFormatResponseInterceptorPropertyName];
    if (isSkip) {
      return next.handle();
    }

    const contextType = context.getType<ContextType | 'graphql'>();
    
    switch (contextType) {
      case 'http': {
        return this.formatHttpResponse(context, next);
      }
      case 'graphql': {
        return this.formatGraphQLResponse(context, next);
      }
      default: {
        return next.handle();
      }
    }
  }

  private formatHttpResponse(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    
    return next.handle().pipe(
      map((controllerResult) => {
        const message = controllerResult?.message ?? 'Success';
        const formattedResponseObject = {
          success: true,
          statusCode: response.statusCode,
          message,
          data: controllerResult,
        };
        return formattedResponseObject;
      }),
    );
  }

  private formatGraphQLResponse(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle();
  }
}