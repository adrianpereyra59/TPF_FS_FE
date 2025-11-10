import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token && !user) {
      (async () => {
        try {
          const res = await api.get("/auth/me");
          if (res?.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem("auth_user", JSON.stringify(res.data.data.user));
          } else {
            // token inválido -> limpiar
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
          }
        } catch (err) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        }
      })();
    }
  }, []);

  const register = async ({ name, email, password }) => {
    setLoading(true);
    try {
      await api.post("/auth/register", { username: name, email, password });
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const message = err?.response?.data?.message || "Error al registrar";
      return { success: false, message };
    }
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res?.data?.data?.token || res?.data?.data?.authorization_token;
      if (!token) throw new Error("No se recibió token");
      localStorage.setItem("auth_token", token);
      // obtener usuario /me
      const me = await api.get("/auth/me");
      const u = me?.data?.data?.user || null;
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u));
      setLoading(false);
      return { success: true, user: u };
    } catch (err) {
      setLoading(false);
      const message = err?.response?.data?.message || "Credenciales inválidas";
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  const sendResetEmail = async (email) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return { success: true, message: res?.data?.message || "OK" };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Error" };
    }
  };

  const resetPassword = async ({ reset_token, new_password }) => {
    try {
      const res = await api.post("/auth/reset-password", { reset_token, new_password });
      return { success: true, message: res?.data?.message || "Contraseña actualizada" };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Error" };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    sendResetEmail,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}