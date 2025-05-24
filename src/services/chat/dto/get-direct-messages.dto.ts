import { IsOptional, IsUUID } from "class-validator";

export class GetDirectMessagesDTO {
  @IsUUID()
  @IsOptional()
  requesterId: string;

  @IsUUID()
  conversationId: string;
}