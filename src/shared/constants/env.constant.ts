import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';
import { IsTrueOrFalseString } from '../../common/validators/is-true-or-false-string.validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  DB_DIALECT: string;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  DB_SCHEMA: string;

  @IsTrueOrFalseString()
  DB_SSL: string;

  @IsString()
  JWT_ISSUER: string;

  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsString()
  JWT_ACCESS_TOKEN_EXP: string;

  @IsString()
  OAUTH_GOOGLE_CLIENT_ID: string;

  @IsString()
  PUBLIC_API_KEY: string;
}
