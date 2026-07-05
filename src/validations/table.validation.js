import { z } from "zod";

export const createTableSchema = z.object({
  tableNumber: z
    .number({ invalid_type_error: "Table number must be a number" })
    .int()
    .positive("Table number must be a positive integer"),
  capacity: z
    .number({ invalid_type_error: "Capacity must be a number" })
    .int()
    .min(1, "Capacity must be at least 1"),
  location: z.string().trim().optional(),
});

export const updateTableStatusSchema = z.object({
  status: z.enum(["available", "occupied", "reserved", "maintenance"], {
    errorMap: () => ({ message: "Invalid table status" }),
  }),
});

export const deleteAllTablesSchema = z.object({
  confirm: z.literal("I_UNDERSTAND_THIS_WILL_DELETE_ALL_TABLES", {
    errorMap: () => ({
      message: 'You must send "I_UNDERSTAND_THIS_WILL_DELETE_ALL_TABLES" to confirm this action.',
    }),
  }),
});

export const deleteTablesByIdsSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one table ID is required."),
  confirm: z.literal("I_UNDERSTAND_THIS_WILL_DELETE_SELECTED_TABLES", {
    errorMap: () => ({
      message: 'You must send "I_UNDERSTAND_THIS_WILL_DELETE_SELECTED_TABLES" to confirm this action.',
    }),
  }),
});
