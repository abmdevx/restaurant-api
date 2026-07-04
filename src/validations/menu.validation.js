import { z } from "zod";

export const createMenuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").trim(),
  description: z.string().trim().optional(),
  category: z.enum(["starter", "main", "dessert", "beverage", "side"], {
    errorMap: () => ({ message: "Invalid category" }),
  }),
  price: z.number({ invalid_type_error: "Price must be a number" }).positive("Price must be positive"),
  isAvailable: z.boolean().optional().default(true),
});

export const updateMenuItemSchema = z
  .object({
    name: z.string().min(1).trim().optional(),
    description: z.string().trim().optional(),
    category: z.enum(["starter", "main", "dessert", "beverage", "side"]).optional(),
    price: z.number().positive().optional(),
    isAvailable: z.boolean().optional(),
  })
  .strict();
