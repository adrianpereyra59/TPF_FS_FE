import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import api from "../services/api" 
import { getSocket, connectSocket } from "../services/socketClient"
import { useAuth } from "./AuthContext"

const WhatsappContext = createContext()

export function WhatsAppProvider({ children }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState([]) 
  const [messagesCache, setMessagesCache] = useState({}) 
  const [membersCache, setMembersCache] = useState({}) 
  const [loading, setLoading] = useState(false)


  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get("/workspace")
      const g = res?.data?.data?.workspaces || []
      setGroups(g)
      setLoading(false)
      return g
    } catch (e) {
      setLoading(false)
      console.error("fetchGroups error", e)
      return []
    }
  }, [])

  useEffect(() => {
    
    if (user) {
      fetchGroups()
      connectSocket()
    } else {
      setGroups([])
      
    }
  }, [user, fetchGroups])

 
  const getGroups = () => groups || []

  const getGroupById = (id) => (groups || []).find((g) => String(g._id || g.id) === String(id))

  const getGroupMessages = (groupId) => messagesCache[groupId] || []

  const getGroupMembers = (groupId) => membersCache[groupId] || []

  const getGroupRoles = (groupId) => {
    const g = getGroupById(groupId)
    return (g && g.roles) || {}
  }


  const createGroup = async ({ name, url_image = "" }) => {
    try {
      const res = await api.post("/workspace", { name, url_img: url_image })
      
      await fetchGroups()
      return { success: true }
    } catch (e) {
      console.error("createGroup error", e)
      return { success: false, message: e?.response?.data?.message || "Error creando grupo" }
    }
  }

  const addMemberToGroup = async (groupId, contactIdOrEmail) => {
    try {
            if (typeof contactIdOrEmail === "string" && contactIdOrEmail.includes("@")) {
        await api.post(`/workspace/${groupId}/invite`, { invited_email: contactIdOrEmail })
      } else {
                await api.post(`/workspace/${groupId}/invite`, { invited_email: contactIdOrEmail })
      }
      await fetchGroups()
      return { success: true }
    } catch (e) {
      console.error("addMemberToGroup error", e)
      return { success: false, message: e?.response?.data?.message || "Error agregando miembro" }
    }
  }

  const removeMemberFromGroup = async (groupId, memberId) => {
    try {
            await api.delete(`/workspace/${groupId}/members/${memberId}`)
      
      if (membersCache[groupId]) {
        setMembersCache((s) => ({ ...s, [groupId]: s[groupId].filter((m) => String(m._id) !== String(memberId)) }))
      }
      return { success: true }
    } catch (e) {
      console.error("removeMemberFromGroup error", e)
      return { success: false, message: e?.response?.data?.message || "Error removiendo miembro" }
    }
  }

  const assignRole = async (groupId, memberId, role) => {
    try {
      await api.put(`/workspace/${groupId}/users/${memberId}/role`, { role })
      
      if (membersCache[groupId]) {
        const updated = membersCache[groupId].map((m) => (String(m._id) === String(memberId) ? { ...m, role } : m))
        setMembersCache((s) => ({ ...s, [groupId]: updated }))
      }
      await fetchGroups()
      return { success: true }
    } catch (e) {
      console.error("assignRole error", e)
      return { success: false, message: e?.response?.data?.message || "Error asignando rol" }
    }
  }

  const sendInvitation = async (groupId, toContactEmail) => {
    try {
      
      await api.post(`/workspace/${groupId}/invitations`, { invited_email: toContactEmail })
      return { success: true }
    } catch (e) {
      console.error("sendInvitation error", e)
      return { success: false, message: e?.response?.data?.message || "Error enviando invitacion" }
    }
  }

  const addGroupMessage = async (groupId, content) => {
    try {
       if (typeof content === "object" && content.channelId) {
        await api.post(`/workspace/${groupId}/channels/${content.channelId}/messages`, { content: content.text || "" })
      } else {
       
        console.warn("addGroupMessage: no channelId provided. Use addGroupMessage({ channelId, text })")
      }
      return { success: true }
    } catch (e) {
      console.error("addGroupMessage error", e)
      return { success: false, message: e?.response?.data?.message || "Error enviando mensaje" }
    }
  }

  const fetchMessagesForChannel = async (workspaceId, channelId) => {
    try {
      const res = await api.get(`/workspace/${workspaceId}/channels/${channelId}/messages`)
      const msgs = res?.data?.data?.messages || []
      setMessagesCache((s) => ({ ...s, [channelId]: msgs }))
      return msgs
    } catch (e) {
      console.error("fetchMessagesForChannel error", e)
      return []
    }
  }

  const fetchMembersForGroup = async (groupId) => {
    try {
      const res = await api.get(`/workspace/${groupId}`) 
      const members = res?.data?.data?.members || []
      setMembersCache((s) => ({ ...s, [groupId]: members }))
      return members
    } catch (e) {
      console.error("fetchMembersForGroup error", e)
      return []
    }
  }

  
  useEffect(() => {
    
    try {
      const socket = getSocket()
      
    } catch (e) {
      
    }
  }, [])

  const value = {
    groups,
    loading,
    getGroups,
    fetchGroups,
    createGroup,
    getGroupById,
    getGroupMessages,
    getGroupMembers,
    getGroupRoles,
    addMemberToGroup,
    removeMemberFromGroup,
    assignRole,
    sendInvitation,
    addGroupMessage,
    fetchMessagesForChannel,
    fetchMembersForGroup,
  }

  return <WhatsappContext.Provider value={value}>{children}</WhatsappContext.Provider>
}

export function useWhatsApp() {
  const ctx = useContext(WhatsappContext)
  if (!ctx) throw new Error("useWhatsApp must be used within WhatsAppProvider")
  return ctx
}