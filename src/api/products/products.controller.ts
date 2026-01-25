import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { Public } from "src/common/decorators/public.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { idSchema, type IdDto } from "src/common/helpers/cuid.dto";
import { ZodPipe } from "src/common/pipes/zod.pipe";
import { Product } from "src/generated/prisma/client";
import { UserRole } from "src/generated/prisma/enums";
import { ControllerResponse } from "src/types/web.type";

import { type CreateProductDto, createProductSchema } from "./dto/create.dto";
import { queryProductSchema, type QueryProductDto } from "./dto/query.dto";
import {
  FindAllProductsResponse,
  FindByIdProductResponse,
} from "./dto/response.dto";
import { updateProductSchema, type UpdateProductDto } from "./dto/update.dto";
import { ProductsService } from "./products.service";

@Controller("api/products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  async create(
    @Body(new ZodPipe(createProductSchema)) createProductDto: CreateProductDto,
  ): Promise<ControllerResponse<Product>> {
    this.logger.info(`ProductsController.create`);

    const result = await this.productsService.create(createProductDto);
    return { message: "Product created successfully", data: result };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Public()
  async findAll(
    @Query(new ZodPipe(queryProductSchema)) queryProductDto: QueryProductDto,
  ): Promise<ControllerResponse<FindAllProductsResponse[]>> {
    this.logger.info(`ProductsController.findAll`);
    const { data, meta } = await this.productsService.findAll(queryProductDto);
    return { message: "Products found successfully", data, meta };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Public()
  async findById(
    @Param("id", new ZodPipe(idSchema)) id: IdDto,
  ): Promise<ControllerResponse<FindByIdProductResponse>> {
    this.logger.info(`ProductsController.findById`);
    const product = await this.productsService.findById(id);
    return { message: "Product found successfully", data: product };
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async update(
    @Param("id", new ZodPipe(idSchema)) id: IdDto,
    @Body(new ZodPipe(updateProductSchema)) updateProductDto: UpdateProductDto,
  ): Promise<ControllerResponse<Product>> {
    this.logger.info(`ProductsController.update`);
    const result = await this.productsService.update(id, updateProductDto);
    return { message: "Product updated successfully", data: result };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async delete(
    @Param("id", new ZodPipe(idSchema)) id: IdDto,
  ): Promise<ControllerResponse<void>> {
    this.logger.info(`ProductsController.delete`);
    await this.productsService.delete(id);
    return { message: "Product deleted successfully", data: null };
  }
}
