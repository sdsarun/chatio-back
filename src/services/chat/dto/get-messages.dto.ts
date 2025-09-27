import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class GetMessagesDTO {
  @IsUUID()
  @IsOptional()
  requesterId?: string;

  @IsUUID()
  conversationId: string;

  @IsUUID()
  @IsOptional()
  messageId?: string;

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  offset?: number;

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  limit?: number;
}
