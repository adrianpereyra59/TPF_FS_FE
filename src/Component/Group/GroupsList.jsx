import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useWhatsApp } from "../../Context/WhatsappContext"
import GroupItem from "./GroupItem"
import CreateGroupModal from "./CreateGroupModal"

export default function GroupsList() {
    const navigate = useNavigate()
    const { fetchGroups, getGroups } = useWhatsApp()
    const [openCreate, setOpenCreate] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            await fetchGroups()
            setLoading(false)
        }
        load()
    }, [fetchGroups])

    const groups = getGroups()

    const handleOpen = (groupId) => {
        navigate(`/group/${groupId}`)
    }

    return (
        <div className="groups-container">
            <div className="groups-header" style={{ padding: "1rem", borderBottom: "1px solid var(--border-color, #e9edef)" }}>
                <h2>Grupos</h2>
                <div>
                    <button className="create-group-btn" onClick={() => setOpenCreate(true)}>Crear grupo</button>
                </div>
            </div>

            <div style={{ padding: "1rem" }}>
                {loading ? (
                    <div>Cargando...</div>
                ) : groups.length === 0 ? (
                    <div className="empty-state">
                        <h3>No hay grupos</h3>
                        <p>Crea un grupo para empezar a chatear</p>
                    </div>
                ) : (
                    groups.map((g) => <GroupItem key={g._id || g.id} group={g} onOpen={() => handleOpen(g._id || g.id)} />)
                )}
            </div>

            <CreateGroupModal open={openCreate} onClose={() => setOpenCreate(false)} />
        </div>
    )
}