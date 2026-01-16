import {
  Body,
  Controller,
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
import { type IdDto, idSchema } from "src/common/helpers/cuid.dto";
import { ZodPipe } from "src/common/pipes/zod.pipe";
import { Category } from "src/generated/prisma/client";
import { UserRole } from "src/generated/prisma/enums";
import { ControllerResponse } from "src/types/web.type";

import { CategoriesService } from "./categories.service";
import { type CreateCategoryDto, createCategorySchema } from "./dto/create.dto";
import { type QueryCategoryDto, queryCategorySchema } from "./dto/query.dto";
import { updateCategorySchema, type UpdateCategoryDto } from "./dto/update.dto";

@Controller("api/categories")
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  async create(
    @Body(new ZodPipe(createCategorySchema))
    createCategoryDto: CreateCategoryDto,
  ): Promise<ControllerResponse<Category>> {
    this.logger.info(`CategoriesController.create`);
    const result = await this.categoriesService.create(createCategoryDto);
    return { message: "Category created successfully", data: result };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Public()
  async findAll(
    @Query(new ZodPipe(queryCategorySchema)) queryCategoryDto: QueryCategoryDto,
  ): Promise<ControllerResponse<Category[]>> {
    this.logger.info(`CategoriesController.findAll`);
    const { data, meta } =
      await this.categoriesService.findAll(queryCategoryDto);
    return { message: "Categories fetched successfully", data, meta };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Public()
  async findById(
    @Param("id", new ZodPipe(idSchema)) id: IdDto,
  ): Promise<ControllerResponse<Category>> {
    this.logger.info(`CategoriesController.findById`);
    const result = await this.categoriesService.findById(id);
    return { message: "Category fetched successfully", data: result };
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async update(
    @Param("id", new ZodPipe(idSchema)) id: IdDto,
    @Body(new ZodPipe(updateCategorySchema))
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ControllerResponse<Category>> {
    this.logger.info(`CategoriesController.update`);
    const result = await this.categoriesService.update(id, updateCategoryDto);
    return { message: "Category updated successfully", data: result };
  }
}
