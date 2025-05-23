import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Conversation } from './conversation.model';
import { User } from './user.model';
import { MessageRead } from './message-read.model';

export type MessageCreation = Partial<
  Pick<
    Message,
    | 'id'
    | 'senderId'
    | 'conversationId'
    | 'content'
    | 'sentAt'
    | 'updatedAt'
    | 'deletedAt'
  >
>;

@Table({ tableName: 'messages' })
export class Message extends Model<Message, MessageCreation> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    field: 'sender_id',
    type: DataType.UUID,
    onDelete: 'SET NULL',
  })
  senderId!: string | null;

  @ForeignKey(() => Conversation)
  @Column({
    field: 'conversation_id',
    type: DataType.UUID,
    onDelete: 'SET NULL',
  })
  conversationId!: string | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  content!: string;

  @CreatedAt
  @Column({ field: 'sent_at', type: DataType.DATE })
  sentAt!: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
    type: DataType.DATE,
  })
  updatedAt!: Date;

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  deletedAt!: Date | null;

  @BelongsTo(() => User)
  sender!: User;

  @BelongsTo(() => Conversation)
  conversation!: Conversation;

  @HasMany(() => MessageRead)
  messageRead!: MessageRead[]
}
