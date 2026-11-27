import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { registerSchema, formatZodError } from "@/lib/validators";
import { z } from "zod";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate input
  let data: z.infer<typeof registerSchema>;
  try {
    data = registerSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: formatZodError(err) }, { status: 400 });
    }
    throw err;
  }

  // Check for duplicate username
  const existingByUsername = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, data.username))
    .limit(1);

  if (existingByUsername.length > 0) {
    return Response.json({ error: "Username already taken" }, { status: 409 });
  }

  // Check for duplicate email
  const existingByEmail = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingByEmail.length > 0) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(data.password);

  const [newUser] = await db
    .insert(users)
    .values({
      username: data.username,
      email: data.email,
      passwordHash,
      role: "customer",
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

  return Response.json(
    {
      message: "Registration successful",
      user: newUser,
    },
    { status: 201 }
  );
}
