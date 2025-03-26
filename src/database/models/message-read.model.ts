import {
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Message } from './message.model';
import { User } from './user.model';

export type MessageReadCreation = Partial<
  Pick<MessageRead, 'id' | 'messageId' | 'userId' | 'readAt'>
>;

@Table({ tableName: 'message_reads', timestamps: false, paranoid: false })
export class MessageRead extends Model<MessageRead, MessageReadCreation> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Message)
  @Column({
    field: 'message_id',
    type: DataType.UUID,
    onDelete: 'SET NULL',
  })
  messageId!: string | null;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.UUID,
    onDelete: 'SET NULL',
  })
  userId!: string | null;

  @Column({ field: 'read_at', type: DataType.DATE })
  readAt!: Date | null;
}
