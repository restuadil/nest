import { ConflictException, Inject, Injectable } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { generateMeta } from "src/common/helpers/generate-meta";
import { RedisService } from "src/common/redis/redis.service";
import { Product } from "src/generated/prisma/client";
import { Meta, PaginationResponse } from "src/types/web.type";

import { ProductsRepository } from "./products.repository";
import { CategoriesService } from "../categories/categories.service";
import { CreateProductDto } from "./dto/create.dto";
import { QueryProductDto } from "./dto/query.dto";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly categoriesService: CategoriesService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.info(`ProductsService.create`);

    const { name, description, images, price, status, categoryIds } =
      createProductDto;

    await this.categoriesService.findByIds(categoryIds);

    const existing = await this.productsRepository.findByKey("name", name);
    if (existing) throw new ConflictException("Product already exists");

    const product = await this.productsRepository.create({
      name,
      description,
      images,
      price,
      status,
      ProductCategory: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    });

    return product;
  }
  async findAll(
    queryProductDto: QueryProductDto,
  ): Promise<PaginationResponse<Product>> {
    this.logger.info(`ProductsService.findAll`);

    const { limit, page } = queryProductDto;
    this.logger.info(`queryProductDto ${JSON.stringify(queryProductDto)}`);
    const cacheKey = `products:${JSON.stringify(queryProductDto)}`;
    const cached =
      await this.redisService.get<PaginationResponse<Product>>(cacheKey);
    if (cached) return cached;

    const [data, otal] = await Promise.all([
      this.productsRepository.findAll(queryProductDto),
      this.productsRepository.count(queryProductDto),
    ]);

    const meta: Meta = generateMeta(page, limit, otal);

    await this.redisService.set(cacheKey, { data, meta });
    return { data, meta };
  }
}
