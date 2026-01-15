import { ConflictException, Inject, Injectable } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { RedisService } from "src/common/redis/redis.service";
import { Category } from "src/generated/prisma/client";

import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto } from "./dto/create.dto";

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    this.logger.info(`CategoriesService.create`);
    const { name } = createCategoryDto;

    const existing = await this.categoriesRepository.findByKey("name", name);
    if (existing) throw new ConflictException(`Category already exists`);

    return await this.categoriesRepository.create({ name });
  }
}
