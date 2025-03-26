import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UserGender } from "../master.constants";

export class FindUserGenderByNameDTO {
  @IsString()
  @IsEnum(UserGender)
  @IsNotEmpty()
  name: UserGender;
}