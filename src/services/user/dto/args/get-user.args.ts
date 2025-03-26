import { ArgsType, Field, ID } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID } from "class-validator";

@ArgsType()
export class GetUserArgs {
  @Field(() => ID)
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  aka?: string;

  @IsString()
  @IsOptional()
  username?: string;
}