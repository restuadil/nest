import { z } from "zod";

export const idSchema = z
  .string()
  .refine((val) => /^c[0-9a-zA-Z_-]{24}$/.test(val), {
    message:
      "Invalid CUID format. Must be a 25-character string starting with 'c'.",
  });

export type IdDto = z.infer<typeof idSchema>;
