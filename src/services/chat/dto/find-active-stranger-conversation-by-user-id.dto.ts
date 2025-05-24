import { IsUUID } from "class-validator";

export class FindActiveStrangerConversationByUserIdDTO {
  @IsUUID()
  userId: string;
}