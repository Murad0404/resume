import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { murodKnowledge } from '../utils/translations';

const AIChat = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (t?.ai?.intro && messages.length === 0) {
       setMessages([{ role: 'assistant', content: t.ai.intro }]);
    }
  }, [t, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1200);
  };

  const generateResponse = (query) => {
    const q = query.toLowerCase();

    // Startup / Faol
    if (q.includes('faol') || q.includes('startup') || q.includes('стартап') || q.includes('loyiha') || q.includes('project') || q.includes('проект')) {
      return t.ai.responses.faol;
    }
    // Backend / Java / development
    if (q.includes('backend') || q.includes('java') || q.includes('spring') || q.includes('api') || q.includes('dasturlash') || q.includes('разраб') || q.includes('kod') || q.includes('код')) {
      return t.ai.responses.backend;
    }
    // UI/UX design
    if (q.includes('dizayn') || q.includes('design') || q.includes('дизайн') || q.includes('figma') || q.includes('ui') || q.includes('ux') || q.includes('interface') || q.includes('интерфейс')) {
      return t.ai.responses.design;
    }
    // QA / testing
    if (q.includes('qa') || q.includes('test') || q.includes('тест') || q.includes('sifat') || q.includes('bug')) {
      return t.ai.responses.qa;
    }
    // Skills / technologies
    if (q.includes('skill') || q.includes('ko\'nikma') || q.includes('навык') || q.includes('texnologiya') || q.includes('технолог') || q.includes('tool') || q.includes('инструмент')) {
      return t.ai.responses.skills;
    }
    // Experience (general)
    if (q.includes('tajriba') || q.includes('experience') || q.includes('работ') || q.includes('опыт') || q.includes('ish tarixi') || q.includes('career') || q.includes('карьер')) {
      return t.ai.responses.experience;
    }
    // Languages spoken
    if (q.includes('til') || q.includes('lang') || q.includes('язык') || q.includes('ingliz') || q.includes('rus') || q.includes('o\'zbek') || q.includes('english') || q.includes('russian')) {
      return t.ai.responses.languages;
    }
    // Contact
    if (q.includes('contact') || q.includes('aloqa') || q.includes('kontakt') || q.includes('bog\'lan') || q.includes('связ') || q.includes('telegram') || q.includes('linkedin')) {
      return t.ai.responses.contact;
    }
    // Personal / who is Murod
    if (q.includes('qanday odam') || q.includes('kim') || q.includes('who') || q.includes('person') || q.includes('человек') || q.includes('haqida') || q.includes('о себе') || q.includes('муро') || q.includes('murod')) {
      return t.ai.responses.person;
    }
    // Education
    if (q.includes('ta\'lim') || q.includes('o\'qish') || q.includes('education') || q.includes('study') || q.includes('образовани') || q.includes('учеб') || q.includes('institut') || q.includes('kurs') || q.includes('курс') || q.includes('academy')) {
      return t.ai.responses.education;
    }
    // Interests / goals
    if (q.includes('qiziqish') || q.includes('interest') || q.includes('интерес') || q.includes('goal') || q.includes('maqsad') || q.includes('цель') || q.includes('rivojlan') || q.includes('развит') || q.includes('system design') || q.includes('microservice')) {
      return t.ai.responses.interests;
    }

    return t.ai.responses.default;
  };

  return (
    <div className="ai-chat-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="chat-header">
              <div className="header-info">
                <div className="ai-status">
                  <span className="pulse-dot"></span>
                </div>
                <div>
                  <h3>A.I. Nexus</h3>
                  <p>Murod's Digital Assistant</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="chat-messages" ref={scrollRef}>
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`message-wrapper ${m.role}`}
                >
                  {m.role === 'assistant' && (
                    <div className="message-icon">
                      <Sparkles size={16} />
                    </div>
                  )}
                  <div className={`message-bubble`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="message-wrapper assistant">
                  <div className="message-icon"><Sparkles size={16} /></div>
                  <div className="message-bubble typing-bubble">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input-area">
              <input 
                type="text" 
                placeholder={t.ai.placeholder} 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend} 
                disabled={!input.trim()}
                className={input.trim() ? 'active' : ''}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <MessageSquare />}
        {!isOpen && <span className="toggle-badge"></span>}
      </button>
    </div>
  );
};

export default AIChat;
