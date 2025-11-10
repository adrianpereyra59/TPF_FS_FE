import React, { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"

export default function ResetPasswordPage() {
    const { token } = useParams()
    const { resetPassword } = useAuth()
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [message, setMessage] = useState(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!password || password.length < 4) {
            setMessage({ type: "error", text: "La contraseña debe tener al menos 4 caracteres." })
            return
        }
        if (password !== confirm) {
            setMessage({ type: "error", text: "Las contraseñas no coinciden." })
            return
        }
        const res = resetPassword(token, password)
        if (!res.success) {
            setMessage({ type: "error", text: res.message })
            return
        }
        setMessage({ type: "success", text: res.message })
        setTimeout(() => navigate("/login"), 900)
    }

    return (
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ width: 420, maxWidth: "100%", background: "var(--surface-color,#fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "var(--shadow-md, 0 2px 8px rgba(0,0,0,0.08))" }}>
                <h2>Restablecer contraseña</h2>
                <p style={{ color: "var(--text-secondary,#667781)" }}>Ingresa una nueva contraseña.</p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: ".75rem", marginTop: "1rem" }}>
                    <input type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6 }} />
                    <input type="password" placeholder="Confirmar contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6 }} />

                    {message && <div style={{ color: message.type === "error" ? "crimson" : "green" }}>{message.text}</div>}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".5rem" }}>
                        <button className="btn primary" type="submit">Restablecer</button>
                        <Link to="/login">Volver a iniciar sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}