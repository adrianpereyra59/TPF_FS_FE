import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";



const WhatsappContext = createContext();

const initialContacts = [
  { id: 1, name: "María García", avatar: "", phone: "+541112345678", isOnline: true, lastSeen: "Hoy 10:32", about: "Hola!" },
  { id: 2, name: "Juan Pérez", avatar: "", phone: "+549116543210", isOnline: false, lastSeen: "Ayer 16:20", about: "Trabajo" },
  { id: 3, name: "Familia", avatar: "", phone: "", isOnline: false, lastSeen: "Hoy", about: "Grupo familiar" },
];

const initialMessages = {
  1: [
    { id: 1, text: "Hola, ¿cómo estás?", sender: "contact", time: "10:30" },
    { id: 2, text: "¡Hola! Todo bien, ¿y tú?", sender: "me", time: "10:32" },
  ],
  2: [{ id: 1, text: "¿Vamos al cine esta noche?", sender: "contact", time: "09:45" }],
};

export function WhatsAppProvider({ children }) {
  const [activeTab, setActiveTab] = useState("chats");
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState(initialContacts);
  const [messagesMap, setMessagesMap] = useState(initialMessages);
  const [groups, setGroups] = useState([]); 
  const [loading, setLoading] = useState(false);

 
  const dispatch = (action) => {
    switch (action.type) {
      case "SET_ACTIVE_TAB":
        setActiveTab(action.payload);
        break;
      case "SET_SEARCH_TERM":
        setSearchTerm(action.payload);
        break;
      default:
        // noop
        break;
    }
  };


  const filteredContacts = contacts.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));


  const getContact = (id) => {
    if (id == null) return null;
    const numeric = Number(id);
    return contacts.find((c) => Number(c.id) === numeric) || null;
  };

  const getMessages = (contactId) => {
    const numeric = Number(contactId);
    return messagesMap[numeric] || [];
  };

  const addMessage = (contactId, text) => {
    const numeric = Number(contactId);
    const now = new Date();
    const msg = {
      id: Date.now(),
      text,
      sender: "me",
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessagesMap((prev) => {
      const existing = prev[numeric] || [];
      return { ...prev, [numeric]: [...existing, msg] };
    });
    return msg;
  };

  const getLastMessage = (contactId) => {
    const msgs = getMessages(contactId);
    if (!msgs || msgs.length === 0) return null;
    return msgs[msgs.length - 1];
  };

  const getUnreadCount = (contactId) => {
    // Simple stub: 0
    return 0;
  };


  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/workspace").catch(() => null);
      const fetched = res?.data?.workspaces || res?.workspaces || [];
      setGroups(fetched);
      setLoading(false);
      return fetched;
    } catch (e) {
      setLoading(false);
      console.error("fetchGroups error", e);
      return [];
    }
  }, []);

  const getGroups = () => groups || [];

  const getGroupById = (id) => (groups || []).find((g) => String(g._id || g.id) === String(id)) || null;

  const createGroup = async ({ name, url_image = "" }) => {
    try {

      const newGroup = {
        id: Date.now().toString(),
        name,
        url_img: url_image,
        members: [],
        createdAt: new Date().toISOString(),
        adminId: null,
      };
      setGroups((g) => [newGroup, ...(g || [])]);
      return { success: true, group: newGroup };
    } catch (e) {
      console.error("createGroup error", e);
      return { success: false, message: e?.message || "Error creando grupo" };
    }
  };

  const [groupMessages, setGroupMessages] = useState({});

  const fetchMessagesForChannel = async (workspaceId, channelId) => {
    try {
      const res = await api.get(`/workspace/${workspaceId}/channels/${channelId}/messages`).catch(() => null);
      const msgs = res?.data?.messages || res?.messages || [];
      setGroupMessages((s) => ({ ...s, [channelId]: msgs }));
      return msgs;
    } catch (e) {
      console.error("fetchMessagesForChannel error", e);
      return groupMessages[channelId] || [];
    }
  };

  const getGroupMessages = (groupId) => groupMessages[groupId] || [];

  const addGroupMessage = async (groupId, contentObj) => {
    try {
      const channelId = contentObj?.channelId || String(groupId);
      const text = contentObj?.text ?? (typeof contentObj === "string" ? contentObj : "");
      const now = new Date();
      const created = {
        id: Date.now(),
        content: text,
        author: "me",
        createdAt: now.toISOString(),
        time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setGroupMessages((s) => {
        const prev = s[channelId] || [];
        return { ...s, [channelId]: [...prev, created] };
      });
      return { success: true, message: created };
    } catch (e) {
      console.error("addGroupMessage error", e);
      return { success: false, message: e?.message || "Error enviando mensaje" };
    }
  };

  const getGroupMembers = (groupId) => {
    const g = getGroupById(groupId);
    return (g && g.members) || [];
  };

  const value = {
    activeTab,
    searchTerm,
    dispatch,
    filteredContacts,
    contacts,
    filteredContacts,
    getContact,
    getMessages,
    addMessage,
    getLastMessage,
    getUnreadCount,
    groups,
    loading,
    getGroups,
    fetchGroups,
    createGroup,
    getGroupById,
    getGroupMessages,
    fetchMessagesForChannel,
    addGroupMessage,
    getGroupMembers,
    getMembersForGroup: async () => [],
    fetchMembersForGroup: async () => [],
    fetchMembers: async () => [],
    fetchMembersForGroup: async () => [],
  };

  return <WhatsappContext.Provider value={value}>{children}</WhatsappContext.Provider>;
}

export function useWhatsApp() {
  const ctx = useContext(WhatsappContext);
  if (!ctx) throw new Error("useWhatsApp must be used within WhatsAppProvider");
  return ctx;
}