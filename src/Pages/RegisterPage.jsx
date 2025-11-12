import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"

export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [verificationLink, setVerificationLink] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setVerificationLink(null)

        // validaciones mínimas
        if (!name || !email || !password) {
            setError("Completa todos los campos.")
            return
        }
        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.")
            return
        }

        setLoading(true)
        try {
            // Esperamos la promesa del contexto
            const res = await register({ name, email, password })

            // Mensaje que solicita el usuario: informar que se envió correo de verificación
            setSuccess(`Registro exitoso. Se envió un correo de verificación a ${email}. Revisa tu bandeja de entrada (y spam).`)

            // Si en dev el backend devuelve el link, lo mostramos (solo texto, sin romper estilos)
            const link =
                res?.data?.verificationLink ||
                res?.verificationLink ||
                res?.data?.data?.verificationLink ||
                null
            if (link) setVerificationLink(link)

            // Redirigir al login tras un pequeño delay para que el usuario vea el mensaje
            setTimeout(() => navigate("/login"), 900)
        } catch (err) {
            // Extraer mensaje del wrapper API o fallback
            const text =
                err?.response?.message ||
                err?.response?.msg ||
                err?.message ||
                "Ocurrió un error al registrar. Intenta nuevamente."
            setError(text)
            setSuccess(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ width: 480, maxWidth: "100%", background: "var(--surface-color,#fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "var(--shadow-md, 0 2px 8px rgba(0,0,0,0.08))" }}>
                <h2 style={{ marginBottom: ".5rem" }}>Registro</h2>
                <p style={{ marginTop: 0, color: "var(--text-secondary,#667781)" }}>Crea una cuenta para acceder al chat</p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: ".75rem", marginTop: "1rem" }}>
                    <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6, border: "1px solid var(--border-color,#e9edef)" }} />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6, border: "1px solid var(--border-color,#e9edef)" }} />
                    <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6, border: "1px solid var(--border-color,#e9edef)" }} />

                    {error && <div style={{ color: "crimson" }}>{error}</div>}
                    {success && <div style={{ color: "green" }}>{success}</div>}

                    {verificationLink && (
                        <div style={{ marginTop: 8 }}>
                            <strong style={{ display: "block", marginBottom: 6 }}>Link de verificación (modo debug):</strong>
                            <a href={verificationLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-color,#25d366)", wordBreak: "break-all" }}>
                                {verificationLink}
                            </a>
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".5rem" }}>
                        <button type="submit" className="btn primary" disabled={loading}>
                            {loading ? "Registrando..." : "Registrarme"}
                        </button>
                        <Link to="/login" style={{ color: "var(--primary-color,#25d366)" }}>Ir a iniciar sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}