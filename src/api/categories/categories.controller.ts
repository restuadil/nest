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
import { Category } from "src/generated/prisma/client";
import { UserRole } from "src/generated/prisma/enums";
import { ControllerResponse } from "src/types/web.type";

import { CategoriesService } from "./categories.service";
import { type CreateCategoryDto, createCategorySchema } from "./dto/create.dto";

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
}
