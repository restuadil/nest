import z from "zod";

export const updateProductSchema = z
  .object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    images: z.array(z.url()).optional(),
    categoryIds: z.array(z.cuid()).optional(),
  })
  .strict();

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
