"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/apiClient";
import Toast from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: { id: number; name: string } | null;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

type ActiveTab = "overview" | "products" | "categories";

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ── Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });

  // ── Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  const [formLoading, setFormLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getToken = () => localStorage.getItem("access_token") ?? "";

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [prodData, catData] = await Promise.all([
        apiClient<{ products: Product[] }>("/api/products"),
        apiClient<{ categories: Category[] }>("/api/categories"),
      ]);
      setProducts(prodData.products);
      setCategories(catData.categories);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        window.location.href = "/login";
      } else {
        fetchAll();
      }
    }
  }, [user, authLoading, fetchAll]);

  // ─── Product CRUD ───────────────────────────────────────────────────────────
  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", description: "", price: "", stock: "", categoryId: "" });
    setShowProductForm(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description ?? "",
      price: parseFloat(p.price).toString(),
      stock: p.stock.toString(),
      categoryId: p.category?.id.toString() ?? "",
    });
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || !productForm.stock) {
      showToast("Name, price, and stock are required", "error");
      return;
    }

    const price = parseFloat(productForm.price);
    const stock = parseInt(productForm.stock, 10);
    if (isNaN(price) || price <= 0) {
      showToast("Price must be a positive number", "error");
      return;
    }
    if (isNaN(stock) || stock < 0) {
      showToast("Stock must be a non-negative integer", "error");
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim() || undefined,
      price,
      stock,
      categoryId: productForm.categoryId ? parseInt(productForm.categoryId, 10) : null,
    };

    setFormLoading(true);
    try {
      if (editingProduct) {
        await apiClient(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify(payload),
        });
        showToast("Product updated successfully", "success");
      } else {
        await apiClient("/api/products", {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify(payload),
        });
        showToast("Product created successfully", "success");
      }
      setShowProductForm(false);
      fetchAll();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Operation failed", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This action cannot be undone.`)) return;
    try {
      await apiClient(`/api/products/${p.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      showToast("Product deleted", "success");
      fetchAll();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  // ─── Category CRUD ──────────────────────────────────────────────────────────
  const openNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
    setShowCategoryForm(true);
  };

  const openEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCategoryForm({ name: c.name, description: c.description ?? "" });
    setShowCategoryForm(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim() || undefined,
    };

    setFormLoading(true);
    try {
      if (editingCategory) {
        await apiClient(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify(payload),
        });
        showToast("Category updated", "success");
      } else {
        await apiClient("/api/categories", {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify(payload),
        });
        showToast("Category created", "success");
      }
      setShowCategoryForm(false);
      fetchAll();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Operation failed", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (c: Category) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await apiClient(`/api/categories/${c.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      showToast("Category deleted", "success");
      fetchAll();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="loading-spinner" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand d-flex align-items-center gap-2">
          <span style={{ fontSize: "1.4rem" }}>🛍️</span>
          <span>ShopNest Admin</span>
        </div>

        <nav className="mt-2">
          <ul className="nav flex-column">
            <li className="nav-item">
              <button
                className={`nav-link w-100 text-start ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <i className="bi bi-speedometer2" /> Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link w-100 text-start ${activeTab === "products" ? "active" : ""}`}
                onClick={() => setActiveTab("products")}
              >
                <i className="bi bi-box-seam" /> Products
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link w-100 text-start ${activeTab === "categories" ? "active" : ""}`}
                onClick={() => setActiveTab("categories")}
              >
                <i className="bi bi-tags" /> Categories
              </button>
            </li>
            <li className="nav-item mt-4 border-top border-secondary pt-3">
              <a className="nav-link" href="/">
                <i className="bi bi-shop" /> View Store
              </a>
            </li>
            <li className="nav-item">
              <button className="nav-link w-100 text-start text-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right" /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="admin-content flex-fill">
        {/* Top Bar */}
        <div className="admin-topbar d-flex align-items-center justify-content-between">
          <div>
            <h5 className="mb-0 fw-bold text-capitalize">{activeTab}</h5>
            <small className="text-muted">ShopNest Admin Panel</small>
          </div>
          {user && (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-person-circle text-muted" />
              <span className="fw-semibold">{user.username}</span>
              <span className="badge bg-warning text-dark">Admin</span>
            </div>
          )}
        </div>

        {/* Page Content */}
        <div className="admin-main">

          {/* ── Overview Tab ─────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div>
              <div className="row g-4 mb-5">
                <div className="col-sm-6 col-xl-3">
                  <div className="card stat-card p-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted small fw-semibold text-uppercase">Products</span>
                      <i className="bi bi-box-seam text-primary fs-4" />
                    </div>
                    <div className="fs-2 fw-bold">{totalProducts}</div>
                    <small className="text-muted">Total products</small>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="card stat-card stat-success p-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted small fw-semibold text-uppercase">Categories</span>
                      <i className="bi bi-tags text-success fs-4" />
                    </div>
                    <div className="fs-2 fw-bold">{totalCategories}</div>
                    <small className="text-muted">Total categories</small>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="card stat-card stat-warning p-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted small fw-semibold text-uppercase">Low Stock</span>
                      <i className="bi bi-exclamation-triangle text-warning fs-4" />
                    </div>
                    <div className="fs-2 fw-bold">{lowStock}</div>
                    <small className="text-muted">≤ 5 units remaining</small>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="card stat-card stat-danger p-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted small fw-semibold text-uppercase">Out of Stock</span>
                      <i className="bi bi-x-circle text-danger fs-4" />
                    </div>
                    <div className="fs-2 fw-bold">{outOfStock}</div>
                    <small className="text-muted">Products unavailable</small>
                  </div>
                </div>
              </div>

              {/* Recent Products */}
              <div className="card">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-clock-history me-2 text-primary" />
                    Recent Products
                  </h6>
                  {loadingData ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary" />
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.slice(0, 8).map((p) => (
                            <tr key={p.id}>
                              <td className="fw-semibold">{p.name}</td>
                              <td>
                                {p.category ? (
                                  <span className="badge bg-light text-dark border">
                                    {p.category.name}
                                  </span>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="fw-semibold text-primary">
                                ${parseFloat(p.price).toFixed(2)}
                              </td>
                              <td>
                                {p.stock === 0 ? (
                                  <span className="badge bg-danger">Out of Stock</span>
                                ) : p.stock <= 5 ? (
                                  <span className="badge bg-warning text-dark">{p.stock}</span>
                                ) : (
                                  <span className="badge bg-success">{p.stock}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Products Tab ─────────────────────────────────────────────── */}
          {activeTab === "products" && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="fw-bold mb-0">
                  Products
                  <span className="badge bg-light text-dark border ms-2">{totalProducts}</span>
                </h5>
                <button className="btn btn-primary btn-sm fw-semibold" onClick={openNewProduct}>
                  <i className="bi bi-plus-lg me-1" /> Add Product
                </button>
              </div>

              {/* Product Form */}
              {showProductForm && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      {editingProduct ? "Edit Product" : "New Product"}
                    </h6>
                    <form onSubmit={handleProductSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Product name"
                            value={productForm.name}
                            onChange={(e) =>
                              setProductForm((f) => ({ ...f, name: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Price ($) *</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) =>
                              setProductForm((f) => ({ ...f, price: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Stock *</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="0"
                            min="0"
                            step="1"
                            value={productForm.stock}
                            onChange={(e) =>
                              setProductForm((f) => ({ ...f, stock: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="col-md-8">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Product description (optional)"
                            value={productForm.description}
                            onChange={(e) =>
                              setProductForm((f) => ({ ...f, description: e.target.value }))
                            }
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Category</label>
                          <select
                            className="form-select"
                            value={productForm.categoryId}
                            onChange={(e) =>
                              setProductForm((f) => ({ ...f, categoryId: e.target.value }))
                            }
                          >
                            <option value="">No Category</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm fw-semibold"
                          disabled={formLoading}
                        >
                          {formLoading ? (
                            <><span className="spinner-border spinner-border-sm me-1" />Saving…</>
                          ) : (
                            <><i className="bi bi-check2 me-1" />{editingProduct ? "Update" : "Create"}</>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setShowProductForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Products Table */}
              {loadingData ? (
                <div className="loading-spinner">
                  <div className="spinner-border text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-box-seam" />
                  <h6>No products yet</h6>
                  <button className="btn btn-primary btn-sm mt-2" onClick={openNewProduct}>
                    Add First Product
                  </button>
                </div>
              ) : (
                <div className="card">
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id}>
                            <td className="text-muted">#{p.id}</td>
                            <td>
                              <span className="fw-semibold">{p.name}</span>
                              {p.description && (
                                <div
                                  className="text-muted small"
                                  style={{
                                    maxWidth: 240,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {p.description}
                                </div>
                              )}
                            </td>
                            <td>
                              {p.category ? (
                                <span className="badge bg-light text-dark border">
                                  {p.category.name}
                                </span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="fw-semibold text-primary">
                              ${parseFloat(p.price).toFixed(2)}
                            </td>
                            <td>
                              {p.stock === 0 ? (
                                <span className="badge bg-danger">0 — Out of Stock</span>
                              ) : p.stock <= 5 ? (
                                <span className="badge bg-warning text-dark">{p.stock} — Low</span>
                              ) : (
                                <span className="badge bg-success">{p.stock}</span>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => openEditProduct(p)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil" />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDeleteProduct(p)}
                                  title="Delete"
                                >
                                  <i className="bi bi-trash3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Categories Tab ────────────────────────────────────────────── */}
          {activeTab === "categories" && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="fw-bold mb-0">
                  Categories
                  <span className="badge bg-light text-dark border ms-2">{totalCategories}</span>
                </h5>
                <button className="btn btn-primary btn-sm fw-semibold" onClick={openNewCategory}>
                  <i className="bi bi-plus-lg me-1" /> Add Category
                </button>
              </div>

              {/* Category Form */}
              {showCategoryForm && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      {editingCategory ? "Edit Category" : "New Category"}
                    </h6>
                    <form onSubmit={handleCategorySubmit}>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label">Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Category name"
                            value={categoryForm.name}
                            onChange={(e) =>
                              setCategoryForm((f) => ({ ...f, name: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="col-md-8">
                          <label className="form-label">Description</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Optional description"
                            value={categoryForm.description}
                            onChange={(e) =>
                              setCategoryForm((f) => ({ ...f, description: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm fw-semibold"
                          disabled={formLoading}
                        >
                          {formLoading ? (
                            <><span className="spinner-border spinner-border-sm me-1" />Saving…</>
                          ) : (
                            <><i className="bi bi-check2 me-1" />{editingCategory ? "Update" : "Create"}</>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setShowCategoryForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Categories Table */}
              {loadingData ? (
                <div className="loading-spinner">
                  <div className="spinner-border text-primary" />
                </div>
              ) : categories.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-tags" />
                  <h6>No categories yet</h6>
                  <button className="btn btn-primary btn-sm mt-2" onClick={openNewCategory}>
                    Add First Category
                  </button>
                </div>
              ) : (
                <div className="card">
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Products</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((c) => {
                          const productCount = products.filter(
                            (p) => p.category?.id === c.id
                          ).length;
                          return (
                            <tr key={c.id}>
                              <td className="text-muted">#{c.id}</td>
                              <td className="fw-semibold">{c.name}</td>
                              <td className="text-muted">{c.description ?? "—"}</td>
                              <td>
                                <span className="badge bg-light text-dark border">
                                  {productCount} product{productCount !== 1 ? "s" : ""}
                                </span>
                              </td>
                              <td className="text-end">
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => openEditCategory(c)}
                                    title="Edit"
                                  >
                                    <i className="bi bi-pencil" />
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDeleteCategory(c)}
                                    title="Delete"
                                    disabled={productCount > 0}
                                  >
                                    <i className="bi bi-trash3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Toast Notifications ──────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
