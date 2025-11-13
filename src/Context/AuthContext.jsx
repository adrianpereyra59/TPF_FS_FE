import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api.js";

const AuthContext = createContext();
const AUTH_KEY = "auth_token";

export function useAuth() {
  return useContext(AuthContext);
}

function parseJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token) {
      api.setToken(token);
      const payload = parseJwt(token);
      if (payload) setUser({ id: payload.id || payload.user_id, name: payload.name || payload.username, email: payload.email });
      else setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const token = res?.data?.authorization_token || res?.authorization_token || res?.token || res?.data?.token;
      if (token) {
        localStorage.setItem(AUTH_KEY, token);
        api.setToken(token);
        const payload = parseJwt(token);
        setUser(payload ? { id: payload.id || payload.user_id, name: payload.name || payload.username, email: payload.email } : {});
      }
      return res;
    } catch (err) {
      const message = err?.response?.message || err?.message || "Login failed";
      throw new Error(message);
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      // backend espera { username, email, password }
      const body = { username: name || email, email, password };
      const res = await api.post("/api/auth/register", body);
      return res;
    } catch (err) {
      const message = err?.response?.message || err?.message || "Register failed";
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    api.setToken(null);
    setUser(null);
  };

  const sendResetEmail = async (email) => {
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      return res;
    } catch (err) {
      const message = err?.response?.message || err?.message || "Error sending reset email";
      throw new Error(message);
    }
  };

  const resetPassword = async (reset_token, new_password) => {
    try {
      const res = await api.post("/api/auth/reset-password", { reset_token, new_password });
      return res;
    } catch (err) {
      const message = err?.response?.message || err?.message || "Error resetting password";
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, sendResetEmail, resetPassword }}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}