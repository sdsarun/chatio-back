import { ArgsType, Field, ID } from '@nestjs/graphql';
import { UpdateUserProfileInput } from '../input/update-user-profile.input';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@ArgsType()
export class UpdateUserProfileArgs {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => UpdateUserProfileInput)
  @Type(() => UpdateUserProfileInput)
  @ValidateNested()
  updateUserProfileInput: UpdateUserProfileInput;
}
