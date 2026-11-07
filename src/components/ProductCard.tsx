"use client";

import { useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: { id: number; name: string } | null;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (quantity: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock === 0;

  const handleAdd = () => {
    if (!outOfStock && onAddToCart) {
      onAddToCart(quantity);
      setQuantity(1);
    }
  };

  return (
    <div className="card product-card h-100">
      {/* Product image placeholder */}
      <div className="product-img-placeholder">
        <i className="bi bi-image" />
      </div>

      <div className="card-body d-flex flex-column p-3">
        {/* Category badge */}
        {product.category && (
          <span className="product-category mb-2">
            {product.category.name}
          </span>
        )}

        {/* Title */}
        <h6 className="card-title fw-semibold mb-1">{product.name}</h6>

        {/* Description */}
        {product.description && (
          <p
            className="card-text text-muted small mb-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>
        )}

        <div className="mt-auto">
          {/* Price & Stock */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>
            {outOfStock ? (
              <span className="badge bg-danger stock-badge">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="badge bg-warning text-dark stock-badge">
                Only {product.stock} left
              </span>
            ) : (
              <span className="badge bg-success stock-badge">
                In Stock ({product.stock})
              </span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {!outOfStock && onAddToCart && (
            <div className="d-flex gap-2">
              <div className="input-group input-group-sm" style={{ width: 110 }}>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <i className="bi bi-dash" />
                </button>
                <input
                  type="number"
                  className="form-control text-center px-1"
                  value={quantity}
                  min={1}
                  max={product.stock}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v >= 1 && v <= product.stock) {
                      setQuantity(v);
                    }
                  }}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <i className="bi bi-plus" />
                </button>
              </div>
              <button
                className="btn btn-primary btn-sm flex-fill fw-semibold"
                onClick={handleAdd}
              >
                <i className="bi bi-cart-plus me-1" />
                Add
              </button>
            </div>
          )}

          {outOfStock && (
            <button className="btn btn-secondary btn-sm w-100" disabled>
              <i className="bi bi-x-circle me-1" />
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
