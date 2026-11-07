"use client";

import { useState, useEffect } from "react";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: "admin" | "customer";
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    const token = localStorage.getItem("access_token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored) as AuthUser);
      } catch {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("access_token");
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    window.location.href = "/";
  };

  return { user, loading, login, logout };
}
