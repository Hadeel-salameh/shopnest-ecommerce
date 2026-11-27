"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) window.location.href = "/";
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = "Username may only contain letters, numbers, and underscores";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await apiClient("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      setSuccess(true);
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (): { label: string; color: string; width: string } => {
    const p = form.password;
    if (!p) return { label: "", color: "bg-secondary", width: "0%" };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-danger", width: "25%" };
    if (score <= 2) return { label: "Fair", color: "bg-warning", width: "50%" };
    if (score <= 3) return { label: "Good", color: "bg-info", width: "75%" };
    return { label: "Strong", color: "bg-success", width: "100%" };
  };

  const strength = passwordStrength();

  return (
    <div className="auth-page">
      <div className="auth-card card" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="text-center mb-4">
          <a href="/" className="auth-logo text-decoration-none d-block mb-3">
            <span style={{ fontSize: "2rem" }}>🛍️</span>
            <div>ShopNest</div>
          </a>
          <h4 className="fw-bold mb-1">Create your account</h4>
          <p className="text-muted small">Join thousands of happy shoppers</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill" />
            <span>Account created! Redirecting to login…</span>
          </div>
        )}

        {/* Server Error */}
        {serverError && (
          <div className="alert alert-danger d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-person text-muted" />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className={`form-control border-start-0 ps-0 ${errors.username ? "is-invalid" : ""}`}
                  placeholder="john_doe"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <div className="invalid-feedback d-block small">{errors.username}</div>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control border-start-0 ps-0 ${errors.email ? "is-invalid" : ""}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <div className="invalid-feedback d-block small">{errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div className="mb-2">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`form-control border-start-0 ps-0 border-end-0 ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-group-text bg-light"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-muted`} />
                </button>
              </div>
              {errors.password && (
                <div className="invalid-feedback d-block small">{errors.password}</div>
              )}
            </div>

            {/* Password Strength */}
            {form.password && (
              <div className="mb-3">
                <div className="progress" style={{ height: 4 }}>
                  <div
                    className={`progress-bar ${strength.color}`}
                    style={{ width: strength.width, transition: "width 0.3s ease" }}
                  />
                </div>
                <small className="text-muted">{strength.label}</small>
              </div>
            )}

            {/* Confirm Password */}
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-shield-check text-muted" />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className={`form-control border-start-0 ps-0 ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <div className="invalid-feedback d-block small">{errors.confirmPassword}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold py-2 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating account…
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2" />
                  Create Account
                </>
              )}
            </button>
          </form>
        )}

        <hr className="my-3" />

        <p className="text-center text-muted small mb-0">
          Already have an account?{" "}
          <a href="/login" className="text-primary text-decoration-none fw-semibold">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
