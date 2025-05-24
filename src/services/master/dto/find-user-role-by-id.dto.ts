import { IsNotEmpty, IsUUID } from "class-validator";

export class FindUserRoleByIdDTO {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}