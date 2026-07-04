import { z } from "zod";

const orderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID is required"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int()
    .min(1, "Quantity must be at least 1"),
  notes: z.string().trim().optional(),
});

export const placeOrderSchema = z.object({
  tableId: z.string().min(1, "Table ID is required"),
  reservationId: z.string().optional(),
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
  notes: z.string().trim().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "preparing", "ready", "served", "cancelled"], {
    errorMap: () => ({ message: "Invalid order status" }),
  }),
});

export const addItemsSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Must add at least one item"),
});

export const processPaymentSchema = z.object({
  paymentMethod: z.enum(["cash", "card", "online"], {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
});
