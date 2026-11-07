import { NextRequest } from "next/server";
import { verifyToken, extractBearerToken, type TokenPayload } from "./jwt";

/**
 * Retrieve the authenticated user payload from a request.
 * Returns null when the token is absent, malformed, or expired.
 */
export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  const authHeader = req.headers.get("authorization");
  const token = extractBearerToken(authHeader);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Require an authenticated user. Returns [user, null] on success,
 * or [null, Response] with a 401 JSON response on failure.
 */
export async function requireAuth(
  req: NextRequest
): Promise<[TokenPayload, null] | [null, Response]> {
  const user = await getAuthUser(req);
  if (!user) {
    return [
      null,
      Response.json({ error: "Authentication required" }, { status: 401 }),
    ];
  }
  return [user, null];
}

/**
 * Require an admin user. Returns [user, null] on success,
 * or [null, Response] with a 401/403 JSON response on failure.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<[TokenPayload, null] | [null, Response]> {
  const user = await getAuthUser(req);
  if (!user) {
    return [
      null,
      Response.json({ error: "Authentication required" }, { status: 401 }),
    ];
  }
  if (user.role !== "admin") {
    return [
      null,
      Response.json(
        { error: "Forbidden — admin access required" },
        { status: 403 }
      ),
    ];
  }
  return [user, null];
}
