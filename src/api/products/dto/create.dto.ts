import z from "zod";

import { ProductStatus } from "src/generated/prisma/enums";

export const createProductSchema = z
  .object({
    name: z.string().min(3),
    description: z.string().optional(),
    price: z.number().min(0),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    images: z.array(z.url()),
    categoryIds: z.array(z.cuid()),
  })
  .strict()
  .transform((data) => ({
    ...data,
    status: ProductStatus.ACTIVE,
  }));

export type CreateProductDto = z.infer<typeof createProductSchema>;
