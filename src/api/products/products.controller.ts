import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { Roles } from "src/common/decorators/roles.decorator";
import { ZodPipe } from "src/common/pipes/zod.pipe";
import { Product } from "src/generated/prisma/client";
import { UserRole } from "src/generated/prisma/enums";
import { ControllerResponse } from "src/types/web.type";

import { type CreateProductDto, createProductSchema } from "./dto/create.dto";
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
}
