import { IsUUID } from 'class-validator';

export class findConversationParticipantByConversationIdDTO {
  @IsUUID()
  conversationId: string;
}
