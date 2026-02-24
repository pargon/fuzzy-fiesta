import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Optional } from "sequelize";

export interface OrderModelAttributes {
  id: number;
  instrumentId?: number;
  userId?: number;
  size?: number;
  price?: string;
  type?: string;
  side?: string;
  status?: string;
  datetime?: Date;
}

export interface OrderCreationAttributes extends Optional<OrderModelAttributes, "id"> {}

@Table({
  tableName: "orders",
  schema: "public",
  timestamps: false,
})
export class OrderModel extends Model<OrderModelAttributes, OrderCreationAttributes> {
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
    type: DataType.INTEGER,
    field: "instrumentid",
  })
  instrumentId?: number;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
    field: "userid",
  })
  userId?: number;

  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
    field: "size",
  })
  size?: number;

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL,
    field: "price",
  })
  price?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(10),
    field: "type",
  })
  type?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(10),
    field: "side",
  })
  side?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(20),
    field: "status",
  })
  status?: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE(3),
    field: "datetime",
  })
  datetime?: Date;
}
