import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error'|'info', text, extra? }
  const [verificationLink, setVerificationLink] = useState(null);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setVerificationLink(null);

    // Validaciones básicas
    if (!form.name || !form.email || !form.password) {
      setMessage({ type: "error", text: "Completa todos los campos." });
      return;
    }
    if (form.password.length < 8) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }

    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });

      // Si el backend responde OK:
      setMessage({
        type: "success",
        text: `Registro exitoso. Se envió un correo de verificación a ${form.email}. Revisa tu bandeja de entrada (y la carpeta de spam).`,
      });

      // Si el backend incluye verificationLink en data (útil en dev) lo mostramos
      const link =
        res?.data?.verificationLink ||
        res?.verificationLink ||
        res?.data?.data?.verificationLink; // intentos por si la estructura cambia
      if (link) {
        setVerificationLink(link);
      }

      // Limpiar formulario opcionalmente:
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      // err es Error con message y, si el api wrapper añadió err.response, puede haber más info
      const text =
        err?.response?.message ||
        err?.response?.msg ||
        err?.message ||
        "Ocurrió un error al registrar. Intenta nuevamente.";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h2>Registro</h2>

      {message && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 6,
            background: message.type === "success" ? "#ecfdf5" : "#fff1f2",
            color: message.type === "success" ? "#064e3b" : "#9f1239",
            border: message.type === "success" ? "1px solid #10b98133" : "1px solid #fb718533",
          }}
        >
          {message.text}
        </div>
      )}

      {verificationLink && (
        <div style={{ marginBottom: 12 }}>
          <strong>Link de verificación (modo debug):</strong>
          <div>
            <a href={verificationLink} target="_blank" rel="noopener noreferrer">
              {verificationLink}
            </a>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Nombre</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Tu nombre"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="tu@correo.com"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Contraseña</label>
          <input
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Contraseña (min. 8 caracteres)"
            type="password"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Registrando..." : "Registrarme"}
        </button>
      </form>
    </div>
  );
}