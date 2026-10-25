import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["customer", "staff", "admin"]).optional().default("customer"), // ← updated enum + default
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2).trim().optional(),
    email: z.string().email().toLowerCase().optional(),
    role: z.enum(["customer", "staff", "admin"]).optional(), // ← updated enum (already had customer, just reordered)
  })
  .strict();

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    newPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from the old password.",
    path: ["newPassword"], // need to study this
  });