import { IsEnum } from "class-validator";
import { ConversationType } from "../../master/master.constants";

export class CreateConversationDTO {
  @IsEnum(ConversationType)
  conversationTypeName: ConversationType;
}