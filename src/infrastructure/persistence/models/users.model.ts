import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

@Table({
  tableName: "users",
  schema: "public",
  timestamps: false,
})
export class UserModel extends Model<UserModel> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: "id",
  })
  id!: number;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
    field: "email",
  })
  email?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(20),
    field: "accountnumber",
  })
  accountNumber?: string;
}
