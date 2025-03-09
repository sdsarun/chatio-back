import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigurationService } from './configuration/configuration.service';
import { Logger } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  const configurationService = app.get(ConfigurationService);

  app.use(helmet());
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

  await app.listen(configurationService.appConfig.port, () =>
    logger.log(
      `Application running on port ${configurationService.appConfig.port}`,
    ),
  );
}

bootstrap();
