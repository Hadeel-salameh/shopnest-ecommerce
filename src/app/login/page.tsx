"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) window.location.href = "/";
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient<{
        access_token: string;
        user: { id: number; username: string; email: string; role: "admin" | "customer" };
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      login(data.access_token, data.user);
      window.location.href = data.user.role === "admin" ? "/admin" : "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        {/* Header */}
        <div className="text-center mb-4">
          <a href="/" className="auth-logo text-decoration-none d-block mb-3">
            <span style={{ fontSize: "2rem" }}>🛍️</span>
            <div>ShopNest</div>
          </a>
          <h4 className="fw-bold mb-1">Welcome back</h4>
          <p className="text-muted small">Sign in to your account to continue</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-envelope text-muted" />
              </span>
              <input
                id="email"
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-lock text-muted" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control border-start-0 ps-0 border-end-0"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-group-text bg-light cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-muted`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold py-2 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Signing in…
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <hr className="my-3" />

        <p className="text-center text-muted small mb-0">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-primary text-decoration-none fw-semibold">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
