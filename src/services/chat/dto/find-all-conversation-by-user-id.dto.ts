import { IsBoolean, IsEnum, IsOptional, IsUUID } from "class-validator";
import { ConversationType } from "../../master/master.constants";

export class FindAllConversationByUserIdDTO {
  @IsUUID()
  userId: string;

  @IsEnum(ConversationType)
  @IsOptional()
  conversationTypeName?: ConversationType;

  @IsBoolean()
  @IsOptional()
  isLeft?: boolean;
}