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

export type MasterUserGenderCreation = Partial<
  Pick<MasterUserGender, 'id' | 'name'>
>;

@Table({ tableName: 'master_user_genders' })
export class MasterUserGender extends Model<
  MasterUserGender,
  MasterUserGenderCreation
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
