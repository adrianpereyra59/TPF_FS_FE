import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mostrar mensaje "correo verificado con éxito" si viene ?verified=1 en la URL
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "1") {
      setSuccess("Correo verificado con éxito. Ya puedes iniciar sesión.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      // Si el login devuelve token/ok, redirigimos al home
      navigate("/");
    } catch (err) {
      // Intentamos extraer información útil del error
      const apiMessage =
        err?.response?.message ||
        err?.response?.msg ||
        err?.message ||
        "";

      // Normalizamos status (el wrapper puede poner err.status) y también revisamos response.status
      const status = err?.status || err?.response?.status || null;

      // Si es 404 o contiene texto de email no registrado, mostramos el mensaje solicitado
      const notRegistered =
        status === 404 ||
        /email no registrado|no registrado/i.test(String(apiMessage));

      if (notRegistered) {
        setError("Usuario no registrado");
      } else {
        const text =
          apiMessage ||
          "Ocurrió un error al iniciar sesión. Intenta nuevamente.";
        setError(text);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: 480, maxWidth: "100%", background: "var(--surface-color,#fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "var(--shadow-md, 0 2px 8px rgba(0,0,0,0.08))" }}>
        <h2 style={{ marginBottom: ".5rem" }}>Iniciar sesión</h2>
        <p style={{ marginTop: 0, color: "var(--text-secondary,#667781)" }}>Ingresa tus credenciales para acceder</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: ".75rem", marginTop: "1rem" }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6, border: "1px solid var(--border-color,#e9edef)" }} />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6, border: "1px solid var(--border-color,#e9edef)" }} />

          {error && <div style={{ color: "crimson" }}>{error}</div>}
          {success && <div style={{ color: "green" }}>{success}</div>}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".5rem" }}>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </button>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link to="/forgot-password" style={{ color: "var(--primary-color,#25d366)" }}>Olvidé mi contraseña</Link>
              <Link to="/register" style={{ color: "var(--primary-color,#25d366)" }}>Registrarme</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
