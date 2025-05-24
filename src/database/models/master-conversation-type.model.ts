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

export type MasterConversationTypeCreation = Partial<
  Pick<MasterConversationType, 'id' | 'name'>
>;

@Table({ tableName: 'master_conversation_types', timestamps: false, paranoid: false })
export class MasterConversationType extends Model<
  MasterConversationType,
  MasterConversationTypeCreation
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
