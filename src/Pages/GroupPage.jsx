import React, { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"
import { connectSocket, getSocket, disconnectSocket } from "../services/socketClient"
import GroupHeader from "../Component/Group/GroupHeader"
import Message from "../Component/Chat/Message"
import GroupMessageInput from "../Component/Group/GroupMessageInput"

export default function GroupPage() {
    const { id } = useParams() // id = workspace id
    const navigate = useNavigate()
    const [workspace, setWorkspace] = useState(null)
    const [channelId, setChannelId] = useState(null)
    const [messages, setMessages] = useState([])
    const messagesEndRef = useRef(null)

    useEffect(() => {
        const load = async () => {
            try {
                // obtener workspace con sus canales
                const res = await api.get(`/workspace/${id}`)
                const data = res?.data?.data
                setWorkspace(data.workspace)
                const channels = data.channels || []
                let chId = channels.length > 0 ? channels[0]._id || channels[0].id : null

                // if no channel, crear 'general'
                if (!chId) {
                    const createCh = await api.post(`/workspace/${id}/channels`, { name: "general" })
                    // backend debería devolver lista actualizada o el channel nuevo
                    const chList = createCh?.data?.data?.channels
                    chId = chList && chList.length ? (chList[0]._id || chList[0].id) : null
                }
                setChannelId(chId)

                if (chId) {
                    const msgs = await api.get(`/workspace/${id}/channels/${chId}/messages`)
                    setMessages(msgs?.data?.data?.messages || [])
                }
            } catch (err) {
                console.error(err)
                navigate("/")
            }
        }
        load()
    }, [id])

    useEffect(() => {
        // connect socket and join room for channel
        if (!channelId) return
        const socket = connectSocket()
        socket.emit("join:channel", { channelId })
        const handleMsg = (payload) => {
            if (payload && payload.channelId === channelId) {
                // append message
                setMessages((m) => [...m, payload.message])
            }
        }
        socket.on("group:message", handleMsg)

        return () => {
            socket.emit("leave:channel", { channelId })
            socket.off("group:message", handleMsg)
            // we don't disconnect globally to allow other pages to use same socket
            // disconnectSocket() // optional when leaving app entirely
        }
    }, [channelId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async (text) => {
        if (!channelId) return
        try {
            await api.post(`/workspace/${id}/channels/${channelId}/messages`, { content: text })
           
        } catch (err) {
            console.error("Error sending message", err)
        }
    }

    if (!workspace) return <div className="loading">Cargando...</div>

    return (
        <div className="message-page">
            <GroupHeader group={workspace} onBack={() => navigate("/")} />
            <div className="messages-container">
                {messages.map((m) => (
                    <Message key={m._id || m.id || m.message_content} message={m} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <GroupMessageInput onSend={(text) => handleSend(text)} />
        </div>
    )
}