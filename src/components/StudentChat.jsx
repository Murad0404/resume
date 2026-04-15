import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StudentChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, text: "Assalomu alaykum! Kursga xush kelibsiz. Tushunmagan joylaringiz bo'lsa shu yerda so'rashingiz mumkin.", isAdmin: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: input,
      isAdmin: false,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages([...messages, newMsg]);
    setInput('');

    // Simulate auto-reply for MVP
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Xabaringiz qabul qilindi. Tez orada javob beraman!",
        isAdmin: true,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <MessageSquare size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Murod Dadaboev</h3>
          <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>● Online (Support)</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexDirection: msg.isAdmin ? 'row' : 'row-reverse' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.isAdmin ? 'var(--card-bg-hover)' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {msg.isAdmin ? <span style={{ fontSize: '12px' }}>👨‍💻</span> : <UserIcon size={14} color="#fff" />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isAdmin ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
              <div style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: '12px', 
                background: msg.isAdmin ? 'var(--card-bg-hover)' : 'var(--accent)', 
                color: msg.isAdmin ? 'var(--text-main)' : '#fff',
                fontSize: '0.9rem',
                lineHeight: 1.4,
                borderBottomLeftRadius: msg.isAdmin ? 0 : '12px',
                borderBottomRightRadius: msg.isAdmin ? '12px' : 0
              }}>
                {msg.text}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Xabar yozing..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '999px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }}
          />
          <button type="submit" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <Send size={18} style={{ transform: 'translateX(-1px)' }} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentChat;
