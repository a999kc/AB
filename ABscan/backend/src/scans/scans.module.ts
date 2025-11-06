import { Module } from "@nestjs/common";
import { ScansController } from "./scans.controller";
import { ScansService } from "./scans.service";
import { Scan } from "./scans.model";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersModule } from "../users/users.module";

@Module({
  controllers: [ScansController],
  providers: [ScansService],
  imports: [SequelizeModule.forFeature([Scan]), UsersModule],
})
export class ScansModule {}
