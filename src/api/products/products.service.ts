import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { IdDto } from "src/common/helpers/cuid.dto";
import { generateMeta } from "src/common/helpers/generate-meta";
import { RedisService } from "src/common/redis/redis.service";
import { Product } from "src/generated/prisma/client";
import { Meta, PaginationResponse } from "src/types/web.type";

import { ProductsRepository } from "./products.repository";
import { CategoriesService } from "../categories/categories.service";
import { CreateProductDto } from "./dto/create.dto";
import { QueryProductDto } from "./dto/query.dto";
import {
  FindAllProductsResponse,
  FindByIdProductResponse,
  toFindAllProductResponse,
  toFindByIdProductResponse,
} from "./dto/response.dto";
import { UpdateProductDto } from "./dto/update.dto";

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
  ): Promise<PaginationResponse<FindAllProductsResponse>> {
    this.logger.info(`ProductsService.findAll`);

    const { limit, page } = queryProductDto;
    this.logger.info(`queryProductDto ${JSON.stringify(queryProductDto)}`);
    const cacheKey = `products:${JSON.stringify(queryProductDto)}`;
    const cached =
      await this.redisService.get<PaginationResponse<FindAllProductsResponse>>(
        cacheKey,
      );
    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.productsRepository.findAll(queryProductDto),
      this.productsRepository.count(queryProductDto),
    ]);

    const meta: Meta = generateMeta(page, limit, total);

    await this.redisService.set(cacheKey, { data, meta });
    return { data: data.map(toFindAllProductResponse), meta };
  }
  async findById(id: IdDto): Promise<FindByIdProductResponse> {
    this.logger.info(`ProductsService.findById`);
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException("Product not found");
    return toFindByIdProductResponse(product);
  }
  async update(
    id: IdDto,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    this.logger.info(`ProductsService.update`);
    const { categoryIds, images, name, price, status, description } =
      updateProductDto;

    await this.categoriesService.findByIds(categoryIds ?? []);

    const product = await this.productsRepository.findByKey("id", id);
    if (!product) throw new NotFoundException("Product not found");
    const existing = await this.productsRepository.findByKey(
      "name",
      name ?? product.name,
    );
    if (existing && existing.id !== id)
      throw new ConflictException("Product already exists");

    const updated = await this.productsRepository.update(id, {
      name: name ?? product.name,
      description: description ?? product.description,
      images:
        images?.map((image) => image) ?? product.images.map((image) => image),
      price: price ?? product.price,
      status: status ?? product.status,
      ProductCategory: {
        deleteMany: categoryIds?.map((_categoryId) => ({})),
        create: categoryIds?.map((categoryId) => ({ categoryId })),
      },
    });

    await this.redisService.deleteByPattern("products*");

    return updated;
  }
  async delete(id: IdDto): Promise<void> {
    this.logger.info(`ProductsService.delete`);
    await this.findById(id);
    await this.productsRepository.delete(id);
    await this.redisService.deleteByPattern("products*");
  }
}
