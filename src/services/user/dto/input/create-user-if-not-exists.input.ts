import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { UserGender, UserRole } from '../../../master/master.constants';

@InputType()
export class CreateUserIfNotExistsInput {
  @ValidateIf((dto: CreateUserIfNotExistsInput) => dto.role === UserRole.REGISTERED)
  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty({ message: "username is required when create with role REGISTERED" })
  username: string;

  @Field(() => UserRole)
  @IsIn([UserRole.GUEST, UserRole.REGISTERED])
  @IsNotEmpty()
  role: UserRole;

  @Field(() => UserGender)
  @IsEnum(UserGender)
  @IsNotEmpty()
  gender: UserGender;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  aka?: string;
}
