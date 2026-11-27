"use client";

import type { AuthUser } from "@/hooks/useAuth";

interface NavbarProps {
  user: AuthUser | null;
  cartCount?: number;
  onCartClick?: () => void;
}

export default function Navbar({ user, cartCount = 0, onCartClick }: NavbarProps) {
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/";
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top"
      style={{ background: "var(--dark)" }}
    >
      <div className="container">
        {/* Brand */}
        <a className="navbar-brand d-flex align-items-center" href="/">
          <div className="brand-icon">
            <i className="bi bi-bag-heart-fill" />
          </div>
          ShopNest
        </a>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" href="/">
                <i className="bi bi-house me-1" />
                Home
              </a>
            </li>
          </ul>

          {/* Right side */}
          <div className="d-flex align-items-center gap-2">
            {/* Cart Button */}
            {onCartClick && (
              <button
                className="btn btn-outline-light btn-sm position-relative"
                onClick={onCartClick}
                title="Shopping Cart"
              >
                <i className="bi bi-cart3" />
                {cartCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <>
                {/* User greeting */}
                <span
                  className="text-white-50 small d-none d-lg-inline"
                  style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  <i className="bi bi-person-circle me-1" />
                  {user.username}
                </span>

                {/* Admin Dashboard */}
                {user.role === "admin" && (
                  <a href="/admin" className="btn btn-warning btn-sm fw-semibold">
                    <i className="bi bi-speedometer2 me-1" />
                    Dashboard
                  </a>
                )}

                {/* Orders */}
                <a href="/orders" className="btn btn-outline-light btn-sm">
                  <i className="bi bi-bag-check me-1" />
                  Orders
                </a>

                {/* Logout */}
                <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="btn btn-outline-light btn-sm">
                  <i className="bi bi-box-arrow-in-right me-1" />
                  Login
                </a>
                <a href="/register" className="btn btn-primary btn-sm">
                  <i className="bi bi-person-plus me-1" />
                  Register
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
