import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

// retry helper: intenta registerFn hasta `retries` veces si detecta error transitorio 500
async function retryRegister(registerFn, payload, retries = 2, delayMs = 800) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await registerFn(payload);
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || "");
      // reintentar sólo para 500 o mensaje conocido del server
      if (i < retries && (err?.status === 500 || msg.includes("Server error loading handler"))) {
        console.warn(`[Register] attempt ${i + 1} failed, retrying in ${delayMs}ms`, err);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [verificationLink, setVerificationLink] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setVerificationLink(null);

    if (!name || !email || !password) {
      setError("Completa todos los campos.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    const payload = { name, email, password };
    if (import.meta.env.DEV) console.info("[RegisterPage] payload ->", payload);

    setLoading(true);
    try {
      // uso del retry como workaround temporal
      const res = await retryRegister(register, payload, 2, 800);

      // backend en dev puede devolver verificationLink dentro de res.data o res.verificationLink
      const link = res?.data?.verificationLink || res?.verificationLink || res?.data?.data?.verificationLink || null;
      if (link) {
        setVerificationLink(link);
      }

      setSuccess(`Registro exitoso. Revisa tu correo (${email}).`);
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      // mostrar mensaje útil al usuario y loggear full response para debugging
      console.error("[RegisterPage] register error:", err, err?.response);
      const msg = err?.message || "Ocurrió un error al registrar. Revisa la consola para más detalles.";
      setError(msg);

      // opcional: si el backend devuelve objeto en err.response, lo dejamos en console (útil para enviar al backend)
      if (err?.response) {
        console.info("[RegisterPage] Server response object:", err.response);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: 480, maxWidth: "100%", background: "#fff", borderRadius: 8, padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <h2>Registro</h2>
        <p style={{ color: "#667781" }}>Crea una cuenta</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: ".75rem", marginTop: "1rem" }}>
          <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6 }} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6 }} />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6 }} />

          {error && <div style={{ color: "crimson" }}>{error}</div>}
          {success && <div style={{ color: "green" }}>{success}</div>}

          {verificationLink && (
            <div style={{ marginTop: 8 }}>
              <strong>Link verificación (modo debug):</strong>
              <div style={{ wordBreak: "break-all" }}>
                <a href={verificationLink} target="_blank" rel="noreferrer">{verificationLink}</a>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".5rem" }}>
            <button type="submit" className="btn primary" disabled={loading}>{loading ? "Registrando..." : "Registrarme"}</button>
            <Link to="/login" style={{ color: "#25d366" }}>Ir a iniciar sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}