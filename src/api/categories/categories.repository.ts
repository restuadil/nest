import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/common/prisma/prisma.service";
import { Category } from "src/generated/prisma/client";
import { CategoryCreateInput } from "src/generated/prisma/models";

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
}
