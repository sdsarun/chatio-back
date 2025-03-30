import { InputType, PickType } from "@nestjs/graphql";
import { User } from "../../../graphql/models/user.model";

@InputType()
export class UpdateUserProfileInput extends PickType(User, [
  'aka',
  'userGender',
]) {}