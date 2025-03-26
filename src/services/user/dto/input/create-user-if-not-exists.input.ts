import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";
import { UserGender, UserRole } from "../../../master/master.constants";

@InputType()
export class CreateUserIfNotExistsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  username: string;

  @Field(() => UserRole)
  @IsIn([UserRole.GUEST, UserRole.REGISTERED])
  @IsNotEmpty()
  role: UserRole;

  @Field(() => UserGender)
  @IsEnum(UserGender)
  @IsNotEmpty()
  gender: UserGender

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  aka?: string;
}