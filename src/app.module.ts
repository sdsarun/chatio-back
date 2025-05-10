import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './configuration/configuration.module';
import { LoggerModule } from './logger/logger.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { FormatResponseInterceptor } from './common/interceptors/format-response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ApplyRequestIdMiddleware } from './common/middlewares/apply-request-id.middleware';
import { DatabaseModule } from './database/database.module';
import { GraphQLModule } from './services/graphql/graphql.module';
import { MasterModule } from './services/master/master.module';
import { UserModule } from './services/user/user.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './services/auth/auth.module';
import { AuthGuard } from './services/auth/auth.guard';
import { CacheManagerModule } from './services/cache-manager/cache-manager.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      global: true,
    }),
    ConfigurationModule,
    LoggerModule,
    DatabaseModule,
    CacheManagerModule,
    GraphQLModule,
    MasterModule,
    UserModule,
    AuthModule,
  ],
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApplyRequestIdMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
