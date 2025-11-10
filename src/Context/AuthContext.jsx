import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import LOCALSTORAGE_KEYS from "../constants/localstorage";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(LOCALSTORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      api.setToken(token);
      const payload = parseJwt(token);
      if (payload) {
        setUser({ id: payload.id, name: payload.name, email: payload.email });
      } else {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const token = res?.data?.authorization_token || res?.authorization_token || res?.token;
    if (token) {
      localStorage.setItem(LOCALSTORAGE_KEYS.AUTH_TOKEN, token);
      api.setToken(token);
      const payload = parseJwt(token);
      setUser(payload ? { id: payload.id, name: payload.name, email: payload.email } : {});
    }
    return res;
  };

  const register = async (payload) => {

    const body = {
      username: payload.name || payload.username || payload.email,
      email: payload.email,
      password: payload.password,
    };
    const res = await api.post("/api/auth/register", body);
    return res;
  };

  const logout = () => {
    localStorage.removeItem(LOCALSTORAGE_KEYS.AUTH_TOKEN);
    api.setToken(null);
    setUser(null);
    navigate("/login");
  };


  const forgotPassword = async (email) => api.post("/api/auth/forgot-password", { email });
  const resetPassword = async (token, password) => api.post("/api/auth/reset-password", { reset_token: token, new_password: password });

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, resetPassword }}>
      {!loading ? children : <div>Cargando...</div>}
    </AuthContext.Provider>
  );
}