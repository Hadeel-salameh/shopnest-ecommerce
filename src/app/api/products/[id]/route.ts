import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { updateProductSchema, formatZodError } from "@/lib/validators";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/products/:id — public
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return Response.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      stock: products.stock,
      categoryId: products.categoryId,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, productId))
    .limit(1);

  if (!row) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const product = {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    stock: row.stock,
    category: row.categoryId ? { id: row.categoryId, name: row.categoryName } : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  return Response.json({ product });
}

// PUT /api/products/:id — admin only
export async function PUT(req: NextRequest, ctx: RouteContext) {
  const [, errorResponse] = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { id } = await ctx.params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return Response.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!existing) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let data: z.infer<typeof updateProductSchema>;
  try {
    data = updateProductSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: formatZodError(err) }, { status: 400 });
    }
    throw err;
  }

  if (data.categoryId) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, data.categoryId))
      .limit(1);

    if (!cat) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = String(data.price);
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId ?? null;

  const [updated] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, productId))
    .returning();

  return Response.json({ message: "Product updated", product: updated });
}

// DELETE /api/products/:id — admin only
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const [, errorResponse] = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { id } = await ctx.params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return Response.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!existing) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  await db.delete(products).where(eq(products.id, productId));

  return Response.json({ message: "Product deleted successfully" });
}
