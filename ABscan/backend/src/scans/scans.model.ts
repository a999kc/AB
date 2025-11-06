import { ForeignKey, BelongsTo, Table, Column, Model, DataType } from "sequelize-typescript";
import { User } from "../users/users.model";
import { Optional } from "sequelize";

interface ScanAttrs {
  id?: number;
  user: number;
  isAb: boolean;
}

@Table({ tableName: "scans" })
export class Scan extends Model<ScanAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, unique: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  user: number;

  @BelongsTo(() => User)
  declare userData?: User;

  @Column({ type: DataType.BOOLEAN })
  isAb: boolean;
}
