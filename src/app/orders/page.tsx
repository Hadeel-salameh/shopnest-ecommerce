"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/apiClient";

interface OrderItem {
  id: number;
  productId: number;
  productName: string | null;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  userId: number;
  totalPrice: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  shipped: "badge-shipped",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setLoading(true);
    try {
      const data = await apiClient<{ orders: Order[] }>("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data.orders);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = "/login";
      } else {
        fetchOrders();
      }
    }
  }, [user, authLoading, fetchOrders]);

  const toggleExpand = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <>
      <Navbar user={user} />

      <div className="container py-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="section-title mb-0">
            <i className="bi bi-bag-check me-2 text-primary" />
            My Orders
          </h2>
          <a href="/" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-arrow-left me-1" />
            Continue Shopping
          </a>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary me-3" role="status" />
            <span>Loading your orders…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-bag-x" />
            <h5>No orders yet</h5>
            <p className="text-muted">Place your first order from our store!</p>
            <a href="/" className="btn btn-primary mt-2">Browse Products</a>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => (
              <div key={order.id} className="card">
                {/* Order Header */}
                <div
                  className="card-body cursor-pointer"
                  onClick={() => toggleExpand(order.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="row align-items-center">
                    <div className="col-sm-3">
                      <div className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                        Order ID
                      </div>
                      <div className="fw-bold">#{order.id}</div>
                    </div>
                    <div className="col-sm-3">
                      <div className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                        Date
                      </div>
                      <div>{new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}</div>
                    </div>
                    <div className="col-sm-3">
                      <div className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                        Total
                      </div>
                      <div className="fw-bold text-primary">
                        ${parseFloat(order.totalPrice).toFixed(2)}
                      </div>
                    </div>
                    <div className="col-sm-2">
                      <div className="text-muted small fw-semibold text-uppercase mb-1" style={{ letterSpacing: "0.05em" }}>
                        Status
                      </div>
                      <span
                        className={`badge fw-semibold px-3 py-2 rounded-pill ${
                          STATUS_STYLES[order.status] ?? "bg-secondary"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="col-sm-1 text-end">
                      <i
                        className={`bi ${
                          expandedOrder === order.id ? "bi-chevron-up" : "bi-chevron-down"
                        } text-muted`}
                      />
                    </div>
                  </div>
                </div>

                {/* Order Items — Collapsible */}
                {expandedOrder === order.id && (
                  <div className="border-top">
                    <div className="p-3 bg-light">
                      <h6 className="fw-semibold mb-3 text-muted">
                        <i className="bi bi-list-ul me-2" />
                        Order Items ({order.items.length})
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th className="text-center">Qty</th>
                              <th className="text-end">Unit Price</th>
                              <th className="text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <span className="fw-semibold">
                                    {item.productName ?? `Product #${item.productId}`}
                                  </span>
                                </td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-end">${parseFloat(item.price).toFixed(2)}</td>
                                <td className="text-end fw-semibold">
                                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="table-light">
                              <td colSpan={3} className="text-end fw-bold">Total</td>
                              <td className="text-end fw-bold text-primary">
                                ${parseFloat(order.totalPrice).toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
