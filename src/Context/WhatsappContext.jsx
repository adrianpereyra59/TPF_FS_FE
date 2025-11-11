import React, { createContext, useContext, useEffect, useState } from "react";

/*
  WhatsappContext corregido:
  - elimina claves duplicadas
  - exporta tanto `useWhatsapp` y `useWhatsApp` (alias)
  - exporta tanto `WhatsappProvider` y `WhatsAppProvider` (alias) para compatibilidad con imports existentes
*/

const WhatsappContext = createContext();

export function useWhatsapp() {
  return useContext(WhatsappContext);
}

// Alias por compatibilidad con imports que usan useWhatsApp (capital A)
export function useWhatsApp() {
  return useWhatsapp();
}

export function WhatsappProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);

  // Ejemplo: fetchContacts (reemplazar por fetch real)
  const fetchContacts = async () => {
    // placeholder
    return [];
  };

  const getContact = (id) => contacts.find((c) => c.id === id) || null;
  const getMessages = (contactId) => messages.filter((m) => m.contactId === contactId);

  // Ejemplo: fetchMembers (reemplazar por fetch real)
  const fetchMembers = async (groupId) => {
    return [];
  };

  useEffect(() => {
    (async () => {
      try {
        const c = await fetchContacts();
        setContacts(c);
        setFilteredContacts(c);
      } catch (e) {
        console.error("WhatsappContext: fetchContacts error", e);
      }
    })();
  }, []);

  const value = {
    // state
    contacts,
    filteredContacts,
    messages,
    members,

    // setters
    setContacts,
    setFilteredContacts,
    setMessages,
    setMembers,

    // actions
    fetchContacts,
    getContact,
    getMessages,
    fetchMembers,
  };

  return <WhatsappContext.Provider value={value}>{children}</WhatsappContext.Provider>;
}

// Alias por compatibilidad con imports que esperan `WhatsAppProvider`
export function WhatsAppProvider(props) {
  return <WhatsappProvider {...props} />;
}

export default WhatsappContext;