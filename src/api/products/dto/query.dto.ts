import z from "zod";

import { QuerySchema } from "src/common/helpers/base-query";
import { idSchema } from "src/common/helpers/cuid.dto";
import { ProductStatus } from "src/generated/prisma/enums";
import { ProductScalarFieldEnum } from "src/generated/prisma/internal/prismaNamespace";
export const queryProductSchema = QuerySchema.extend({
  sort: z
    .string()
    .refine((val) => Object.keys(ProductScalarFieldEnum).includes(val), {
      message: "Invalid sort field",
    })
    .default("createdAt"),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  categoryIds: z.array(idSchema).optional(),
  status: z.enum(ProductStatus).optional().default(ProductStatus.ACTIVE),
}).strict();
export type QueryProductDto = z.infer<typeof queryProductSchema>;
