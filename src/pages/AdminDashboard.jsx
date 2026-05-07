import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, Plus, Trash2, LogOut, Video, Sparkles, LayoutDashboard, MessageSquare, Send, CheckCircle, Edit2, X, Bell, Image } from 'lucide-react';
import { dataService, toYouTubeEmbed } from '../services/dataService';
import { supabase } from '../utils/supabaseClient';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: '2rem' }}><h1>Nimadir xato ketdi.</h1><pre>{this.state.error.toString()}</pre></div>;
    }
    return this.props.children;
  }
}

const AdminDashboardInner = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({ visitors: 0, todayVisits: 0, sales: 0, courseSales: {}, dailyVisits: {} });
  const [prompts, setPrompts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userThreads, setUserThreads] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [readStatus, setReadStatus] = useState(() => JSON.parse(localStorage.getItem('admin_read_status') || '{}'));
  const prevMessageCount = useRef(0);
  const messagesEndRef = useRef(null);
  const [payments, setPayments] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);

  // Form states
  const [newPrompt, setNewPrompt] = useState({ title: '', category: '', prompt: '', image: '', isFree: false });
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', duration: '', price: '', discountPrice: '', description: '', features: '', videoCount: 0 });
  const [editingCourse, setEditingCourse] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [newVideo, setNewVideo] = useState({ title: '', url: '' });

  const loadDashboardData = async () => {
    const s = await dataService.getStats();
    setStats(s || { visitors: 0, todayVisits: 0, sales: 0, courseSales: {}, dailyVisits: {} });
    setPrompts(dataService.getPrompts() || []);
    setCourses(dataService.getCourses() || []);
    setPricingPlans(dataService.getPricingPlans() || []);
    
    const allMsgs = dataService.getMessages() || [];
    setMessages(allMsgs);
    setUserThreads(dataService.getAllUserThreads() || []);

    try {
      if (supabase) {
        const { data, error } = await supabase.from('payment_requests').select('*').order('created_at', { ascending: true });
        if (data && !error) {
          const mapped = data.map(item => ({
            id: item.id,
            userId: item.user_id,
            userName: item.user_name,
            itemId: item.item_id,
            itemTitle: item.item_title,
            itemPrice: item.item_price,
            itemType: item.item_type,
            receiptImage: item.receipt_image,
            status: item.status,
            time: new Date(item.created_at).toLocaleString()
          }));
          setPayments(mapped);
          localStorage.setItem('payment_requests', JSON.stringify(mapped));
        } else {
          const storedPayments = localStorage.getItem('payment_requests');
          setPayments(storedPayments ? JSON.parse(storedPayments) : []);
        }
      } else {
        const storedPayments = localStorage.getItem('payment_requests');
        setPayments(storedPayments ? JSON.parse(storedPayments) : []);
      }
    } catch (err) {
      const storedPayments = localStorage.getItem('payment_requests');
      setPayments(storedPayments ? JSON.parse(storedPayments) : []);
    }

    // Notification Logic
    if (prevMessageCount.current > 0 && allMsgs.length > prevMessageCount.current) {
      // Only notify if the new message is from a user (not admin reply)
      const lastMsg = allMsgs[allMsgs.length - 1];
      if (!lastMsg.isAdmin) {
        setHasNewMessages(true);
        // Play subtle sound if browser allows
        try { new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play(); } catch(e){}
      }
    }
    prevMessageCount.current = allMsgs.length;
  };

  useEffect(() => {
    if (!sessionStorage.getItem('admin_auth')) {
      navigate('/secret-admin');
      return;
    }
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 4000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'messages') setHasNewMessages(false);
  }, [activeTab]);

  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      const userMsgs = messages.filter(m => m.userId === selectedUserId || (m.isAdmin && m.targetUserId === selectedUserId));
      if (userMsgs.length > 0) {
        const lastMsgId = userMsgs[userMsgs.length - 1].id;
        if (readStatus[selectedUserId] !== lastMsgId) {
          const newStatus = { ...readStatus, [selectedUserId]: lastMsgId };
          setReadStatus(newStatus);
          localStorage.setItem('admin_read_status', JSON.stringify(newStatus));
        }
      }
    }
  }, [selectedUserId, messages]);

  // Auto-scroll disabled per user request
  /*
  // Foydalanuvchi tanlanganda — momentan scroll (animation yo'q)
  useEffect(() => {
    if (selectedUserId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [selectedUserId]);

  // Yangi xabar kelganda — tabiiy smooth scroll
  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  */

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/');
  };

  const handleAddPrompt = (e) => {
    e.preventDefault();
    dataService.addPrompt(newPrompt);
    setNewPrompt({ title: '', category: '', prompt: '', image: '', isFree: false });
    loadDashboardData();
  };

  const handleUpdatePrompt = (e) => {
    e.preventDefault();
    dataService.updatePrompt(editingPrompt.id, editingPrompt);
    setEditingPrompt(null);
    loadDashboardData();
  };

  const handlePromptImageUpload = (e, isEditing) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing) {
          setEditingPrompt({ ...editingPrompt, image: reader.result });
        } else {
          setNewPrompt({ ...newPrompt, image: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePrompt = (id) => {
    dataService.deletePrompt(id);
    loadDashboardData();
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    const courseToAdd = {
      ...newCourse,
      features: newCourse.features.split('\n').filter(f => f.trim() !== '')
    };
    dataService.addCourse(courseToAdd);
    setNewCourse({ title: '', duration: '', price: '', discountPrice: '', description: '', features: '', videoCount: 0 });
    loadDashboardData();
  };

  const handleUpdateCourse = (e) => {
    e.preventDefault();
    const updated = {
      ...editingCourse,
      features: Array.isArray(editingCourse.features) ? editingCourse.features : editingCourse.features.split('\n').filter(f => f.trim() !== '')
    };
    dataService.updateCourse(editingCourse.id, updated);
    setEditingCourse(null);
    loadDashboardData();
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    if (!newVideo.title.trim() || !newVideo.url.trim()) return;
    const video = { id: `vid-${Date.now()}`, title: newVideo.title, url: toYouTubeEmbed(newVideo.url) };
    const updatedVideos = [...(editingCourse.videos || []), video];
    setEditingCourse({ ...editingCourse, videos: updatedVideos });
    setNewVideo({ title: '', url: '' });
  };

  const handleDeleteVideo = (videoId) => {
    const updatedVideos = (editingCourse.videos || []).filter(v => v.id !== videoId);
    setEditingCourse({ ...editingCourse, videos: updatedVideos });
  };

  const handleMoveVideo = (videoId, direction) => {
    const videos = [...(editingCourse.videos || [])];
    const idx = videos.findIndex(v => v.id === videoId);
    if (direction === 'up' && idx > 0) [videos[idx - 1], videos[idx]] = [videos[idx], videos[idx - 1]];
    else if (direction === 'down' && idx < videos.length - 1) [videos[idx], videos[idx + 1]] = [videos[idx + 1], videos[idx]];
    setEditingCourse({ ...editingCourse, videos });
  };

  const handleDeleteCourse = (id) => {
    if (confirm('Aniq o\'chirasizmi?')) {
      dataService.deleteCourse(id);
      loadDashboardData();
    }
  };

  const handleReplyMessage = (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedUserId) return;
    dataService.addMessage(replyInput, true, selectedUserId, 'Admin');
    setReplyInput('');
    loadDashboardData();
  };

  const handleApprovePayment = async (id) => {
    const stored = localStorage.getItem('payment_requests');
    const list = stored ? JSON.parse(stored) : [];
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index].status = 'approved';
      localStorage.setItem('payment_requests', JSON.stringify(list));
      
      const item = list[index];
      localStorage.setItem(`purchased_${item.itemId}`, 'true');
      localStorage.setItem(`purchased_${item.itemId}_at`, Date.now().toString());
      localStorage.setItem(`payment_status_${item.itemId}`, 'approved');
      
      if (item.itemType === 'prompt') {
        localStorage.setItem('hasPurchasedPrompts', 'true');
      }
      
      dataService.registerSale(item.itemType === 'course' ? item.itemId : null);

      try {
        if (supabase) {
          await supabase.from('payment_requests').update({ status: 'approved' }).eq('id', id);
        }
      } catch (dbErr) {
        console.warn("Could not sync approval to Supabase:", dbErr);
      }

      loadDashboardData();
    }
  };

  const handleRejectPayment = async (id) => {
    if (confirm("Ushbu to'lovni rad etishni xohlaysizmi?")) {
      const stored = localStorage.getItem('payment_requests');
      const list = stored ? JSON.parse(stored) : [];
      const index = list.findIndex(p => p.id === id);
      if (index !== -1) {
        list[index].status = 'rejected';
        localStorage.setItem('payment_requests', JSON.stringify(list));
        
        const item = list[index];
        localStorage.removeItem(`purchased_${item.itemId}`);
        localStorage.setItem(`payment_status_${item.itemId}`, 'rejected');

        try {
          if (supabase) {
            await supabase.from('payment_requests').update({ status: 'rejected' }).eq('id', id);
          }
        } catch (dbErr) {
          console.warn("Could not sync rejection to Supabase:", dbErr);
        }
        
        loadDashboardData();
      }
    }
  };

  const tabStyle = (tab) => ({
    padding: '0.75rem 1.5rem',
    background: activeTab === tab ? 'var(--card-bg-hover)' : 'transparent',
    color: activeTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
    border: 'none', borderRadius: '12px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600,
    transition: 'all 0.2s', whiteSpace: 'nowrap', position: 'relative'
  });

  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '8px',
    background: 'var(--bg-color)', border: '1px solid var(--border-color)',
    color: 'var(--text-main)', marginBottom: '1rem', fontFamily: 'inherit'
  };

  const selectedMessages = selectedUserId
    ? (messages || []).filter(m => m.userId === selectedUserId || (m.isAdmin && m.targetUserId === selectedUserId) || (m.isAdmin && m.userId === 'system'))
    : [];

  const totalUnreadCount = userThreads.filter(t => {
    const lastMsg = t.messages[t.messages.length - 1];
    return lastMsg && !lastMsg.isAdmin && readStatus[t.userId] !== lastMsg.id;
  }).length;

  return (
    <div className="bento-wrapper" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LayoutDashboard color="var(--accent)" /> Admin Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           {hasNewMessages && (
             <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>
               <Bell size={20} /> Yangi xabar!
             </motion.div>
           )}
           <button onClick={handleLogout} className="submit-form-btn" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
             <LogOut size={16} /> Chiqish
           </button>
        </div>
      </div>

      <div className="bento-box" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', flexDirection: 'row', gap: '1rem', overflowX: 'auto' }}>
        <button style={tabStyle('stats')} onClick={() => setActiveTab('stats')}>
          <LayoutDashboard size={18} /> Statistika
        </button>
        <button style={tabStyle('messages')} onClick={() => setActiveTab('messages')}>
          <MessageSquare size={18} /> Xabarlar
          {(hasNewMessages || totalUnreadCount > 0) && <span style={{ position: 'absolute', top: '0.2rem', right: '0.2rem', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid var(--card-bg)' }} />}
        </button>
        <button style={tabStyle('prompts')} onClick={() => setActiveTab('prompts')}>
          <Sparkles size={18} /> Promtlar
        </button>
        <button style={tabStyle('pricing')} onClick={() => setActiveTab('pricing')}>
          <CreditCard size={18} /> Tariflar
        </button>
        <button style={tabStyle('courses')} onClick={() => setActiveTab('courses')}>
          <Video size={18} /> Kurslar
        </button>
        <button style={tabStyle('payments')} onClick={() => setActiveTab('payments')}>
          <CreditCard size={18} /> To'lovlar
          {payments.filter(p => p.status === 'pending').length > 0 && (
            <span style={{ position: 'absolute', top: '0.2rem', right: '0.2rem', width: '18px', height: '18px', background: '#ef4444', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>
              {payments.filter(p => p.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="bento-box" style={{ padding: '2rem', borderTop: '4px solid #5a6bfa' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Bugungi Tashriflar</h3>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.todayVisits || 0}</div>
              </div>
              <div className="bento-box" style={{ padding: '2rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Umumiy Tashriflar</h3>
                <div style={{ fontSize: '3rem', fontWeight: 800 }}>{stats.visitors || 0}</div>
              </div>
              <div className="bento-box" style={{ padding: '2rem', borderTop: '4px solid #f59e0b' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Ro'yxatdan O'tganlar</h3>
                <div style={{ fontSize: '3rem', fontWeight: 800 }}>{stats.registeredUsers || 0}</div>
              </div>
              <div className="bento-box" style={{ padding: '2rem', borderTop: '4px solid #22c55e' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Sotilgan Kurslar</h3>
                <div style={{ fontSize: '3rem', fontWeight: 800 }}>{stats.sales || 0}</div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ gridTemplateColumns: '280px 1fr', display: 'grid', gap: '1.5rem', height: '640px' }}>
              <div className="bento-box" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="var(--accent)" /> Foydalanuvchilar ({userThreads.length})
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {userThreads.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.88rem' }}>Hali xabar yo'q.</p>}
                  {userThreads.map(thread => {
                    const lastMsg = thread.messages[thread.messages.length - 1];
                    const hasUnread = lastMsg && !lastMsg.isAdmin && readStatus[thread.userId] !== lastMsg.id;

                    return (
                      <button
                        key={thread.userId}
                        onClick={() => setSelectedUserId(thread.userId)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '1rem 1.25rem',
                          background: selectedUserId === thread.userId ? 'rgba(90,107,250,0.1)' : 'transparent',
                          border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
                          borderLeft: selectedUserId === thread.userId ? '3px solid var(--accent)' : '3px solid transparent'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{thread.userName}</span>
                          {hasUnread && <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', flexShrink: 0 }}></span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: hasUnread ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: hasUnread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lastMsg?.text}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bento-box" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {!selectedUserId ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem' }}>
                    <MessageSquare size={48} style={{ opacity: 0.15 }} /><p>Foydalanuvchini tanlang</p>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{(userThreads.find(t => t.userId === selectedUserId)?.userName || 'U')[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{userThreads.find(t => t.userId === selectedUserId)?.userName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedUserId}</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedMessages.map(msg => (
                        <div key={msg.id} style={{ alignSelf: msg.isAdmin ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textAlign: msg.isAdmin ? 'right' : 'left' }}>{msg.isAdmin ? 'Siz (Admin)' : msg.userName} • {msg.time}</div>
                          <div style={{ background: msg.isAdmin ? 'var(--accent)' : 'var(--card-bg-hover)', color: msg.isAdmin ? 'white' : 'var(--text-main)', padding: '0.85rem 1rem', borderRadius: '12px', border: msg.isAdmin ? 'none' : '1px solid var(--border-color)', fontSize: '0.9rem' }}>{msg.text}</div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                      <form onSubmit={handleReplyMessage} style={{ display: 'flex', gap: '0.75rem' }}>
                        <input type="text" placeholder="Javob yozish..." value={replyInput} onChange={e => setReplyInput(e.target.value)} style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
                        <button type="submit" className="submit-form-btn" style={{ padding: '0 1.25rem' }}>Yuborish</button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'prompts' && (
          <motion.div key="prompts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
            <div className="bento-box" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '1rem' }}>
              {editingPrompt ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Edit2 size={20} color="var(--accent)" /> Promtni tahrirlash
                    </h3>
                    <button onClick={() => setEditingPrompt(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleUpdatePrompt}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Kategoriya</label>
                    <input placeholder="Kategoriya (masalan: Restoration)" style={inputStyle} value={editingPrompt.category} onChange={e => setEditingPrompt({...editingPrompt, category: e.target.value})} required />
                    
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Sarlavha</label>
                    <input placeholder="Sarlavha" style={inputStyle} value={editingPrompt.title} onChange={e => setEditingPrompt({...editingPrompt, title: e.target.value})} required />
                    
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Promt matni</label>
                    <textarea placeholder="Promt matni..." rows="5" style={{ ...inputStyle, resize: 'vertical' }} value={editingPrompt.prompt} onChange={e => setEditingPrompt({...editingPrompt, prompt: e.target.value})} required />
                    
                    <div style={{ marginBottom: '1.5rem', background: 'var(--card-bg-hover)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input type="checkbox" id="edit-isfree" checked={editingPrompt.isFree} onChange={e => setEditingPrompt({...editingPrompt, isFree: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        <label htmlFor="edit-isfree" style={{ color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>Bepul promt (Hamma uchun ochiq)</label>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rasm biriktirish (Tavsiya: 1024x1024 px yoki 16:9, Max: 5MB)</label>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <input type="file" id="edit-prompt-file" accept="image/*" onChange={(e) => handlePromptImageUpload(e, true)} style={{ display: 'none' }} />
                          <label htmlFor="edit-prompt-file" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--card-bg-hover)', border: '1px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                             <Plus size={16} /> Rasm
                          </label>
                        </div>
                        {editingPrompt.image && (
                          <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                            <img src={editingPrompt.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                            <button type="button" onClick={() => setEditingPrompt({...editingPrompt, image: ''})} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="submit-form-btn" style={{ flex: 1, background: '#22c55e', fontSize: '0.85rem', padding: '0.6rem' }}>Saqlash</button>
                      <button type="button" onClick={() => setEditingPrompt(null)} className="submit-form-btn" style={{ background: 'var(--card-bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.85rem', padding: '0.6rem' }}>Bekor qilish</button>
                    </div>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleAddPrompt}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} color="var(--accent)" /> Yangi Promt
                  </h3>
                  <input placeholder="Kategoriya (masalan: Restoration)" style={inputStyle} value={newPrompt.category} onChange={e => setNewPrompt({...newPrompt, category: e.target.value})} required />
                  <input placeholder="Sarlavha" style={inputStyle} value={newPrompt.title} onChange={e => setNewPrompt({...newPrompt, title: e.target.value})} required />
                  <textarea placeholder="Promt matni..." rows="4" style={{ ...inputStyle, resize: 'vertical' }} value={newPrompt.prompt} onChange={e => setNewPrompt({...newPrompt, prompt: e.target.value})} required />
                  
                  <div style={{ marginBottom: '1.5rem', background: 'var(--card-bg-hover)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input type="checkbox" id="new-isfree" checked={newPrompt.isFree} onChange={e => setNewPrompt({...newPrompt, isFree: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      <label htmlFor="new-isfree" style={{ color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>Bepul promt</label>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rasm biriktirish (Tavsiya: 1024x1024 px yoki 16:9, Max: 5MB)</label>
                    <input type="file" id="new-prompt-file" accept="image/*" onChange={(e) => handlePromptImageUpload(e, false)} style={{ display: 'none' }} />
                    <label htmlFor="new-prompt-file" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--card-bg-hover)', border: '1px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                       <Plus size={16} /> Rasm tanlash
                    </label>
                    {newPrompt.image && <img src={newPrompt.image} alt="Preview" style={{ marginTop: '0.75rem', maxHeight: '100px', width: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />}
                  </div>
                  
                  <button type="submit" className="submit-form-btn" style={{ width: '100%' }}>Qo'shish</button>
                </form>
              )}
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Mavjud promtlar ({prompts.length})</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>3 ta ustunli ko'rinish</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', alignContent: 'start', maxHeight: '800px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {prompts.length === 0 && <div style={{ gridColumn: 'span 3', color: 'var(--text-muted)', textAlign: 'center', padding: '4rem' }}>Hali promtlar yo'q.</div>}
                {prompts.map(p => (
                  <div key={p.id} className="bento-box" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: editingPrompt?.id === p.id ? '2px solid var(--accent)' : '1px solid var(--border-color)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                    {p.image ? (
                      <img src={p.image} alt={p.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '100%', height: '120px', background: 'var(--card-bg-hover)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><Sparkles size={24} /></div>
                    )}
                    
                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.3rem' }}>
                      <button onClick={() => { setEditingPrompt(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} title="Tahrirlash" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}><Edit2 size={14} /></button>
                      <button onClick={() => handleDeletePrompt(p.id)} title="O'chirish" style={{ background: 'rgba(239, 68, 68, 0.8)', backdropFilter: 'blur(4px)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}><Trash2 size={14} /></button>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.65rem', color: p.isFree ? '#22c55e' : 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
                        {p.category} {p.isFree && '• Bepul'}
                      </div>
                      <h4 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }} title={p.title}>{p.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'pricing' && (
          <motion.div key="pricing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
              {pricingPlans.map(plan => (
                <div key={plan.id} className="bento-box" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CreditCard color={plan.color} /> {plan.title} Tarifini Tahrirlash
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Tarif nomi</label>
                      <input 
                        style={inputStyle} 
                        value={plan.title} 
                        onChange={e => {
                          const updatedVal = e.target.value;
                          const updatedPlans = pricingPlans.map(p => p.id === plan.id ? { ...p, title: updatedVal } : p);
                          setPricingPlans(updatedPlans);
                          dataService.updatePricingPlan(plan.id, { title: updatedVal });
                        }} 
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Asosiy narx ($)</label>
                        <input 
                          style={inputStyle} 
                          value={plan.price} 
                          onChange={e => {
                            const updatedVal = e.target.value;
                            const updatedPlans = pricingPlans.map(p => p.id === plan.id ? { ...p, price: updatedVal } : p);
                            setPricingPlans(updatedPlans);
                            dataService.updatePricingPlan(plan.id, { price: updatedVal });
                          }} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Chegirma narxi ($)</label>
                        <input 
                          style={inputStyle} 
                          placeholder="Bo'sh qoldiring"
                          value={plan.discountPrice || ''} 
                          onChange={e => {
                            const updatedVal = e.target.value;
                            const updatedPlans = pricingPlans.map(p => p.id === plan.id ? { ...p, discountPrice: updatedVal } : p);
                            setPricingPlans(updatedPlans);
                            dataService.updatePricingPlan(plan.id, { discountPrice: updatedVal });
                          }} 
                        />
                      </div>
                    </div>

                    <div style={{ background: 'var(--card-bg-hover)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent)' }}>Preview (Ko'rinishi)</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                        ${plan.discountPrice || plan.price} 
                        {plan.discountPrice && <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', marginLeft: '0.5rem', opacity: 0.5 }}>${plan.price}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { loadDashboardData(); alert("Tarif saqlandi!"); }}
                    className="submit-form-btn" 
                    style={{ width: '100%', marginTop: '1.5rem', background: '#22c55e' }}
                  >
                    O'zgarishlarni Tasdiqlash
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'courses' && (
          <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="bento-box" style={{ padding: '2rem' }}>
              {editingCourse ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Kursni tahrirlash</h3>
                    <button onClick={() => setEditingCourse(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                  </div>
                  
                  <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kurs nomi</label>
                    <input style={inputStyle} value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Davomiyligi</label>
                        <input style={inputStyle} value={editingCourse.duration} onChange={e => setEditingCourse({...editingCourse, duration: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Narxi (UZS)</label>
                        <input style={inputStyle} value={editingCourse.price} onChange={e => setEditingCourse({...editingCourse, price: e.target.value})} />
                      </div>
                    </div>

                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chegirma narxi (ixtiyoriy)</label>
                    <input style={inputStyle} value={editingCourse.discountPrice || ''} onChange={e => setEditingCourse({...editingCourse, discountPrice: e.target.value})} />

                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tavsif</label>
                    <textarea style={inputStyle} rows="3" value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} />

                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Xususiyatlar (har bir qator bitta)</label>
                    <textarea 
                      style={inputStyle} 
                      rows="4" 
                      value={Array.isArray(editingCourse.features) ? editingCourse.features.join('\n') : editingCourse.features} 
                      onChange={e => setEditingCourse({...editingCourse, features: e.target.value})} 
                    />

                    <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                      <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Video size={18} color="var(--accent)" /> Videolar ({editingCourse.videos?.length || 0})
                      </h4>
                      
                      <div style={{ background: 'var(--card-bg-hover)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                        <input placeholder="Video sarlavhasi" style={{ ...inputStyle, marginBottom: '0.5rem' }} value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} />
                        <input placeholder="YouTube URL" style={{ ...inputStyle, marginBottom: '1rem' }} value={newVideo.url} onChange={e => setNewVideo({...newVideo, url: e.target.value})} />
                        <button onClick={handleAddVideo} className="submit-form-btn" style={{ width: '100%', fontSize: '0.8rem' }}>Video qo'shish</button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(editingCourse.videos || []).map((v, i) => (
                          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '20px' }}>{i + 1}.</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button onClick={() => handleMoveVideo(v.id, 'up')} disabled={i === 0} style={{ padding: '0.25rem', background: 'none', border: 'none', color: i === 0 ? '#333' : '#888', cursor: i === 0 ? 'default' : 'pointer' }}>↑</button>
                              <button onClick={() => handleMoveVideo(v.id, 'down')} disabled={i === (editingCourse.videos?.length || 0) - 1} style={{ padding: '0.25rem', background: 'none', border: 'none', color: i === (editingCourse.videos?.length || 0) - 1 ? '#333' : '#888', cursor: i === (editingCourse.videos?.length || 0) - 1 ? 'default' : 'pointer' }}>↓</button>
                              <button onClick={() => handleDeleteVideo(v.id)} style={{ padding: '0.25rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={handleUpdateCourse} className="submit-form-btn" style={{ width: '100%', background: '#22c55e', marginTop: '1rem' }}>Kursni Saqlash</button>
                </div>
              ) : (
                <form onSubmit={handleAddCourse}>
                  <h3>Yangi Kurs qo'shish</h3>
                  <input placeholder="Kurs nomi" style={inputStyle} value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input placeholder="Davomiyligi (masalan: 2 oy)" style={inputStyle} value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} required />
                    <input placeholder="Narxi (masalan: 700 000 UZS)" style={inputStyle} value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} required />
                  </div>
                  <textarea placeholder="Kurs tavsifi..." rows="3" style={inputStyle} value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required />
                  <textarea placeholder="Xususiyatlar (har bir qator bitta)..." rows="4" style={inputStyle} value={newCourse.features} onChange={e => setNewCourse({...newCourse, features: e.target.value})} required />
                  <button type="submit" className="submit-form-btn" style={{ width: '100%' }}>Kursni yaratish</button>
                </form>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '700px', overflowY: 'auto' }}>
              <div style={{ padding: '0.5rem 0', fontWeight: 700, fontSize: '1.1rem' }}>Mavjud kurslar ({courses.length})</div>
              {courses.map(c => (
                <div key={c.id} className="bento-box" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {c.duration} • {c.price} • {c.videos?.length || 0} ta video
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button onClick={() => setEditingCourse(c)} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteCourse(c.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'payments' && (
          <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>Karta orqali To'lov So'rovlari</h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: 'var(--card-bg-hover)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                Kutilmoqda: {payments.filter(p => p.status === 'pending').length} ta
              </span>
            </div>

            <div style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem' }}>Foydalanuvchi</th>
                    <th style={{ padding: '1rem' }}>Mahsulot</th>
                    <th style={{ padding: '1rem' }}>Narxi</th>
                    <th style={{ padding: '1rem' }}>Chek / Kvitansiya</th>
                    <th style={{ padding: '1rem' }}>Sana/Vaqt</th>
                    <th style={{ padding: '1rem' }}>Holati</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Hozircha hech qanday to'lov so'rovi mavjud emas.</td>
                    </tr>
                  ) : (
                    [...payments].reverse().map(pay => (
                      <tr key={pay.id} style={{ borderBottom: '1px solid var(--border-color)', background: pay.status === 'pending' ? 'rgba(90, 107, 250, 0.02)' : 'transparent', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{pay.userName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{pay.userId}</div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{pay.itemTitle}</td>
                        <td style={{ padding: '1rem', color: 'var(--accent)', fontWeight: 800 }}>{pay.itemPrice}</td>
                        <td style={{ padding: '1rem' }}>
                          {pay.receiptImage ? (
                            <a href={pay.receiptImage} download={`chek-${pay.id}.png`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                              <Image size={14} /> Chekni yuklash / ko'rish
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Yuklanmagan</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{pay.time}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.3rem 0.75rem', 
                            borderRadius: '999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 800,
                            background: pay.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : pay.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: pay.status === 'approved' ? '#22c55e' : pay.status === 'rejected' ? '#ef4444' : '#f59e0b'
                          }}>
                            {pay.status === 'approved' ? 'Tasdiqlangan' : pay.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {pay.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button 
                                onClick={() => handleApprovePayment(pay.id)}
                                style={{ background: '#22c55e', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                                onMouseOut={e => e.currentTarget.style.filter = 'none'}
                              >
                                Tasdiqlash
                              </button>
                              <button 
                                onClick={() => handleRejectPayment(pay.id)}
                                style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                                onMouseOut={e => e.currentTarget.style.filter = 'none'}
                              >
                                Rad etish
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Bajarildi</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminDashboard = () => (
  <ErrorBoundary>
    <AdminDashboardInner />
  </ErrorBoundary>
);

export default AdminDashboard;
