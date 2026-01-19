import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/common/prisma/prisma.service";
import { Product } from "src/generated/prisma/client";
import { ProductCreateInput } from "src/generated/prisma/models";

@Injectable()
export class ProductsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByKey(
    key: keyof Product,
    value: string | Date | number | boolean,
  ): Promise<Product | null> {
    return await this.prismaService.product.findFirst({
      where: { [key]: value },
    });
  }
  async create(data: ProductCreateInput): Promise<Product> {
    return await this.prismaService.product.create({ data });
  }
}
