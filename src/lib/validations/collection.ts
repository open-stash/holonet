import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .transform((value) => value.trim()),
});

export type CreateCollectionFormValues = z.infer<typeof createCollectionSchema>;
