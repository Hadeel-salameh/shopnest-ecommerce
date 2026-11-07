import { NextRequest } from "next/server";
import { eq, count } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { categorySchema, formatZodError } from "@/lib/validators";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/categories/:id — public
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    return Response.json({ error: "Invalid category ID" }, { status: 400 });
  }

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!category) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  return Response.json({ category });
}

// PUT /api/categories/:id — admin only
export async function PUT(req: NextRequest, ctx: RouteContext) {
  const [, errorResponse] = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { id } = await ctx.params;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    return Response.json({ error: "Invalid category ID" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!existing) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let data: z.infer<typeof categorySchema>;
  try {
    data = categorySchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: formatZodError(err) }, { status: 400 });
    }
    throw err;
  }

  // Check for duplicate name (excluding current record)
  const duplicate = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, data.name))
    .limit(1);

  if (duplicate.length > 0 && duplicate[0].id !== categoryId) {
    return Response.json({ error: "Category name already exists" }, { status: 409 });
  }

  const [updated] = await db
    .update(categories)
    .set({ name: data.name, description: data.description })
    .where(eq(categories.id, categoryId))
    .returning();

  return Response.json({ message: "Category updated", category: updated });
}

// DELETE /api/categories/:id — admin only
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const [, errorResponse] = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { id } = await ctx.params;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    return Response.json({ error: "Invalid category ID" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!existing) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  // Prevent deletion if category has associated products
  const [productCount] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.categoryId, categoryId));

  if (productCount.value > 0) {
    return Response.json(
      {
        error: `Cannot delete category — it has ${productCount.value} associated product(s). Reassign or delete them first.`,
      },
      { status: 409 }
    );
  }

  await db.delete(categories).where(eq(categories.id, categoryId));

  return Response.json({ message: "Category deleted successfully" });
}
