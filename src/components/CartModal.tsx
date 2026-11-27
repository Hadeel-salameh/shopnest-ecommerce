"use client";

import type { CartItem } from "@/hooks/useCart";

interface CartModalProps {
  show: boolean;
  cart: CartItem[];
  onClose: () => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
  onPlaceOrder: () => void;
  orderLoading: boolean;
}

export default function CartModal({
  show,
  cart,
  onClose,
  onRemove,
  onClear,
  onPlaceOrder,
  orderLoading,
}: CartModalProps) {
  const total = cart.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        style={{ zIndex: 1050 }}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-lg">
          <div className="modal-content">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-cart3 me-2 text-primary" />
                Shopping Cart
                {cart.length > 0 && (
                  <span className="badge bg-primary ms-2 rounded-pill">{cart.length}</span>
                )}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            <div className="modal-body p-0">
              {cart.length === 0 ? (
                <div className="empty-state py-5">
                  <i className="bi bi-cart-x" />
                  <h6>Your cart is empty</h6>
                  <p className="small text-muted">Add products to your cart to get started.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="list-group-item px-4 py-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        {/* Placeholder icon */}
                        <div
                          className="rounded bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 52, height: 52, fontSize: "1.5rem" }}
                        >
                          🛍️
                        </div>

                        {/* Product info */}
                        <div className="flex-fill">
                          <div className="fw-semibold">{item.product.name}</div>
                          {item.product.category && (
                            <small className="text-muted">{item.product.category.name}</small>
                          )}
                        </div>

                        {/* Quantity & price */}
                        <div className="text-end">
                          <div className="fw-bold">
                            ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                          </div>
                          <small className="text-muted">
                            {item.quantity} × ${parseFloat(item.product.price).toFixed(2)}
                          </small>
                        </div>

                        {/* Remove */}
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onRemove(item.product.id)}
                          title="Remove item"
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="modal-footer flex-column align-items-stretch border-top">
                {/* Order summary */}
                <div className="d-flex justify-content-between fw-semibold fs-5 mb-3 px-2">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={onClear}
                  >
                    <i className="bi bi-trash me-1" />
                    Clear Cart
                  </button>
                  <button
                    className="btn btn-primary flex-fill fw-semibold"
                    onClick={onPlaceOrder}
                    disabled={orderLoading}
                  >
                    {orderLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Placing Order…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-2" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
