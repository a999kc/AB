import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Scan } from "./scans.model";
import { CreateScansDTO } from "./dto/create-scans-dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class ScansService {
  constructor(
    @InjectModel(Scan) private scanRepository: typeof Scan,
    private usersService: UsersService
  ) {}

  async create(dto: CreateScansDTO) {
    // Проверяем существование пользователя
    const user = await this.usersService.findById(dto.user);
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user} not found`);
    }

    // Явно преобразуем isAb в boolean, чтобы гарантировать правильное значение
    // Это решает проблему, когда значение приходит как строка "true"/"false" или другие форматы
    let isAb: boolean;
    const isAbValue = dto.isAb as any; // Используем any для обработки разных типов
    if (typeof isAbValue === "boolean") {
      isAb = isAbValue;
    } else if (typeof isAbValue === "string") {
      // Преобразуем строку "true"/"false" в boolean
      isAb = isAbValue.toLowerCase() === "true";
    } else {
      // Для чисел и других типов: 0/falsy = false, остальное = true
      isAb = !!isAbValue;
    }

    // Логируем для отладки (можно убрать в production)
    console.log(`Creating scan: user=${dto.user}, isAb=${isAbValue} (type: ${typeof isAbValue}) -> ${isAb} (boolean)`);

    const scan = await this.scanRepository.create({
      user: dto.user,
      isAb: isAb,
    });
    return scan;
  }

  async findAll() {
    const scans = await this.scanRepository.findAll();
    return scans;
  }

  async findOne(id: number) {
    const scan = await this.scanRepository.findByPk(id);
    return scan;
  }

  async remove(id: number) {
    const scan = await this.scanRepository.findByPk(id);
    await scan?.destroy();
  }

  async removeAll() {
    const scans = await this.scanRepository.destroy({ where: {} });
    return scans;
  }
}
