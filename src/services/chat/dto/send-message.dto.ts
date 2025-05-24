import { IsString, IsUUID } from "class-validator";

export class SendMessageDTO {
  @IsString()
  content: string;

  @IsUUID()
  senderId: string;

  @IsUUID()
  conversationId: string;
}