import { Body, Controller, Post, Get } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user-dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  createUser() {
    return this.usersService.createUser();
  }

  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
