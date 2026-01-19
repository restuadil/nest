import { ConflictException, Inject, Injectable } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { RedisService } from "src/common/redis/redis.service";
import { Product } from "src/generated/prisma/client";

import { ProductsRepository } from "./products.repository";
import { CategoriesService } from "../categories/categories.service";
import { CreateProductDto } from "./dto/create.dto";

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
}
