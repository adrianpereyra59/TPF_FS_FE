// Reemplaza el existente en src/Context/WhatsappContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../utils/api.js";
import { useAuth } from "./AuthContext";

const WhatsappContext = createContext();
export function useWhatsapp() { return useContext(WhatsappContext); }
export function useWhatsApp() { return useWhatsapp(); }

function idOf(obj) {
  if (!obj && obj !== 0) return obj;
  if (typeof obj === "string" || typeof obj === "number") return String(obj);
  return String(obj._id ?? obj.id ?? "");
}

export function WhatsappProvider({ children }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const res = await api.get("/groups");
      const arr = Array.isArray(res) ? res : res?.data ?? [];
      setGroups(arr);
      return { success: true, data: arr };
    } catch (err) {
      // Tratar 404 como "no hay grupos" (backend no implementó endpoint)
      if (err && (err.status === 404 || /404/.test(String(err.message)))) {
        console.info("fetchGroups: endpoint /api/groups no encontrado (404). Se asume lista vacía.");
        setGroups([]);
        return { success: true, data: [] };
      }
      console.error("WhatsappContext.fetchGroups error:", err);
      return { success: false, message: err?.message || "Error fetching groups" };
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const res = await api.get("/contacts");
      const arr = Array.isArray(res) ? res : res?.data ?? [];
      setContacts(arr);
      return { success: true, data: arr };
    } catch (err) {
      if (err && (err.status === 404 || /404/.test(String(err.message)))) {
        console.info("fetchContacts: endpoint /api/contacts no encontrado (404). Manteniendo contactos locales.");
        return { success: true, data: [] };
      }
      console.warn("WhatsappContext.fetchContacts warning (endpoint optional):", err?.message || err);
      return { success: false, message: err?.message || "Error fetching contacts" };
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  const getGroups = () => groups;
  const getGroupById = (groupId) => {
    if (!groupId) return null;
    const id = String(groupId);
    return groups.find((g) => idOf(g) === id) || null;
  };

  const createGroup = async ({ name, members = [], channels = [] }) => {
    try {
      const res = await api.post("/groups", { name, members, channels });
      const created = res?.data ?? res;
      setGroups((prev) => [created, ...prev]);
      return { success: true, group: created };
    } catch (err) {
      console.error("createGroup error:", err);
      return { success: false, message: err?.message || "Error creating group" };
    }
  };

  const updateGroup = async (groupId, payload) => {
    try {
      const res = await api.put(`/groups/${groupId}`, payload);
      const updated = res?.data ?? res;
      setGroups((prev) => prev.map((g) => (idOf(g) === String(groupId) ? updated : g)));
      return { success: true, group: updated };
    } catch (err) {
      console.error("updateGroup error:", err);
      return { success: false, message: err?.message || "Error updating group" };
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await api.del(`/groups/${groupId}`);
      setGroups((prev) => prev.filter((g) => idOf(g) !== String(groupId)));
      return { success: true };
    } catch (err) {
      console.error("deleteGroup error:", err);
      return { success: false, message: err?.message || "Error deleting group" };
    }
  };

  const addMemberToGroup = async (groupId, memberId) => {
    try {
      const res = await api.post(`/groups/${groupId}/members`, { memberId });
      const updated = res?.data ?? res;
      setGroups((prev) => prev.map((g) => (idOf(g) === String(groupId) ? (updated || g) : g)));
      return { success: true, updated };
    } catch (err) {
      console.error("addMemberToGroup error:", err);
      return { success: false, message: err?.message || "Error adding member" };
    }
  };

  const removeMemberFromGroup = async (groupId, memberId) => {
    try {
      await api.del(`/groups/${groupId}/members/${memberId}`);
      setGroups((prev) =>
        prev.map((g) => {
          if (idOf(g) !== String(groupId)) return g;
          const members = Array.isArray(g.members) ? g.members.filter((m) => idOf(m) !== String(memberId)) : [];
          return { ...g, members };
        })
      );
      return { success: true };
    } catch (err) {
      console.error("removeMemberFromGroup error:", err);
      return { success: false, message: err?.message || "Error removing member" };
    }
  };

  const sendInvitation = async (groupId, toContactId) => {
    try {
      const res = await api.post(`/groups/${groupId}/invitations`, { toContactId });
      const invitation = res?.data ?? res;
      await fetchGroups();
      return { success: true, invitation };
    } catch (err) {
      console.error("sendInvitation error:", err);
      return { success: false, message: err?.message || "Error sending invitation" };
    }
  };

  const acceptInvitation = async (invitationId) => {
    try {
      const res = await api.post(`/invitations/${invitationId}/accept`);
      await fetchGroups();
      return { success: true, data: res?.data ?? res };
    } catch (err) {
      console.error("acceptInvitation error:", err);
      return { success: false, message: err?.message || "Error accepting invitation" };
    }
  };

  const declineInvitation = async (invitationId) => {
    try {
      try {
        const res = await api.post(`/invitations/${invitationId}/decline`);
        await fetchGroups();
        return { success: true, data: res?.data ?? res };
      } catch (e) {
        await api.del(`/invitations/${invitationId}`);
        await fetchGroups();
        return { success: true };
      }
    } catch (err) {
      console.error("declineInvitation error:", err);
      return { success: false, message: err?.message || "Error declining invitation" };
    }
  };

  const assignRole = async (groupId, memberId, role) => {
    try {
      const res = await api.put(`/groups/${groupId}/roles`, { memberId, role });
      const updated = res?.data ?? res;
      setGroups((prev) => prev.map((g) => (idOf(g) === String(groupId) ? (updated || g) : g)));
      return { success: true, updated };
    } catch (err) {
      console.error("assignRole error:", err);
      return { success: false, message: err?.message || "Error assigning role" };
    }
  };

  const getPendingInvitationsForGroup = (groupId) => {
    const g = getGroupById(groupId);
    if (!g) return [];
    return (g.invitations || []).filter((i) => (i.status ? i.status === "pending" : i.state === "pending"));
  };

  const getGroupMembers = (groupId) => {
    const g = getGroupById(groupId);
    if (!g) return [];
    return Array.isArray(g.members) ? g.members.map((m) => (typeof m === "string" ? m : (m._id ?? m.id ?? m))) : [];
  };

  const getGroupRoles = (groupId) => {
    const g = getGroupById(groupId);
    if (!g) return {};
    return g.roles || {};
  };

  const fetchMessagesForChannel = async (groupId, channelId) => {
    try {
      const res = await api.get(`/groups/${groupId}/channels/${channelId}/messages`);
      const msgs = Array.isArray(res) ? res : res?.data ?? [];
      return msgs;
    } catch (err) {
      console.error("fetchMessagesForChannel error:", err);
      return [];
    }
  };

  const addGroupMessage = async (groupId, { channelId, text }) => {
    try {
      const res = await api.post(`/groups/${groupId}/channels/${channelId}/messages`, { text });
      const created = res?.data ?? res;
      return { success: true, message: created };
    } catch (err) {
      console.error("addGroupMessage error:", err);
      return { success: false, message: err?.message || "Error sending message" };
    }
  };

  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchContacts();
    } else {
      setGroups([]);
      setContacts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const value = {
    groups,
    contacts,
    loadingGroups,
    loadingContacts,
    fetchGroups,
    fetchContacts,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroups,
    getGroupById,
    addMemberToGroup,
    removeMemberFromGroup,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    assignRole,
    getPendingInvitationsForGroup,
    getGroupMembers,
    getGroupRoles,
    fetchMessagesForChannel,
    addGroupMessage,
    currentUser: user,
    apiBase: api.BASE,
  };

  return <WhatsappContext.Provider value={value}>{children}</WhatsappContext.Provider>;
}

export function WhatsAppProvider(props) { return <WhatsappProvider {...props} />; }
export default WhatsappProvider;