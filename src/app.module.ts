import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './configuration/configuration.module';
import { LoggerModule } from './logger/logger.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { FormatResponseInterceptor } from './common/interceptors/format-response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ApplyRequestIdMiddleware } from './common/middlewares/apply-request-id.middleware';

@Module({
  imports: [ConfigurationModule, LoggerModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: FormatResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApplyRequestIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
