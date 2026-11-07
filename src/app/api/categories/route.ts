import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { categorySchema, formatZodError } from "@/lib/validators";
import { z } from "zod";

// GET /api/categories — public
export async function GET() {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(categories.name);

  return Response.json({ categories: rows });
}

// POST /api/categories — admin only
export async function POST(req: NextRequest) {
  const [, errorResponse] = await requireAdmin(req);
  if (errorResponse) return errorResponse;

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

  // Check for duplicate name
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, data.name))
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ error: "Category name already exists" }, { status: 409 });
  }

  const [newCategory] = await db
    .insert(categories)
    .values({ name: data.name, description: data.description })
    .returning();

  return Response.json({ message: "Category created", category: newCategory }, { status: 201 });
}
