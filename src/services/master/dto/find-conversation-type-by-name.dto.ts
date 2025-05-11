import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ConversationType } from "../master.constants";

export class FindConversationTypeByNameDTO {
  @IsString()
  @IsEnum(ConversationType)
  @IsNotEmpty()
  name: ConversationType;
}