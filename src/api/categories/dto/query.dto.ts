import z from "zod";

import { QuerySchema } from "src/common/helpers/base-query";
import { CategoryScalarFieldEnum } from "src/generated/prisma/internal/prismaNamespace";

export const queryCategorySchema = QuerySchema.extend({
  sort: z
    .string()
    .refine((val) => Object.keys(CategoryScalarFieldEnum).includes(val), {
      message: "Invalid sort field",
    })
    .default("createdAt"),
});

export type QueryCategoryDto = z.infer<typeof queryCategorySchema>;
