import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        const res = login({ email, password })
        if (!res.success) {
            setError(res.message)
            return
        }
        setError(null)
        
        navigate("/", { replace: true })
    }

    return (
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ width: 420, maxWidth: "100%", background: "var(--surface-color,#fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "var(--shadow-md, 0 2px 8px rgba(0,0,0,0.08))" }}>
                <h2 style={{ marginBottom: ".5rem" }}>Iniciar sesión</h2>
                <p style={{ marginTop: 0, color: "var(--text-secondary,#667781)" }}>Ingrese su email y contraseña</p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: ".75rem", marginTop: "1rem" }}>
                    <label>
                        <div style={{ fontSize: ".85rem" }}>Email</div>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: ".5rem", borderRadius: 6 }} />
                    </label>

                    <label>
                        <div style={{ fontSize: ".85rem" }}>Contraseña</div>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: ".5rem", borderRadius: 6 }} />
                    </label>

                    {error && <div style={{ color: "crimson" }}>{error}</div>}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".5rem" }}>
                        <button type="submit" className="btn primary">Ingresar</button>
                        <Link to="/forgot-password" style={{ color: "var(--primary-color,#25d366)" }}>¿Olvidaste tu contraseña?</Link>
                    </div>

                    <div style={{ marginTop: ".5rem", textAlign: "center" }}>
                        ¿No tenés cuenta? <Link to="/register" style={{ color: "var(--primary-color,#25d366)" }}>Registrate</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}