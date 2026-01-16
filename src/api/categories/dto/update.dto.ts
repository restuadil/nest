import z from "zod";

import { createCategorySchema } from "./create.dto";

export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
