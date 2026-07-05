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
  reason: z.string().trim().optional(),
});

export const deductSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .positive("Deduction quantity must be positive"),
  reason: z.string().trim().optional(),
});

export const deleteAllInventorySchema = z.object({
  confirm: z.literal("I_UNDERSTAND_THIS_WILL_DELETE_ALL_INVENTORY_ITEMS", {
    errorMap: () => ({
      message: 'You must send "I_UNDERSTAND_THIS_WILL_DELETE_ALL_INVENTORY_ITEMS" to confirm this action.',
    }),
  }),
});

export const deleteInventoryItemsByIdsSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, "At least one inventory item ID is required."),

  confirm: z.literal("I_UNDERSTAND_THIS_WILL_DELETE_SELECTED_INVENTORY_ITEMS", {
    errorMap: () => ({
      message: 'You must send "I_UNDERSTAND_THIS_WILL_DELETE_SELECTED_INVENTORY_ITEMS" to confirm this action.',
    }),
  }),
});