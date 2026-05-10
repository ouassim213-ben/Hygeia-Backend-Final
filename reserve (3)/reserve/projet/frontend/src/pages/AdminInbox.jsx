import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { MessageSquare, Send, User, ShieldCheck, Activity } from 'lucide-react';
import api from '../api';

export default function AdminInbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const navy = '#194459';
  const gold = '#f0c27b';

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Refresh convo list every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConvo) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Refresh active chat every 5s
      return () => clearInterval(interval);
    }
  }, [selectedConvo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('messages/admin-list/');
      setConversations(res.data);
    } catch (e) {
      console.error("Error fetching conversations:", e);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConvo) return;
    try {
      // STRICT: Only fetch SUPPORT messages in the Admin Inbox
      const res = await api.get(`messages/?chat_type=SUPPORT&partner=${selectedConvo.id}`);
      if (res.data.length !== messages.length) {
        setMessages(res.data);
      }
    } catch (e) {
      console.error("Error fetching messages:", e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvo) return;
    try {
      const res = await api.post('messages/', { 
        content: newMessage,
        receiver: selectedConvo.id,
        chat_type: 'SUPPORT' // STRICT: Admin Inbox is SUPPORT-only
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      fetchConversations();
    } catch (e) {
      console.error("Error sending admin message:", e);
    }
  };

  const handleSelectConvo = async (convo) => {
    setSelectedConvo(convo);
    setMessages([]); // Clear previous
    try {
      await api.post(`messages/mark-read/${convo.id}/`);
      fetchConversations();
    } catch (e) {
      console.error("Error marking read:", e);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#f8fafc', height: '100vh', paddingTop: '80px', display: 'flex' }}>
        <div style={{ width: '100%', display: 'flex', overflow: 'hidden' }}>
          
          {/* Sidebar */}
          <div style={{ width: '400px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid #e2e8f0', backgroundColor: navy, color: 'white' }}>
              <h1 style={{ fontSize: '1.5rem', margin: 0, color: gold, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'serif' }}>
                <ShieldCheck size={28} /> Admin Inbox
              </h1>
              <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '10px' }}>Patient Support Terminal</p>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                  <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                  <p>No active conversations found.</p>
                </div>
              ) : (
                conversations.map(convo => (
                  <div 
                    key={convo.id} 
                    onClick={() => handleSelectConvo(convo)}
                    style={{ 
                      padding: '1.5rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                      backgroundColor: selectedConvo?.id === convo.id ? '#f0f9ff' : 'transparent',
                      transition: 'all 0.2s ease', display: 'flex', gap: '15px', alignItems: 'center'
                    }}
                  >
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: navy, color: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                      {convo.image ? <img src={convo.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : convo.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontWeight: '800', color: navy }}>{convo.name}</span>
                        {convo.unread_count > 0 && (
                          <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {convo.unread_count}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: convo.unread_count > 0 ? '700' : '500' }}>
                        {convo.last_message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Console */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fcfcfc' }}>
            {selectedConvo ? (
              <>
                <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: navy, color: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', overflow: 'hidden' }}>
                        {selectedConvo.image ? <img src={selectedConvo.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : selectedConvo.name.charAt(0)}
                     </div>
                     <div>
                       <h4 style={{ margin: 0, color: navy, fontSize: '1.1rem' }}>{selectedConvo.name}</h4>
                       <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>Secure Channel Active</span>
                     </div>
                   </div>
                   <button onClick={fetchMessages} style={{ background: 'none', border: 'none', color: navy, cursor: 'pointer', opacity: 0.6 }}>
                     <Activity size={20} />
                   </button>
                </div>

                <div style={{ flex: 1, padding: '3rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {messages.map((msg, i) => {
                    const isMe = msg.sender !== selectedConvo.id;
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '12px' }}>
                        <div style={{ 
                          maxWidth: '65%', padding: '1.1rem 1.4rem', borderRadius: isMe ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                          background: isMe ? '#e0f2fe' : '#ffffff', color: navy,
                          boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: isMe ? 'none' : '1px solid #e2e8f0',
                          fontSize: '1rem', fontWeight: '500', lineHeight: '1.5'
                        }}>
                          {msg.content}
                          <div style={{ fontSize: '0.65rem', marginTop: '6px', opacity: 0.5, textAlign: 'right', fontWeight: 'bold' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                <div style={{ padding: '2rem', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '15px' }}>
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Type your reply to ${selectedConvo.name.split(' ')[0]}...`}
                      style={{ flex: 1, padding: '1.25rem 1.5rem', borderRadius: '16px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s', backgroundColor: '#f8fafc' }}
                      onFocus={(e) => e.target.style.borderColor = navy}
                      onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      style={{ backgroundColor: navy, color: 'white', border: 'none', padding: '0 2.5rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', opacity: newMessage.trim() ? 1 : 0.6, fontSize: '1rem', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      Send <Send size={20} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                 <div style={{ background: '#f8fafc', padding: '3rem', borderRadius: '50%', marginBottom: '2rem' }}>
                   <MessageSquare size={80} style={{ opacity: 0.1 }} />
                 </div>
                 <h3 style={{ color: navy, fontSize: '1.5rem', margin: '0 0 10px 0', fontFamily: 'serif' }}>Patient Care Center</h3>
                 <p style={{ fontSize: '1.1rem' }}>Select a patient conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
