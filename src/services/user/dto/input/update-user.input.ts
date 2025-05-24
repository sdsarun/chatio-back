import { Field, InputType, PickType } from '@nestjs/graphql';
import { UserGender } from '../../../master/master.constants';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @IsString()
  @IsOptional()
  aka?: string;

  @Field(() => UserGender, { nullable: true })
  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender;

  @IsUUID()
  @IsOptional()
  userRoleId?: string;
  
  @IsUUID()
  @IsOptional()
  userGenderId?: string;

  @IsString()
  @IsOptional()
  username?: string;
}

@InputType()
export class UpdateUserProfileInput extends PickType(UpdateUserInput, [
  'aka',
  'gender',
]) {}
