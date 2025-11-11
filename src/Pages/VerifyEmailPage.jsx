import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading|success|error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no provisto.");
      return;
    }

    const verify = async () => {
      setStatus("loading");
      try {
        const res = await api.post("/auth/verify-email", { verification_token: token });
        setStatus("success");
        setMessage("Tu correo fue verificado correctamente. Serás redirigido al inicio de sesión...");
        setTimeout(() => {
          const FRONT = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
          try {
            if (new URL(FRONT).origin === window.location.origin) {
              navigate("/login", { replace: true });
            } else {
              window.location.href = `${FRONT.replace(/\/$/, "")}/login`;
            }
          } catch (e) {
            window.location.href = `${FRONT.replace(/\/$/, "")}/login`;
          }
        }, 1500);
      } catch (err) {
        setStatus("error");
        setMessage(err?.message || "Error al verificar el correo.");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: 480, maxWidth: "100%", background: "var(--surface-color,#fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "var(--shadow-md, 0 2px 8px rgba(0,0,0,0.08))" }}>
        <h2>Verificación de correo</h2>
        {status === "loading" && <p>Verificando token...</p>}
        {status === "success" && <div style={{ color: "green" }}>{message}</div>}
        {status === "error" && <div style={{ color: "crimson" }}>{message}</div>}
      </div>
    </div>
  );
}