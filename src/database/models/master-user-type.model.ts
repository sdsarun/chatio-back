import { AllowNull, Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';

export type MasterUserTypeCreation = Partial<
  Pick<MasterUserType, 'id' | 'name'>
>;

@Table({ tableName: 'master_user_types' })
export class MasterUserType extends Model<
  MasterUserType,
  MasterUserTypeCreation
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
