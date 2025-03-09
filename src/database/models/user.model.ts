import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  Unique,
  UpdatedAt
} from 'sequelize-typescript';
import { MasterUserType } from './master-user-type.model';

export type UserCreation = Partial<
  Pick<
    User,
    'id' | 'username' | 'userTypeId' | 'createdAt' | 'updatedAt' | 'deletedAt'
  >
>;

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreation> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(128))
  username!: string;

  @ForeignKey(() => MasterUserType)
  @Column({
    field: 'user_type_id',
    type: DataType.UUID,
    onDelete: 'SET NULL',
  })
  userTypeId!: string;

  @Column({ field: 'is_active', type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
    type: DataType.DATE,
  })
  updatedAt!: Date;

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  deletedAt!: Date | null;

  @BelongsTo(() => MasterUserType)
  userType!: MasterUserType;
}
