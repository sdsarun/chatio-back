import { IsEnum } from "class-validator";
import { UserGender } from "../../master/master.constants";
import { ApiProperty } from "@nestjs/swagger";

export class GuestSignInDTO {
  @ApiProperty({ enum: UserGender })
  @IsEnum(UserGender)
  gender?: UserGender;
}