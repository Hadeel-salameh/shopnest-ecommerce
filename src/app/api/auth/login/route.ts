import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { signToken } from "@/lib/jwt";
import { loginSchema, formatZodError } from "@/lib/validators";
import { z } from "zod";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let data: z.infer<typeof loginSchema>;
  try {
    data = loginSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: formatZodError(err) }, { status: 400 });
    }
    throw err;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const passwordValid = await verifyPassword(data.password, user.passwordHash);
  if (!passwordValid) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const accessToken = await signToken({
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });

  return Response.json({
    message: "Login successful",
    access_token: accessToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}
