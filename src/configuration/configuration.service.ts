import {
  Injectable,
  ValidationPipeOptions,
  VersioningOptions,
  VersioningType,
} from '@nestjs/common';
import {
  CorsOptions,
  CorsOptionsDelegate,
} from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import {
  Environment,
  EnvironmentVariables,
} from '../shared/constants/env.constant';

@Injectable()
export class ConfigurationService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  get config(): ConfigService<EnvironmentVariables> {
    return this.configService;
  }

  get appConfig(): {
    port: number;
    environment: Environment;
  } {
    return {
      environment: this.config.get('NODE_ENV') ?? Environment.Development,
      port: this.config.get('PORT') ?? 5432,
    };
  }

  get isDevelopment(): boolean {
    return this.appConfig.environment === Environment.Development;
  }

  get isProduction(): boolean {
    return this.appConfig.environment === Environment.Production;
  }

  get isTest(): boolean {
    return this.appConfig.environment === Environment.Test;
  }

  get corsConfig(): CorsOptions | CorsOptionsDelegate<any> {
    return {};
  }

  get swaggerConfig(): {
    title: string;
    description: string;
    version: string;
    endpointName: string;
  } {
    return {
      title: 'Example App',
      description: 'Example description.',
      version: '0.0.1',
      endpointName: 'docs',
    };
  }

  get validationPipeConfig(): ValidationPipeOptions {
    return {
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    };
  }

  get versioningConfig(): VersioningOptions {
    return {
      type: VersioningType.URI,
      defaultVersion: '1',
    };
  }

  get databaseConfig() {
    return {}
  }
}
