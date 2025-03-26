import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UserRole } from "../master.constants";

export class FindUserRoleByNameDTO {
  @IsString()
  @IsEnum(UserRole)
  @IsNotEmpty()
  name: UserRole;
}