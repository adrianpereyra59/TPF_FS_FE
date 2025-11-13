import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api.js";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token no provisto.");
      return;
    }

    const verify = async () => {
      setStatus("loading");
      try {
        try {
          await api.get(`/auth/verify-email/${token}`);
        } catch (e) {
          try {
            await api.post("/auth/verify-email", { verification_token: token });
          } catch (err) {
            throw err;
          }
        }

        setStatus("success");
        setMessage("Correo verificado. Serás redirigido al inicio de sesión...");
        setTimeout(() => {
          const FRONT = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
          window.location.href = `${FRONT.replace(/\/$/, "")}/login?verified=1`;
        }, 1500);
      } catch (err) {
        console.error("verify email error", err);
        setStatus("error");
        setMessage(err?.message || "Error al verificar el correo.");
      }
    };

    verify();
  }, [token]);

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