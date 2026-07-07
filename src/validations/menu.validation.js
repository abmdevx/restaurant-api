import { z } from "zod";

export const createMenuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").trim(),
  description: z.string().trim().optional(),
  category: z.enum(["starter", "main", "dessert", "beverage", "side"], {
    errorMap: () => ({ message: "Invalid category" }),
  }),
  price: z.number({ invalid_type_error: "Price must be a number" }).positive("Price must be positive"),
  isAvailable: z.boolean().optional().default(true),
  ingredients: z.array(
    z.object({
      inventoryItem: z.string().min(1, "Inventory item ID is required"),
      quantity: z
        .number({ invalid_type_error: "Quantity must be a number" })
        .positive("Quantity must be greater than 0"),
    })
  ),
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

export const deleteAllMenuItemsSchema = z.object({
  confirm: z.literal("I_UNDERSTAND_THIS_WILL_DELETE_ALL_MENU_ITEMS", {
    errorMap: () => ({
      message: 'You must send "I_UNDERSTAND_THIS_WILL_DELETE_ALL_MENU_ITEMS" to confirm this action.',
    }),
  }),
});

export const deleteMenuItemsByIdsSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one menu item ID is required."),
  confirm: z.literal("I_UNDERSTAND_THIS_WILL_DELETE_SELECTED_MENU_ITEMS", {
    errorMap: () => ({
      message: 'You must send "I_UNDERSTAND_THIS_WILL_DELETE_SELECTED_MENU_ITEMS" to confirm this action.',
    }),
  }),
});