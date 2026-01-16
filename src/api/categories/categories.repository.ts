import { Injectable } from "@nestjs/common";

import { Query } from "src/common/helpers/base-query";
import { PrismaService } from "src/common/prisma/prisma.service";
import { Category } from "src/generated/prisma/client";
import {
  CategoryCreateInput,
  CategoryUpdateInput,
} from "src/generated/prisma/models";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByKey(
    key: keyof Category,
    value: string | Date,
  ): Promise<Category | null> {
    return await this.prismaService.category.findFirst({
      where: { [key]: value },
    });
  }
  async create(data: CategoryCreateInput): Promise<Category> {
    return await this.prismaService.category.create({ data });
  }
  async findAll(options: Query): Promise<Category[]> {
    return await this.prismaService.category.findMany({
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      orderBy: {
        [options.sort]: options.order,
      },
      where: options.search
        ? {
            OR: [{ name: { contains: options.search, mode: "insensitive" } }],
          }
        : undefined,
    });
  }
  async count(options: Query): Promise<number> {
    return await this.prismaService.category.count({
      where: options.search
        ? {
            OR: [{ name: { contains: options.search, mode: "insensitive" } }],
          }
        : undefined,
    });
  }
  async update(id: string, data: CategoryUpdateInput): Promise<Category> {
    return await this.prismaService.category.update({ where: { id }, data });
  }
}
