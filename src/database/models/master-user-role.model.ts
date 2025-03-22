import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

export type MasterUserRoleCreation = Partial<
  Pick<MasterUserRole, 'id' | 'name'>
>;

@Table({ tableName: 'master_user_roles' })
export class MasterUserRole extends Model<
  MasterUserRole,
  MasterUserRoleCreation
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(128))
  name!: string;
}
