import { IsOptional, IsUUID } from "class-validator";

export class LeftConversationDTO {
  @IsUUID()
  conversationId: string;

  @IsUUID()
  @IsOptional()
  userId?: string;
}