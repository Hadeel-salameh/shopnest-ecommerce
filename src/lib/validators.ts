import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be at most 100 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Categories ───────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be at most 100 characters"),
  description: z.string().optional(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(255, "Product name must be at most 255 characters"),
  description: z.string().optional(),
  price: z
    .number()
    .positive("Price must be positive"),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
  categoryId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
});

export const updateProductSchema = productSchema.partial();

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  product_id: z
    .number()
    .int()
    .positive("product_id must be positive"),
  quantity: z
    .number()
    .int("quantity must be an integer")
    .positive("quantity must be greater than zero"),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatZodError(error: z.ZodError): string {
  const issues = error.issues ?? [];
  return issues.map((e) => e.message).join("; ");
}
