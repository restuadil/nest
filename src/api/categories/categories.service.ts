import { ConflictException, Inject, Injectable } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { generateMeta } from "src/common/helpers/generate-meta";
import { RedisService } from "src/common/redis/redis.service";
import { Category } from "src/generated/prisma/client";
import { Meta, PaginationResponse } from "src/types/web.type";

import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto } from "./dto/create.dto";
import { QueryCategoryDto } from "./dto/query.dto";

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

  async findAll(
    queryCategoryDto: QueryCategoryDto,
  ): Promise<PaginationResponse<Category>> {
    this.logger.info(`CategoriesService.findAll`);

    const { page, limit } = queryCategoryDto;

    const cacheKey = `categories:${JSON.stringify(queryCategoryDto)}`;
    const cached =
      await this.redisService.get<PaginationResponse<Category>>(cacheKey);
    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.categoriesRepository.findAll(queryCategoryDto),
      this.categoriesRepository.count(queryCategoryDto),
    ]);
    this.logger.info(`data ${JSON.stringify(data)}`);
    const meta: Meta = generateMeta(page, limit, total);

    await this.redisService.set(cacheKey, { data, meta });
    return { data, meta };
  }
}
