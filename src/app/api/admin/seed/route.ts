import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";

/**
 * POST /api/admin/seed
 *
 * Creates the first admin user. This endpoint is protected by a
 * SEED_SECRET environment variable and should be disabled in production
 * after initial setup.
 *
 * Body: { username, email, password, seed_secret }
 */
export async function POST(req: NextRequest) {
  const seedSecret = process.env.SEED_SECRET;

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Require seed secret when configured
  if (seedSecret && body.seed_secret !== seedSecret) {
    return Response.json({ error: "Invalid seed secret" }, { status: 403 });
  }

  const { username, email, password } = body;

  if (!username || !email || !password) {
    return Response.json(
      { error: "username, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const [admin] = await db
    .insert(users)
    .values({ username, email, passwordHash, role: "admin" })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
    });

  return Response.json(
    { message: "Admin user created successfully", user: admin },
    { status: 201 }
  );
}
