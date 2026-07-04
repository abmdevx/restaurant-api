import { z } from "zod";

export const addInventoryItemSchema = z.object({
  name: z.string().min(1, "Item name is required").trim(),
  category: z.enum(["produce", "meat", "dairy", "beverage", "dry-goods", "other"], {
    errorMap: () => ({ message: "Invalid inventory category" }),
  }),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required").trim(),
  lowStockThreshold: z
    .number({ invalid_type_error: "Threshold must be a number" })
    .min(0)
    .default(10),
  costPerUnit: z.number().min(0).optional(),
  supplier: z.string().trim().optional(),
});

export const updateInventoryItemSchema = z
  .object({
    name: z.string().min(1).trim().optional(),
    category: z.enum(["produce", "meat", "dairy", "beverage", "dry-goods", "other"]).optional(),
    unit: z.string().min(1).trim().optional(),
    lowStockThreshold: z.number().min(0).optional(),
    costPerUnit: z.number().min(0).optional(),
    supplier: z.string().trim().optional(),
  })
  .strict();

export const restockSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .positive("Restock quantity must be positive"),
});

export const deductSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .positive("Deduction quantity must be positive"),
  reason: z.string().trim().optional(),
});
