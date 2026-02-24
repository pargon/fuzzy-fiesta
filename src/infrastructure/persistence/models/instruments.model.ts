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
  tableName: "instruments",
  schema: "public",
  timestamps: false,
})
export class InstrumentModel extends Model<InstrumentModel> {
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
    type: DataType.STRING(10),
    field: "ticker",
  })
  ticker?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(255),
    field: "name",
  })
  name?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(10),
    field: "type",
  })
  type?: string;
}
