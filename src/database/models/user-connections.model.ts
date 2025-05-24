import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

export type UserConnectionCreation = Partial<
  Pick<
    UserConnection,
    | 'id'
    | 'requesterId'
    | 'addresseeId'
    | 'isAccept'
    | 'requestedAt'
    | 'acceptedAt'
  >
>;

@Table({ tableName: 'user_connections', updatedAt: false, paranoid: false })
export class UserConnection extends Model<UserConnection, UserConnectionCreation> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'requester_id',
    onDelete: 'SET NULL',
  })
  requesterId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'addressee_id',
    onDelete: 'SET NULL',
  })
  addresseeId!: string;

  @Column({
    type: DataType.BOOLEAN,
    field: 'is_accept',
  })
  isAccept!: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'requested_at',
  })
  requestedAt!: Date;

  @Column({
    type: DataType.DATE,
    field: 'accepted_at',
  })
  acceptedAt!: Date;

  @BelongsTo(() => User)
  requester: User;

  @BelongsTo(() => User)
  addressee: User;
}
