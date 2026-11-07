"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CartModal from "@/components/CartModal";
import Toast from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { apiClient } from "@/lib/apiClient";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: { id: number; name: string } | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // جلب المنتجات مع دعم البحث والتصنيف من الـ Backend
  const fetchProducts = useCallback(async (search = "", categoryId: number | null = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      
      const url = `/api/products${params.toString() ? `?${params.toString()}` : ""}`;
      const data = await apiClient<{ products: Product[] }>(url);
      
      let result = data.products;
      // فلترة إضافية للتصنيف إن وُجد
      if (categoryId !== null) {
        result = result.filter((p) => p.category?.id === categoryId);
      }
      
      setProducts(result);
    } catch {
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiClient<{ categories: Category[] }>("/api/categories");
      setCategories(data.categories);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // البحث والفلترة عند تغير كلمة البحث أو التصنيف
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchQuery, selectedCategory);
    }, 300); // Debounce للبحث بسلاسة

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, fetchProducts]);

  const handlePlaceOrder = async () => {
    if (!user) {
      showToast("Please log in to place an order", "error");
      setTimeout(() => (window.location.href = "/login"), 1500);
      return;
    }
    if (cart.length === 0) return;

    setOrderLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const items = cart.map((item: { product: { id: number }; quantity: number }) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      await apiClient("/api/orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items }),
      });

      showToast("Order placed successfully! 🎉", "success");
      clearCart();
      setShowCart(false);
      fetchProducts(searchQuery, selectedCategory); // Refresh stock
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      showToast(msg, "error");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <>
      <Navbar
        user={user}
        cartCount={totalItems}
        onCartClick={() => setShowCart(true)}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero-section text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="mb-3">
                Shop Smarter,
                <br />
                <span style={{ opacity: 0.9 }}>Live Better.</span>
              </h1>
              <p className="lead mb-4">
                Discover thousands of quality products at unbeatable prices.
                Fast shipping, easy returns, and exceptional customer service.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <a href="#products" className="btn btn-light btn-lg fw-semibold px-4">
                  <i className="bi bi-grid-3x3-gap me-2" />
                  Browse Products
                </a>
                {!user && (
                  <a href="/register" className="btn btn-outline-light btn-lg px-4">
                    Create Account
                  </a>
                )}
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-flex justify-content-end">
              <div
                style={{
                  fontSize: "8rem",
                  opacity: 0.15,
                  lineHeight: 1,
                }}
              >
                🛍️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products Section ──────────────────────────────────────────────── */}
      <section id="products" className="py-5">
        <div className="container">
          {/* Filters */}
          <div className="row mb-4 align-items-center g-3">
            <div className="col-md-6">
              <h2 className="section-title mb-0">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name
                  : "All Products"}
                {!loading && (
                  <span className="fs-6 fw-normal text-muted ms-2">
                    ({products.length})
                  </span>
                )}
              </h2>
            </div>
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={selectedCategory ?? ""}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills */}
          {categories.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-4">
              <button
                className={`btn btn-sm rounded-pill px-3 ${
                  selectedCategory === null
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`btn btn-sm rounded-pill px-3 ${
                    selectedCategory === cat.id
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    )
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary me-3" role="status" />
              <span>Loading products…</span>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bag-x" />
              <h5>No products found</h5>
              <p className="text-muted">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {products.map((product) => (
                <div key={product.id} className="col">
                  <ProductCard
                    product={product}
                    onAddToCart={(qty: number) => {
                      addToCart(product, qty);
                      showToast(`"${product.name}" added to cart`, "success");
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <div className="brand-icon me-2">
                  <i className="bi bi-bag-heart-fill" />
                </div>
                <span className="fw-bold text-white fs-5">ShopNest</span>
              </div>
              <p className="mb-0 small">
                © {new Date().getFullYear()} ShopNest. Built with Next.js & PostgreSQL.
              </p>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <a href="/" className="me-3">Home</a>
              <a href="/login" className="me-3">Login</a>
              <a href="/register">Register</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Cart Modal ───────────────────────────────────────────────────── */}
      <CartModal
        show={showCart}
        cart={cart}
        onClose={() => setShowCart(false)}
        onRemove={removeFromCart}
        onClear={clearCart}
        onPlaceOrder={handlePlaceOrder}
        orderLoading={orderLoading}
      />

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </>
  );
}