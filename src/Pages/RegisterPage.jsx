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

    const handleSubmit = (e) => {
        e.preventDefault()
        const res = register({ name, email, password })
        if (!res.success) {
            setError(res.message)
            setSuccess(null)
            return
        }
        setError(null)
        setSuccess(res.message)
        
        setTimeout(() => navigate("/login"), 900)
    }

    return (
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ width: 480, maxWidth: "100%", background: "var(--surface-color,#fff)", borderRadius: 8, padding: "1.25rem", boxShadow: "var(--shadow-md, 0 2px 8px rgba(0,0,0,0.08))" }}>
                <h2 style={{ marginBottom: ".5rem" }}>Registro</h2>
                <p style={{ marginTop: 0, color: "var(--text-secondary,#667781)" }}>Crea una cuenta para acceder al chat</p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: ".75rem", marginTop: "1rem" }}>
                    <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6 }} />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6 }} />
                    <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: ".5rem", borderRadius: 6 }} />

                    {error && <div style={{ color: "crimson" }}>{error}</div>}
                    {success && <div style={{ color: "green" }}>{success}</div>}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".5rem" }}>
                        <button type="submit" className="btn primary">Registrarme</button>
                        <Link to="/login" style={{ color: "var(--primary-color,#25d366)" }}>Ir a iniciar sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}