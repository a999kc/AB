import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Scan } from "../scans/scans.model";

@Table({ tableName: "users", timestamps: false })
export class User extends Model {
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  declare id: number;

  @HasMany(() => Scan)
  scans: Scan[];
}
