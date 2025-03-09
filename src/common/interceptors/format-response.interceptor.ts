import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { SkipFormatResponseInterceptorPropertyName } from '../decorators/skip-format-interceptor.decorator';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  constructor() {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const isSkip = context.getHandler()[SkipFormatResponseInterceptorPropertyName];
    if (isSkip) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map<
        { message: string },
        { success: boolean; statusCode: number; message: string; data: any }
      >((controllerResult) => {
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
}
