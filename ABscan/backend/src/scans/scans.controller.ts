import { Controller, Delete, Post, Get, Body, Param, ParseIntPipe, Query} from "@nestjs/common";
import { ScansService } from "./scans.service";
import { CreateScansDTO, ScansQueryDto } from "./dto/create-scans-dto";


@Controller("scans")
export class ScansController {
  constructor(private scansService: ScansService) {}

  @Post()
  create(@Body() dto: CreateScansDTO) {
    return this.scansService.create(dto);
  }

  @Get()
  findAll(@Query() query: ScansQueryDto) {
    return this.scansService.findAll(query);
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
