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

export type UserBlockedUserCreation = Partial<
  Pick<UserBlockedUser, 'id' | 'userId' | 'blockedUserId' | 'blockedAt'>
>;

@Table({ tableName: 'user_blocked_users' })
export class UserBlockedUser extends Model<
  UserBlockedUser,
  UserBlockedUserCreation
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'blocked_user_id',
  })
  blockedUserId!: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'blocked_at',
  })
  blockedAt!: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => User)
  blockedUser: User;
}
