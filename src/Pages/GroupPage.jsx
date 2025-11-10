import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWhatsApp } from "../Context/WhatsappContext";
import GroupHeader from "../Component/Group/GroupHeader";
import Message from "../Component/Chat/Message";
import GroupMessageInput from "../Component/Group/GroupMessageInput";

export default function GroupPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { getGroupById, getGroupMessages, fetchMessagesForChannel, addGroupMessage } = useWhatsApp();

  const [group, setGroup] = useState(null);
  const [channelId, setChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const g = getGroupById(id);
    if (!g) {
      navigate("/", { replace: true });
      return;
    }
    setGroup(g);

    const defaultChannel =
      (g.channels && g.channels.length > 0 && (g.channels[0]._id || g.channels[0].id)) || String(id);
    setChannelId(defaultChannel);

    const cached = getGroupMessages(defaultChannel) || [];
    setMessages(cached);
  }, [id, getGroupById, getGroupMessages, navigate]);

  useEffect(() => {
    if (!channelId) return;
    (async () => {
      const msgs = await fetchMessagesForChannel(id, channelId).catch(() => []);
      if (msgs && msgs.length) {
        setMessages(msgs);
      }
    })();
  }, [channelId, id, fetchMessagesForChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    if (!channelId) return;
    try {
      const res = await addGroupMessage(id, { channelId, text });
      const created = res?.message || res?.data?.message || res;
      if (created) {
        setMessages((m) => [...m, created]);
      }
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  if (!group) return <div className="loading">Cargando...</div>;

  return (
    <div className="message-page">
      <GroupHeader group={group} onBack={() => navigate("/")} />
      <div className="messages-container">
        {messages.map((m) => (
          <Message key={m.id || m._id || JSON.stringify(m)} message={m} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <GroupMessageInput onSend={(text) => handleSend(text)} />
    </div>
  );
}