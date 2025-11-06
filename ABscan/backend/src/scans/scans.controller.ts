import { Controller, Delete, Post, Get, Body, Param, ParseIntPipe } from "@nestjs/common";
import { ScansService } from "./scans.service";
import { CreateScansDTO } from "./dto/create-scans-dto";

@Controller("scans")
export class ScansController {
  constructor(private scansService: ScansService) {}

  @Post()
  create(@Body() dto: CreateScansDTO) {
    return this.scansService.create(dto);
  }

  @Get()
  findAll() {
    return this.scansService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.scansService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.scansService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.scansService.removeAll();
  }
}
