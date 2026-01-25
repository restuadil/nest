import { Product } from "src/generated/prisma/browser";

type CategoryInclude = {
  category: {
    id: string;
    name?: string;
  };
};
export type FindAllProduct = Omit<
  Product,
  "createdAt" | "updatedAt" | "description"
> & {
  ProductCategory: CategoryInclude[];
};
export type FindAllProductsResponse = Omit<
  FindAllProduct,
  "ProductCategory"
> & {
  categoryIds: string[];
};

export type FindByIdProduct = Product & {
  ProductCategory: CategoryInclude[];
};
export type FindByIdProductResponse = Omit<
  FindByIdProduct,
  "ProductCategory"
> & {
  categories: {
    id: string;
    name: string;
  }[];
};
export const toFindAllProductResponse = (
  product: FindAllProduct,
): FindAllProductsResponse => ({
  id: product.id,
  name: product.name,
  price: product.price,
  images: product.images,
  status: product.status,
  categoryIds: product.ProductCategory.map((category) => category.category.id),
});

export const toFindByIdProductResponse = (
  product: FindByIdProduct,
): FindByIdProductResponse => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  images: product.images,
  status: product.status,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  categories: product.ProductCategory.map((category) => {
    return {
      id: category.category.id,
      name: category.category?.name ?? "",
    };
  }),
});
