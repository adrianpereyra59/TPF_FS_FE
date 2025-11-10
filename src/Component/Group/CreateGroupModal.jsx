import React, { useState } from "react"
import { useWhatsApp } from "../../Context/WhatsappContext"

export default function CreateGroupModal({ open, onClose }) {
  const { createGroup, fetchGroups } = useWhatsApp()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  if (!open) return null

  const handleCreate = async () => {
    if (!name || name.trim().length < 2) return alert("Nombre inválido")
    setLoading(true)
    const res = await createGroup({ name: name.trim() })
    setLoading(false)
    if (res.success) {
      await fetchGroups()
      setName("")
      onClose()
    } else {
      alert(res.message || "Error creando grupo")
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Crear grupo</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del grupo" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={handleCreate} disabled={loading}>{loading ? "Creando..." : "Crear"}</button>
        </div>
      </div>
    </div>
  )
}