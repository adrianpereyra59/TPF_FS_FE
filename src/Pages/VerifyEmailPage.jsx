import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Token no provisto."); return; }
    const verify = async () => {
      setStatus("loading");
      try {
        // Llamamos al endpoint POST de verificación (si lo tienes) o simplemente abrimos GET en backend.
        // Usamos POST /auth/verify-email si lo expones; si no, la apertura directa del enlace al backend GET también funciona.
        try {
          await api.post("/auth/verify-email", { verification_token: token });
        } catch (e) {
          // si POST no existe, fallback a GET directamente contra el backend
          const base = (import.meta.env.VITE_API_URL || "https://tpf-fs-be.vercel.app").replace(/\/$/, "");
          const res = await fetch(`${base}/api/auth/verify-email/${token}`, { method: "GET", redirect: "follow" });
          if (!res.ok) throw new Error("Verificación fallida");
        }

        setStatus("success");
        setMessage("Correo verificado. Serás redirigido al inicio de sesión...");
        setTimeout(() => {
          const FRONT = import.meta.env.VITE_FRONTEND_URL || "https://tpf-fs-fe.vercel.app";
          window.location.href = `${FRONT.replace(/\/$/, "")}/login?verified=1`;
        }, 1500);
      } catch (err) {
        setStatus("error");
        setMessage(err?.message || "Error al verificar el correo.");
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 480, padding: 20, background: "#fff", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}>
        <h2>Verificación de correo</h2>
        {status === "loading" && <p>Verificando token...</p>}
        {status === "success" && <p style={{ color: "green" }}>{message}</p>}
        {status === "error" && <p style={{ color: "crimson" }}>{message}</p>}
      </div>
    </div>
  );
}