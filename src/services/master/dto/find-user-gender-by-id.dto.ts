import { IsNotEmpty, IsUUID } from "class-validator";

export class FindUserGenderByIdDTO {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}