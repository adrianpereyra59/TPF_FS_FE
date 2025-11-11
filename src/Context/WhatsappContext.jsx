import React, { createContext, useContext, useEffect, useState } from "react";


const WhatsappContext = createContext();

export function useWhatsapp() {
  return useContext(WhatsappContext);
}

export function WhatsappProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);

  const fetchContacts = async () => {
    return [];
  };

  const getContact = (id) => contacts.find((c) => c.id === id) || null;
  const getMessages = (contactId) => messages.filter((m) => m.contactId === contactId);

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
 
    contacts,
    filteredContacts,
    messages,
    members,

   
    setContacts,
    setFilteredContacts,
    setMessages,
    setMembers,

 
    fetchContacts,
    getContact,
    getMessages,
    fetchMembers,
  };

  return <WhatsappContext.Provider value={value}>{children}</WhatsappContext.Provider>;
}

export default WhatsappContext;