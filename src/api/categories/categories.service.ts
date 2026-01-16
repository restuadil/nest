import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { generateMeta } from "src/common/helpers/generate-meta";
import { RedisService } from "src/common/redis/redis.service";
import { Category } from "src/generated/prisma/client";
import { Meta, PaginationResponse } from "src/types/web.type";

import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto } from "./dto/create.dto";
import { QueryCategoryDto } from "./dto/query.dto";
import { UpdateCategoryDto } from "./dto/update.dto";

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

  async findById(id: string): Promise<Category> {
    this.logger.info(`CategoriesService.findById`);
    const category = await this.categoriesRepository.findByKey("id", id);
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    this.logger.info(`CategoriesService.update`);
    const { name } = updateCategoryDto;

    const category = await this.findById(id);
    const existing = await this.categoriesRepository.findByKey(
      "name",
      name ?? category.name,
    );
    if (existing && existing.id !== id)
      throw new ConflictException("Category already exists");

    const updated = await this.categoriesRepository.update(
      id,
      updateCategoryDto,
    );

    await this.redisService.deleteByPattern("categories*");

    return updated;
  }
}
