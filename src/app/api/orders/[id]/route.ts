import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/orders/:id — authenticated users can only see their own orders
export async function GET(req: NextRequest, ctx: RouteContext) {
  const [authUser, errorResponse] = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const { id } = await ctx.params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) {
    return Response.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  // Users can only access their own orders; admins can access any
  if (authUser.role !== "admin" && order.userId !== authUser.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      productName: products.name,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  return Response.json({ order: { ...order, items } });
}
