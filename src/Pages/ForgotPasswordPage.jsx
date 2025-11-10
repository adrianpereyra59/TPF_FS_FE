import React, { useState } from "react"
import { useAuth } from "../Context/AuthContext"
import { Link } from "react-router-dom"

export default function ForgotPasswordPage() {
    const { sendResetEmail } = useAuth()
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState(null)
    const [token, setToken] = useState(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        const res = sendResetEmail(email)
        if (!res.success) {
            setMessage({ type: "error", text: res.message })
            return
        }
        setMessage({ type: "info", text: "Token de recuperación creado (simulado). Usa el enlace para restablecer tu contraseña." })
        setToken(res.token)
    }

    return (
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ width: 420, maxWidth: "100%", background: "var(--surface-color,#fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "var(--shadow-md, 0 2px 8px rgba(0,0,0,0.08))" }}>
                <h2>Recuperar contraseña</h2>
                <p style={{ color: "var(--text-secondary,#667781)" }}>Ingrese el email con el que se registró. Recibirá un enlace simulado.</p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: ".75rem", marginTop: "1rem" }}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6 }} />
                    <button className="btn primary" type="submit">Enviar enlace de recuperación</button>
                </form>

                {message && <div style={{ marginTop: ".75rem", color: message.type === "error" ? "crimson" : "green" }}>{message.text}</div>}

                {token && (
                    <div style={{ marginTop: ".75rem", padding: ".5rem", background: "#f5f5f5", borderRadius: 6 }}>
                        <div>Enlace simulado:</div>
                        <Link to={`/reset-password/${token}`}>/reset-password/{token}</Link>
                        <div style={{ marginTop: ".5rem", fontSize: ".85rem", color: "var(--text-secondary,#667781)" }}>Este token expira en 1 hora (simulado).</div>
                    </div>
                )}
            </div>
        </div>
    )
}