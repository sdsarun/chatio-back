import { ModelCtor } from "sequelize-typescript";
import { MasterConversationType } from "./master-conversation-type.model";
import { MasterUserType } from "./master-user-type.model";
import { User } from "./user.model";
import { Conversation } from "./conversation.model";
import { ConversationParticipant } from "./conversation-participant.model";
import { MessageRead } from "./message-read.model";
import { Message } from "./message.model";

const DB_MODELS: string[] | ModelCtor[] = [
  MasterConversationType,
  MasterUserType,
  User,
  Conversation,
  ConversationParticipant,
  MessageRead,
  Message,
]

export default DB_MODELS;