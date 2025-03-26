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
  UpdatedAt,
} from 'sequelize-typescript';
import { MasterUserRole } from './master-user-role.model';
import { MasterUserGender } from './master-user-gender.model';

export type UserCreation = Partial<
  Pick<
    User,
    | 'id'
    | 'username'
    | 'aka'
    | 'userRoleId'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
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

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(64))
  aka!: string;

  @ForeignKey(() => MasterUserRole)
  @Column({
    field: 'user_role_id',
    type: DataType.UUID,
    onDelete: 'SET NULL',
  })
  userRoleId!: string;

  @ForeignKey(() => MasterUserGender)
  @Column({
    field: 'user_gender_id',
    type: DataType.UUID,
    onDelete: 'SET NULL',
  })
  userGenderId!: string;

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

  @BelongsTo(() => MasterUserRole)
  userRole!: MasterUserRole;

  @BelongsTo(() => MasterUserGender)
  userGender!: MasterUserGender;
}
