import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const { sendResetEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [resetLink, setResetLink] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setResetLink(null);
    setLoading(true);
    try {
      const res = await sendResetEmail(email);
      const link = res?.data?.resetLink || res?.resetLink || res?.data?.data?.resetLink || null;
      if (link) {
        setResetLink(link);
        setMessage({ type: "info", text: "Token de recuperación creado (modo debug). Usa el enlace para restablecer tu contraseña." });
      } else {
        setMessage({ type: "info", text: "Si el email existe, se ha enviado un correo con instrucciones para restablecer la contraseña." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Error enviando el correo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: 420, maxWidth: "100%", background: "var(--surface-color,#fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "var(--shadow-md, 0 2px 8px rgba(0,0,0,0.08))" }}>
        <h2>Recuperar contraseña</h2>
        <p style={{ color: "var(--text-secondary,#667781)" }}>Ingrese el email con el que se registró.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: ".75rem", marginTop: "1rem" }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6 }} />
          <button className="btn primary" type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar enlace de recuperación"}</button>
        </form>

        {message && <div style={{ marginTop: ".75rem", color: message.type === "error" ? "crimson" : "green" }}>{message.text}</div>}

        {resetLink && (
          <div style={{ marginTop: ".75rem", padding: ".5rem", background: "#f5f5f5", borderRadius: 6 }}>
            <div>Enlace (modo debug):</div>
            <a href={resetLink} target="_blank" rel="noreferrer">{resetLink}</a>
            <div style={{ marginTop: ".5rem", fontSize: ".85rem", color: "var(--text-secondary,#667781)" }}>Este token expira en 1 hora (según backend).</div>
          </div>
        )}

        <div style={{ marginTop: ".75rem" }}>
          <Link to="/login">Volver a iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}