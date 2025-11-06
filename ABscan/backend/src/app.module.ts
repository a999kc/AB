import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { User } from "./users/users.model";
import { ScansModule } from "./scans/scans.module";
import { Scan } from "./scans/scans.model";

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: "../../.env",
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PWD,
      database: process.env.POSTGRES_DB,
      models: [User, Scan],
      autoLoadModels: true,
    }),
    UsersModule,
    ScansModule,
  ],
})
export class AppModule {}
