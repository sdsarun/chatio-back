import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Conversation } from './conversation.model';
import { User } from './user.model';

export type ConversationParticipantCreation = Partial<
  Pick<
    ConversationParticipant,
    'id' | 'conversationId' | 'userId' | 'joinedAt' | 'leftAt'
  >
>;

@Table({ tableName: 'conversation_participants', updatedAt: false, paranoid: false })
export class ConversationParticipant extends Model<
  ConversationParticipant,
  ConversationParticipantCreation
> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Conversation)
  @Column({
    field: 'conversation_id',
    type: DataType.UUID,
    onDelete: 'SET NULL',
  })
  conversationId!: string;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.UUID,
    onDelete: 'SET NULL',
  })
  userId!: string;

  @CreatedAt
  @Column({
    field: 'joined_at',
    type: DataType.DATE,
  })
  joinedAt!: Date;

  @Column({ field: 'left_at', type: DataType.DATE })
  leftAt!: Date | null;

  @BelongsTo(() => Conversation)
  conversation!: Conversation;

  @BelongsTo(() => User)
  user!: User;
}
