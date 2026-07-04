import { z } from "zod";

export const createReservationSchema = z.object({
  customerName: z.string().min(2, "Customer name is required").trim(),
  customerPhone: z
    .string()
    .min(7, "Phone number is too short")
    .trim(),
  customerEmail: z.string().email("Invalid email").toLowerCase().optional(),
  tableId: z.string().min(1, "Table ID is required"),
  date: z
    .string()
    .datetime({ message: "Date must be a valid ISO 8601 datetime" })
    .refine((d) => new Date(d) > new Date(), {
      message: "Reservation date must be in the future",
    }),
  partySize: z
    .number({ invalid_type_error: "Party size must be a number" })
    .int()
    .min(1, "Party size must be at least 1"),
  notes: z.string().trim().optional(),
});

export const updateReservationSchema = z
  .object({
    customerName: z.string().min(2).trim().optional(),
    customerPhone: z.string().min(7).trim().optional(),
    customerEmail: z.string().email().toLowerCase().optional(),
    tableId: z.string().optional(),
    date: z
      .string()
      .datetime()
      .refine((d) => new Date(d) > new Date(), {
        message: "Reservation date must be in the future",
      })
      .optional(),
    partySize: z.number().int().min(1).optional(),
    notes: z.string().trim().optional(),
  })
  .strict();
