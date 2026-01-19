import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/common/prisma/prisma.service";
import { Product, ProductStatus } from "src/generated/prisma/client";
import { ProductCreateInput } from "src/generated/prisma/models";

import { QueryProductDto } from "./dto/query.dto";

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
  async findAll(options: QueryProductDto): Promise<Product[]> {
    const {
      limit,
      order,
      page,
      search,
      sort,
      status,
      maxPrice,
      minPrice,
      categoryIds,
    } = options;

    return this.prismaService.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sort]: order,
      },
      include: {
        ProductCategory: {
          select: {
            categoryId: true,
          },
        },
      },
      where: {
        status: (status as unknown as ProductStatus) ?? undefined,
        ...(minPrice || maxPrice
          ? {
              price: {
                gte: minPrice ?? undefined,
                lte: maxPrice ?? undefined,
              },
            }
          : {}),
        ...(search
          ? {
              OR: [{ name: { contains: search, mode: "insensitive" } }],
            }
          : {}),
        ...(categoryIds && categoryIds.length > 0
          ? {
              AND: categoryIds.map((id) => ({
                ProductCategory: { some: { categoryId: id } },
              })),
            }
          : {}),
      },
    });
  }
  async count(options: QueryProductDto): Promise<number> {
    const { search, status, maxPrice, minPrice, categoryIds } = options;
    return await this.prismaService.product.count({
      where: {
        status: (status as unknown as ProductStatus) ?? undefined,
        ...(minPrice || maxPrice
          ? {
              price: {
                gte: minPrice ?? undefined,
                lte: maxPrice ?? undefined,
              },
            }
          : {}),
        ...(search
          ? {
              OR: [{ name: { contains: search, mode: "insensitive" } }],
            }
          : {}),
        ...(categoryIds && categoryIds.length > 0
          ? {
              AND: categoryIds.map((id) => ({
                ProductCategory: { some: { categoryId: id } },
              })),
            }
          : {}),
      },
    });
  }
}
