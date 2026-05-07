import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Lock, Monitor, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import StudentChat from '../components/StudentChat';
import { otpService } from '../services/otpService';

import { dataService } from '../services/dataService';

const CourseDashboard = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [purchasedModules, setPurchasedModules] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [session, setSession] = useState(() => otpService.getSession());

  useEffect(() => {
    if (!session) {
      navigate('/course-catalog');
      return;
    }
    
    const courses = dataService.getCourses() || [];
    setAllModules(courses);

    const purchased = courses.filter(c => localStorage.getItem(`purchased_${c.id}`) === 'true');
    setPurchasedModules(purchased);
    
    if (purchased.length > 0) {
      setActiveModuleId(purchased[0].id);
      if (purchased[0].videos && purchased[0].videos.length > 0) {
        setActiveVideo(purchased[0].videos[0]);
      }
    }
  }, [session, navigate]);

  const activeModule = allModules.find(m => m.id === activeModuleId);

  const handleLogout = async () => {
    otpService.clearSession();
    navigate('/');
  };

  if (!session) return null;

  return (
    <div style={{ paddingTop: '8rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dashboard Header */}
      <div style={{ padding: '0 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{lang === 'uz' ? "O'quv Paneli" : lang === 'ru' ? "Учебная панель" : "Learning Panel"}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{lang === 'uz' ? 'Xush kelibsiz' : lang === 'ru' ? 'Добро пожаловать' : 'Welcome'}, {session?.name || session?.contact}</p>
        </div>
        <button onClick={handleLogout} className="submit-form-btn" style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)' }}>
          <LogOut size={18} /> {lang === 'uz' ? 'Chiqish' : lang === 'ru' ? 'Выйти' : 'Log out'}
        </button>
      </div>

      <div style={{ flex: 1, padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: '1.5rem', height: 'calc(100vh - 200px)' }}>
        
        {/* Sidebar: Navigation */}
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lang === 'uz' ? 'Modullar' : lang === 'ru' ? 'Модули' : 'Modules'}</h3>
          
          {allModules.map((mod, index) => {
            const isPurchased = purchasedModules.some(p => p.id === mod.id);
            const isActive = activeModuleId === mod.id;
            
            return (
              <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    if (isPurchased) {
                      setActiveModuleId(mod.id);
                      if (mod.videos && mod.videos.length > 0) {
                        setActiveVideo(mod.videos[0]);
                      }
                    }
                  }}
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
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      {mod.title}
                    </span>
                  </div>
                  {!isPurchased && <span style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>Qulf</span>}
                </button>

                {/* Video List Dropdown */}
                {isActive && isPurchased && mod.videos && mod.videos.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1rem' }}>
                    {mod.videos.map((vid, idx) => (
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
                        {activeVideo?.id === vid.id && <ChevronRight size={14} style={{ flexShrink: 0 }} />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {idx + 1}. {vid.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {isActive && isPurchased && (!mod.videos || mod.videos.length === 0) && (
                  <div style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Hali darslar qo'shilmagan.
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
                  {activeModule?.title}
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
