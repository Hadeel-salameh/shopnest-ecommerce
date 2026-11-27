import { NextRequest } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { createOrderSchema, formatZodError } from "@/lib/validators";
import { z } from "zod";

// POST /api/orders — authenticated users
export async function POST(req: NextRequest) {
  const [authUser, errorResponse] = await requireAuth(req);
  if (errorResponse) return errorResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let data: z.infer<typeof createOrderSchema>;
  try {
    data = createOrderSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: formatZodError(err) }, { status: 400 });
    }
    throw err;
  }

  // Fetch all requested products in a single query
  const productIds = data.items.map((item) => item.product_id);

  const foundProducts = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  // Build a lookup map
  const productMap = new Map(foundProducts.map((p) => [p.id, p]));

  // Validate each item — check existence and stock availability
  for (const item of data.items) {
    const product = productMap.get(item.product_id);

    if (!product) {
      return Response.json(
        { error: `Product with ID ${item.product_id} not found` },
        { status: 404 }
      );
    }

    if (product.stock < item.quantity) {
      return Response.json(
        {
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        },
        { status: 400 }
      );
    }
  }

  // Calculate total price
  let totalPrice = 0;
  for (const item of data.items) {
    const product = productMap.get(item.product_id)!;
    totalPrice += parseFloat(product.price) * item.quantity;
  }

  // Create order, insert order items, and deduct stock sequentially
  // (neon-http driver does not support db.transaction)
  try {
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: authUser.userId,
        totalPrice: totalPrice.toFixed(2),
        status: "pending",
      })
      .returning();

    for (const item of data.items) {
      const product = productMap.get(item.product_id)!;

      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.product_id,
        quantity: item.quantity,
        // Snapshot price at time of purchase
        price: product.price,
      });

      await db
        .update(products)
        .set({ stock: product.stock - item.quantity, updatedAt: new Date() })
        .where(eq(products.id, item.product_id));
    }

    return Response.json(
      {
        message: "Order created successfully",
        order: {
          id: newOrder.id,
          userId: newOrder.userId,
          totalPrice: newOrder.totalPrice,
          status: newOrder.status,
          createdAt: newOrder.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("ORDER CREATION ERROR:", err);
    return Response.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/orders — authenticated users see their own orders
export async function GET(req: NextRequest) {
  const [authUser, errorResponse] = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, authUser.userId))
    .orderBy(orders.createdAt);

  // Fetch items for each order
  const ordersWithItems = await Promise.all(
    userOrders.map(async (order) => {
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
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    })
  );

  return Response.json({ orders: ordersWithItems });
}