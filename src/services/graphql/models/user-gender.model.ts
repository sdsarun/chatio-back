import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserGender {
  @Field(() => ID)
  id: string;
  name: string;
}