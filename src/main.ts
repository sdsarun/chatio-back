import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigurationService } from './configuration/configuration.service';
import { Logger } from './logger/logger.service';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  const configurationService = app.get(ConfigurationService);

  app.use(cookieParser());

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );
  app.useLogger(logger);

  app.enableCors(configurationService.corsConfig);
  app.enableVersioning(configurationService.versioningConfig);

  app.useGlobalPipes(
    new ValidationPipe(configurationService.validationPipeConfig),
  );

  if (configurationService.isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle(configurationService.swaggerConfig.title)
      .setDescription(configurationService.swaggerConfig.description)
      .setVersion(configurationService.swaggerConfig.version)
      .addBearerAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      configurationService.swaggerConfig.endpointName,
      app,
      documentFactory,
    );
  }

  const listenCallback = async () => {
    const url: string = await app.getUrl();
    logger.log(`Application running on ${url}`);
  };

  await app.listen(
    configurationService.appConfig.port,
    () => void listenCallback(),
  );
}

bootstrap();
