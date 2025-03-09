import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { MasterConversationType } from './master-conversation-type.model';

export type ConversationCreation = Partial<
  Pick<Conversation, 'id' | 'conversationTypeId' | 'createdAt' | 'deletedAt'>
>;

@Table({ tableName: 'conversations' })
export class Conversation extends Model<Conversation, ConversationCreation> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => MasterConversationType)
  @Column({
    field: 'conversation_type_id',
    type: DataType.UUID,
    onDelete: 'SET NULL',
  })
  conversationTypeId!: string;

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
  })
  createdAt!: Date;

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  deletedAt!: Date | null;

  @BelongsTo(() => MasterConversationType)
  conversationType!: MasterConversationType;
}
