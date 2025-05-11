import { IsNotEmpty, IsUUID } from "class-validator";

export class FindConversationTypeByIdDTO {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}