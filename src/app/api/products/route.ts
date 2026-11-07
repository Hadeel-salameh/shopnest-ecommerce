import { NextRequest } from "next/server";
import { eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { productSchema, formatZodError } from "@/lib/validators";
import { z } from "zod";

// GET /api/products — public (مع دعم البحث الجزئي والكامل)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("search") || searchParams.get("q") || "";

  const baseQuery = db
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
    .leftJoin(categories, eq(products.categoryId, categories.id));

  // إذا كانت هناك كلمة بحث، نقوم بتطبيق الفلترة (بحث جزئي في الاسم أو الوصف)
  const rows = query
    ? await baseQuery
        .where(
          or(
            ilike(products.name, `%${query}%`),
            ilike(products.description, `%${query}%`)
          )
        )
        .orderBy(products.createdAt)
    : await baseQuery.orderBy(products.createdAt);

  const formatted = rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    stock: r.stock,
    category: r.categoryId
      ? { id: r.categoryId, name: r.categoryName }
      : null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  return Response.json({ products: formatted });
}

// POST /api/products — admin only
export async function POST(req: NextRequest) {
  const [, errorResponse] = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let data: z.infer<typeof productSchema>;
  try {
    data = productSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: formatZodError(err) }, { status: 400 });
    }
    throw err;
  }

  // Validate category exists if provided
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

  const [newProduct] = await db
    .insert(products)
    .values({
      name: data.name,
      description: data.description,
      price: String(data.price),
      stock: data.stock,
      categoryId: data.categoryId ?? null,
    })
    .returning();

  return Response.json({ message: "Product created", product: newProduct }, { status: 201 });
}