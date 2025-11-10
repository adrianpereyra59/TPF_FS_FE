import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import api from "../services/api"
import { connectSocket, getSocket } from "../services/socketClient"
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
      const g = res?.data?.workspaces || res?.workspaces || []
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

  const createGroup = async ({ name, url_image = "" }) => {
    try {
      await api.post("/workspace", { name, url_img: url_image })
      await fetchGroups()
      return { success: true }
    } catch (e) {
      console.error("createGroup error", e)
      return { success: false, message: e?.message || "Error creando grupo" }
    }
  }

  const addGroupMessage = async (groupId, contentObj) => {
    try {
      if (typeof contentObj === "object" && contentObj.channelId) {
        await api.post(`/workspace/${groupId}/channels/${contentObj.channelId}/messages`, { content: contentObj.text || "" })
      } else {
        console.warn("addGroupMessage: no channelId provided.")
      }
      return { success: true }
    } catch (e) {
      console.error("addGroupMessage error", e)
      return { success: false, message: e?.message || "Error enviando mensaje" }
    }
  }

  const fetchMessagesForChannel = async (workspaceId, channelId) => {
    try {
      const res = await api.get(`/workspace/${workspaceId}/channels/${channelId}/messages`)
      const msgs = res?.data?.messages || res?.messages || []
      setMessagesCache((s) => ({ ...s, [channelId]: msgs }))
      return msgs
    } catch (e) {
      console.error("fetchMessagesForChannel error", e)
      return []
    }
  }

  const value = {
    groups,
    loading,
    getGroups,
    fetchGroups,
    createGroup,
    getGroupById,
    getGroupMessages,
    getGroupMembers,
    addGroupMessage,
    fetchMessagesForChannel,
    fetchMembersForGroup: async () => []
  }

  return <WhatsappContext.Provider value={value}>{children}</WhatsappContext.Provider>
}

export function useWhatsApp() {
  const ctx = useContext(WhatsappContext)
  if (!ctx) throw new Error("useWhatsApp must be used within WhatsAppProvider")
  return ctx
}