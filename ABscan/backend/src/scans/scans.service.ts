import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Scan } from "./scans.model";
import { CreateScansDTO, ScansQueryDto } from "./dto/create-scans-dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class ScansService {
  constructor(
    @InjectModel(Scan) private scanRepository: typeof Scan,
    private usersService: UsersService
  ) {}

  async create(dto: CreateScansDTO) {
    
    const user = await this.usersService.findById(dto.user);
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user} not found`);
    }

    
    let isAb: boolean;
    const isAbValue = dto.isAb as any; 
    if (typeof isAbValue === "boolean") {
      isAb = isAbValue;
    } else if (typeof isAbValue === "string") {
     
      isAb = isAbValue.toLowerCase() === "true";
    } else {
      
      isAb = !!isAbValue;
    }

    
    console.log(`Creating scan: user=${dto.user}, isAb=${isAbValue} (type: ${typeof isAbValue}) -> ${isAb} (boolean)`);

    const scan = await this.scanRepository.create({
      user: dto.user,
      isAb: isAb,
    });
    return scan;
  }

  async findAll(query: ScansQueryDto): Promise<Scan[]> {
    const { searchId, sortBy = 'date', sortOrder = 'desc' } = query;

    // WHERE
    const where: any = {};
    if (searchId) {
      where.id = parseInt(searchId, 10);
    }

    // ORDER BY
    const order: [string, 'ASC' | 'DESC'][] = [];
    if (sortBy === 'date') {
      order.push(['createdAt', sortOrder.toUpperCase() as 'ASC' | 'DESC']);
    } else if (sortBy === 'status') {
      order.push(['isAb', sortOrder.toUpperCase() as 'ASC' | 'DESC']);
    }

    // Запрос
    const result = await this.scanRepository.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order,
      attributes: ['id', 'user', 'isAb', 'createdAt'],
      raw: true, 
    });

    
    return Array.isArray(result) ? result : [];
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
