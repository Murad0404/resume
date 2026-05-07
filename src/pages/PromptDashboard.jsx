import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, CheckCircle, Sparkles, Layout, LogOut, ArrowLeft, Download, User, CreditCard, Plus, Trash2, BarChart, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { otpService } from '../services/otpService';
import { useLanguage } from '../contexts/LanguageContext';

const PromptDashboard = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [prompts, setPrompts] = useState([]);
  const [activeTab, setActiveTab] = useState('prompts'); // 'prompts' | 'profile'
  const [activeCategory, setActiveCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [session, setSession] = useState(() => otpService.getSession());

  useEffect(() => {
    // Check access
    const hasAccess = localStorage.getItem('hasPurchasedPrompts') === 'true';
    if (!hasAccess && !session) {
      navigate('/prompts');
      return;
    }
    setPrompts(dataService.getPrompts() || []);
  }, [navigate, session]);

  const categories = ['Barchasi', ...new Set(prompts.map(p => p.category))];

  const filteredPrompts = prompts.filter(p => {
    const matchesCategory = activeCategory === 'Barchasi' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    otpService.clearSession();
    navigate('/prompts');
  };

  // Profile Stats
  const purchasedModules = dataService.getCourses()
      .map(c => c.id)
      .filter(id => localStorage.getItem(`purchased_${id}`) === 'true');
  const completedVideos = JSON.parse(localStorage.getItem(`completed_vids_${session?.contact}`) || '[]');
  const courses = dataService.getCourses();
  const totalPurchasedVideos = courses
    .filter(c => purchasedModules.includes(c.id))
    .reduce((acc, c) => acc + (c.videos?.length || 0), 0);
  const completedCount = completedVideos.length;
  const progressPercent = totalPurchasedVideos > 0 ? Math.round((completedCount / totalPurchasedVideos) * 100) : 0;

  return (
    <div className="page-container" style={{ background: '#050505', minHeight: '100vh', color: '#fff' }}>
      <div className="bento-wrapper" style={{ paddingTop: '2rem' }}>
        
        {/* Header with Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setActiveTab('prompts')}
              style={{ padding: '0.7rem 1.4rem', borderRadius: '14px', border: 'none', background: activeTab === 'prompts' ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Layout size={18} /> {lang === 'uz' ? 'Promtlar' : lang === 'ru' ? 'Промпты' : 'Prompts'}
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{ padding: '0.7rem 1.4rem', borderRadius: '14px', border: 'none', background: activeTab === 'profile' ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <User size={18} /> {lang === 'uz' ? 'Profil' : lang === 'ru' ? 'Профиль' : 'Profile'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/prompts')} className="nav-cta" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ArrowLeft size={18} /> {lang === 'uz' ? 'Orqaga' : lang === 'ru' ? 'Назад' : 'Back'}
            </button>
            <button onClick={handleLogout} className="nav-cta" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <LogOut size={18} /> {lang === 'uz' ? 'Chiqish' : lang === 'ru' ? 'Выход' : 'Logout'}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'prompts' ? (
            <motion.div key="prompts" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Search & Filter Bar */}
              <div className="bento-box" style={{ padding: '2rem', marginBottom: '3rem', background: 'rgba(20, 20, 25, 0.9)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 30px rgba(139, 92, 246, 0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{lang === 'uz' ? 'Professional Promt Qidiruvi' : lang === 'ru' ? 'Профессиональный поиск промптов' : 'Professional Prompt Search'}</h2>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>{lang === 'uz' ? 'Minglab yuqori sifatli promtlar ichidan keraklisini toping' : lang === 'ru' ? 'Найдите то, что вам нужно, среди тысяч качественных промптов' : 'Find what you need among thousands of high-quality prompts'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={20} color="var(--accent)" />
                    </div>
                    <input 
                      type="text" 
                      placeholder={lang === 'uz' ? 'Nima yaratmoqchisiz? (masalan: Cinematic portrait...)' : lang === 'ru' ? 'Что вы хотите создать? (например: Cinematic portrait...)' : 'What do you want to create? (e.g. Cinematic portrait...)'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', borderRadius: '16px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.5rem', justifyContent: 'center' }}>
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)}
                      style={{ 
                        padding: '0.7rem 1.4rem', 
                        borderRadius: '12px', 
                        border: '1px solid',
                        borderColor: activeCategory === cat ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                        background: activeCategory === cat ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                        color: activeCategory === cat ? 'var(--accent)' : '#888',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'all 0.3s'
                      }}
                    >
                      {cat === 'Barchasi' ? (lang === 'uz' ? 'Barchasi' : lang === 'ru' ? 'Все' : 'All') : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {filteredPrompts.map((p, idx) => (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bento-box"
                    style={{ padding: 0, overflow: 'hidden', background: 'rgba(15, 15, 20, 0.9)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}
                  >
                    {p.image && (
                      <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                        <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', backdropFilter: 'blur(4px)' }}>
                          {p.category}
                        </div>
                      </div>
                    )}
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={18} color="var(--accent)" /> {p.title}
                      </h3>
                      <div style={{ position: 'relative', background: '#0a0a0c', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                          "{p.prompt}"
                        </p>
                        <button 
                          onClick={() => handleCopy(p.prompt, p.id)}
                          style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: copiedId === p.id ? '#22c55e' : '#666' }}
                        >
                          {copiedId === p.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '0.75rem', color: '#555' }}>ID: {p.id}</span>
                         <button onClick={() => handleCopy(p.prompt, p.id)} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {copiedId === p.id 
                              ? (lang === 'uz' ? 'Nusxalandi' : lang === 'ru' ? 'Скопировано' : 'Copied') 
                              : (lang === 'uz' ? 'Nusxa olish' : lang === 'ru' ? 'Копировать' : 'Copy')} <Copy size={14} />
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredPrompts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '5rem 0', color: '#666' }}>
                  <Search size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                  <p>{lang === 'uz' ? 'Hech qanday promt topilmadi.' : lang === 'ru' ? 'Промпты не найдены.' : 'No prompts found.'}</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Profile Tab */
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem', paddingBottom: '4rem' }}>
              
              {/* Left Sidebar: User Info & Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(20, 20, 25, 0.9)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', padding: '3rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)', opacity: 0.1 }} />
                  
                  <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--accent)', margin: '0 auto 1.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '3rem', fontWeight: 800, border: '4px solid #0a0a0c', position: 'relative', zIndex: 1, boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                    {session?.name ? session.name[0].toUpperCase() : 'U'}
                  </div>
                  <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem', color: '#fff' }}>{session?.name || (lang === 'uz' ? 'Foydalanuvchi' : lang === 'ru' ? 'Пользователь' : 'User')}</h2>
                  <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '1rem' }}>{session?.contact}</p>
                  
                  <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                        <span style={{ fontWeight: 600, color: '#888' }}>{lang === 'uz' ? "Kurslarni o'zlashtirish" : lang === 'ru' ? 'Прогресс курсов' : 'Courses progress'}</span>
                        <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{progressPercent}%</span>
                      </div>
                      <div style={{ height: 10, background: '#000', borderRadius: '5px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #3b82f6)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ background: '#000', padding: '1.25rem', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <CheckCircle size={24} color="#22c55e" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{completedCount}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>{lang === 'uz' ? 'Darslar' : lang === 'ru' ? 'Уроки' : 'Lessons'}</div>
                      </div>
                      <div style={{ background: '#000', padding: '1.25rem', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Sparkles size={24} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{prompts.length}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>{lang === 'uz' ? 'Promtlar' : lang === 'ru' ? 'Промпты' : 'Prompts'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s' }}
                >
                  <LogOut size={20} /> {lang === 'uz' ? 'Akkauntdan chiqish' : lang === 'ru' ? 'Выйти из аккаунта' : 'Logout from account'}
                </button>
              </div>

              {/* Right Content: Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: 'rgba(20, 20, 25, 0.9)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', color: '#fff' }}>
                      <CreditCard size={24} color="var(--accent)" /> {lang === 'uz' ? "To'lov kartalari" : lang === 'ru' ? 'Платежные карты' : 'Payment cards'}
                    </h3>
                    <button 
                      onClick={() => alert(lang === 'uz' ? "Yangi karta qo'shish uchun xarid jarayonidan o'ting." : lang === 'ru' ? 'Чтобы добавить новую карту, пройдите процесс покупки.' : 'To add a new card, go through the purchase process.')}
                      style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Plus size={18} /> {lang === 'uz' ? "Qo'shish" : lang === 'ru' ? 'Добавить' : 'Add'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {dataService.getCards().map(card => (
                      <motion.div 
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ 
                          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                          padding: '1.75rem', 
                          borderRadius: '24px', 
                          color: '#fff',
                          position: 'relative',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                          <div style={{ width: 50, height: 35, background: 'rgba(255,255,255,0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <CreditCard size={24} />
                          </div>
                          <button 
                            onClick={() => {
                              if(confirm(lang === 'uz' ? "Kartani o'chirishni xohlaysizmi?" : lang === 'ru' ? 'Вы хотите удалить карту?' : 'Do you want to delete the card?')) {
                                dataService.deleteCard(card.id);
                                navigate(0); // Simple refresh
                              }
                            }}
                            style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div style={{ fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 600, marginBottom: '1.5rem' }}>
                          **** **** **** {card.number.slice(-4)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{lang === 'uz' ? 'Karta egasi' : lang === 'ru' ? 'Владелец карты' : 'Cardholder'}</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{card.holder}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{lang === 'uz' ? 'Muddati' : lang === 'ru' ? 'Срок' : 'Expiry'}</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{card.expiry}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {dataService.getCards().length === 0 && (
                      <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '3rem', color: '#666', background: '#000', borderRadius: '24px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                        {lang === 'uz' ? 'Saqlangan kartalar mavjud emas.' : lang === 'ru' ? 'Нет сохраненных карт.' : 'No saved cards available.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default PromptDashboard;
