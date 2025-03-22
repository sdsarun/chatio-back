import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";
import { UserRole } from "../../../master/master.constants";

@InputType()
export class CreateUserIfNotExistsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  username: string;

  @Field(() => String)
  @IsIn([UserRole.Guest, UserRole.Registered])
  @IsNotEmpty()
  role: UserRole;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  aka?: string;
}