import { ModelCtor } from 'sequelize-typescript';
import { MasterConversationType } from './master-conversation-type.model';
import { User } from './user.model';
import { Conversation } from './conversation.model';
import { ConversationParticipant } from './conversation-participant.model';
import { MessageRead } from './message-read.model';
import { Message } from './message.model';
import { MasterUserRole } from './master-user-role.model';
import { UserConnection } from './user-connections.model';
import { UserBlockedUser } from './user-blocked-users.model';
import { MasterUserGender } from './master-user-gender.model';

const DB_MODELS: string[] | ModelCtor[] = [
  MasterConversationType,
  MasterUserRole,
  MasterUserGender,
  User,
  Conversation,
  ConversationParticipant,
  MessageRead,
  Message,
  UserConnection,
  UserBlockedUser,
];

export default DB_MODELS;
