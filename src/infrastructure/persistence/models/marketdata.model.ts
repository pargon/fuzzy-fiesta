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
  tableName: "marketdata",
  schema: "public",
  timestamps: false,
})
export class MarketDataModel extends Model<MarketDataModel> {
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
    type: DataType.DECIMAL,
    field: "high",
  })
  high?: string;

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL,
    field: "low",
  })
  low?: string;

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL,
    field: "open",
  })
  open?: string;

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL,
    field: "close",
  })
  close?: string;

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL,
    field: "previousclose",
  })
  previousClose?: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATEONLY,
    field: "date",
  })
  date?: string;
}
