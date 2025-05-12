import { IsUUID } from "class-validator";

export class JoinConversationDTO {
  @IsUUID()
  conversationId: string;
  @IsUUID()
  userId: string;
}