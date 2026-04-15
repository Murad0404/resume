import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Lock, Monitor, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import StudentChat from '../components/StudentChat';

const mockCourseData = {
  'module-1': {
    title: '1-Modul: AI Vositalar (Amaliy)',
    videos: [
      { id: 'v1', title: '1-Dars: AI ga kirish — qaysi vosita nima uchun?', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
      { id: 'v2', title: '2-Dars: AI bilan rasm generatsiya (Midjourney, DALL-E)', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
      { id: 'v3', title: '3-Dars: Stable Diffusion — bepul va mahalliy', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
      { id: 'v4', title: '4-Dars: AI bilan video generatsiya (Sora, Runway, Kling)', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
      { id: 'v5', title: '5-Dars: Eski foto va rasmlarni AI bilan tiklash', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
      { id: 'v6', title: '6-Dars: ChatGPT, Claude, Gemini — qaysi birini qachon ishlatish', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
    ]
  },
  'module-2': {
    title: '2-Modul: AI Bilan Dasturlash & Prompting',
    videos: [
      { id: 'v7', title: '1-Dars: AI bilan Frontend (React) loyiha qurish', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
      { id: 'v8', title: '2-Dars: AI bilan Backend (API va DB) logika yozish', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
      { id: 'v9', title: '3-Dars: Prompt Engineering — to\'g\'ri prompt qanday yoziladi', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
      { id: 'v10', title: '4-Dars: Limitdan samarali foydalanish — token tejash usullari', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
      { id: 'v11', title: '5-Dars: AI workflow — loyihada AI ni qanday integratsiya qilish', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
      { id: 'v12', title: '6-Dars: AI bilan Debugging va kod optimallashtirish', url: 'https://www.youtube.com/embed/UclrVWafRAI' },
    ]
  }
};

const CourseDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [activeModule, setActiveModule] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [purchasedModules, setPurchasedModules] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/course-auth');
      return;
    }
    
    // Check local storage for mocked purchases
    const m1 = localStorage.getItem('purchased_module-1');
    const m2 = localStorage.getItem('purchased_module-2');
    
    const purchased = [];
    if (m1 === 'true') purchased.push('module-1');
    if (m2 === 'true') purchased.push('module-2');
    
    setPurchasedModules(purchased);
    
    if (purchased.length > 0) {
      setActiveModule(purchased[0]);
      setActiveVideo(mockCourseData[purchased[0]].videos[0]);
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div style={{ paddingTop: '8rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dashboard Header */}
      <div style={{ padding: '0 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{lang === 'uz' ? "O'quv Paneli" : lang === 'ru' ? "Учебная панель" : "Learning Panel"}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{lang === 'uz' ? 'Xush kelibsiz' : lang === 'ru' ? 'Добро пожаловать' : 'Welcome'}, {user.user_metadata?.name || user.email}</p>
        </div>
        <button onClick={handleLogout} className="submit-form-btn" style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)' }}>
          <LogOut size={18} /> {lang === 'uz' ? 'Chiqish' : lang === 'ru' ? 'Выйти' : 'Log out'}
        </button>
      </div>

      <div style={{ flex: 1, padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: '1.5rem', height: 'calc(100vh - 200px)' }}>
        
        {/* Sidebar: Navigation */}
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lang === 'uz' ? 'Modullar' : lang === 'ru' ? 'Модули' : 'Modules'}</h3>
          
          {Object.keys(mockCourseData).map(modId => {
            const isPurchased = purchasedModules.includes(modId);
            const isActive = activeModule === modId;
            
            return (
              <div key={modId} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={() => isPurchased && setActiveModule(modId)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '1rem', borderRadius: '12px', background: isActive ? 'var(--accent)' : 'var(--card-bg-hover)',
                    border: '1px solid', borderColor: isActive ? 'var(--accent)' : 'var(--card-border)',
                    color: isActive ? '#fff' : 'var(--text-main)', cursor: isPurchased ? 'pointer' : 'not-allowed',
                    textAlign: 'left', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isPurchased ? <PlayCircle size={18} /> : <Lock size={18} style={{ opacity: 0.5 }} />}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{modId === 'module-1' ? '1-Modul' : '2-Modul'}</span>
                  </div>
                  {!isPurchased && <span style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>Qulf</span>}
                </button>

                {/* Video List Dropdown */}
                {isActive && isPurchased && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1rem' }}>
                    {mockCourseData[modId].videos.map((vid, idx) => (
                      <button
                        key={vid.id}
                        onClick={() => setActiveVideo(vid)}
                        style={{
                          background: activeVideo?.id === vid.id ? 'rgba(90, 107, 250, 0.1)' : 'transparent',
                          color: activeVideo?.id === vid.id ? 'var(--accent)' : 'var(--text-muted)',
                          border: 'none', textAlign: 'left', padding: '0.75rem', borderRadius: '8px',
                          cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                      >
                        {activeVideo?.id === vid.id && <ChevronRight size={14} />}
                        {idx + 1}. {vid.title.split(': ')[1] || vid.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
            <button onClick={() => navigate('/course-catalog')} className="submit-form-btn" style={{ width: '100%', background: 'var(--card-bg-hover)', color: 'var(--text-main)' }}>
              {lang === 'uz' ? 'Boshqa modullar' : lang === 'ru' ? 'Другие модули' : 'Other modules'} <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Main Content: Video Player */}
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {purchasedModules.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Monitor size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{lang === 'uz' ? "Sizda faol kurslar yo'q" : lang === 'ru' ? "У вас нет активных курсов" : "You have no active courses"}</h2>
              <p style={{ marginBottom: '2rem', maxWidth: '400px' }}>{lang === 'uz' ? 'Darslarni boshlash uchun kerakli modulni xarid qiling.' : lang === 'ru' ? 'Купите нужный модуль, чтобы начать уроки.' : 'Purchase a module to start your lessons.'}</p>
              <button onClick={() => navigate('/course-catalog')} className="submit-form-btn">{lang === 'uz' ? "Kurslarni ko'rish" : lang === 'ru' ? "Смотреть курсы" : "View courses"}</button>
            </div>
          ) : activeVideo ? (
            <>
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={activeVideo.url} 
                  title={activeVideo.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0 }}
                />
              </div>
              <div style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{activeVideo.title}</h2>
                <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>
                  {mockCourseData[activeModule].title}
                </span>
                <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem', lineHeight: 1.6 }}>
                  {lang === 'uz' ? "Ushbu dars haqida qisqacha ma'lumot shu yerda bo'ladi. Savollaringiz bo'lsa o'ng tarafdagi chat orqali menga yozishingiz mumkin." : lang === 'ru' ? "Краткая информация об этом уроке будет здесь. Если у вас есть вопросы, можете написать мне через чат справа." : "A brief description of this lesson will be here. If you have questions, you can message me via the chat on the right."}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Right Sidebar: Chat */}
        <div style={{ height: '100%' }}>
          {purchasedModules.length > 0 ? (
            <StudentChat />
          ) : (
            <div style={{ height: '100%', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              {lang === 'uz' ? 'Modul xarid qilingandan keyin chat aktivlashadi.' : lang === 'ru' ? 'Чат активируется после покупки модуля.' : 'Chat will be activated after purchasing a module.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CourseDashboard;
