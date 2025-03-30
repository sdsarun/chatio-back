import { ArgsType, Field, ID } from '@nestjs/graphql';
import { UpdateUserInput, UpdateUserProfileInput } from '../input/update-user.input';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Type as NestType } from '@nestjs/common';

function UpdateUserType<T extends UpdateUserInput>(classRef: NestType<T>) {
  @ArgsType()
  abstract class UpdateUserGenericArgs {
    @Field(() => ID)
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @Field(() => classRef)
    @Type(() => classRef)
    @ValidateNested()
    updateUserData: T;
  }

  return UpdateUserGenericArgs;
}

@ArgsType()
export class UpdateUserArgs extends UpdateUserType(UpdateUserInput) {}

@ArgsType()
export class UpdateUserProfileArgs extends UpdateUserType(UpdateUserProfileInput) {}