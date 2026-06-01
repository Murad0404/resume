import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Lock, Monitor, LogOut, ChevronRight, User } from 'lucide-react';
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
  const [completedVids, setCompletedVids] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/course-catalog');
      return;
    }
    
    const fetchCourses = async () => {
      const courses = await dataService.getCourses() || [];
      setAllModules(courses);

      const purchased = courses.filter(c => localStorage.getItem(`purchased_${c.id}`) === 'true');
      setPurchasedModules(purchased);
      
      if (purchased.length > 0) {
        setActiveModuleId(purchased[0].id);
        if (purchased[0].videos && purchased[0].videos.length > 0) {
          setActiveVideo(purchased[0].videos[0]);
        }
      }
    };
    fetchCourses();

    if (session) {
      setCompletedVids(JSON.parse(localStorage.getItem(`completed_vids_${session.contact}`) || '[]'));
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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setShowProfileModal(true)}
            className="submit-form-btn" 
            style={{ 
              background: 'var(--accent)', 
              color: '#fff', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <User size={18} /> {lang === 'uz' ? 'Profil' : lang === 'ru' ? 'Профиль' : 'Profile'}
          </button>
          <button 
            onClick={handleLogout} 
            className="submit-form-btn" 
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--card-border)', 
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <LogOut size={18} /> {lang === 'uz' ? 'Chiqish' : lang === 'ru' ? 'Выйти' : 'Log out'}
          </button>
        </div>
      </div>

      <div className="course-dashboard-grid" style={{ flex: 1, padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{activeVideo.title}</h2>
                  <button 
                    onClick={() => {
                      const storageKey = `completed_vids_${session?.contact}`;
                      const completed = JSON.parse(localStorage.getItem(storageKey) || '[]');
                      if (completed.includes(activeVideo.id)) {
                        const filtered = completed.filter(id => id !== activeVideo.id);
                        localStorage.setItem(storageKey, JSON.stringify(filtered));
                      } else {
                        completed.push(activeVideo.id);
                        localStorage.setItem(storageKey, JSON.stringify(completed));
                      }
                      setCompletedVids(JSON.parse(localStorage.getItem(storageKey) || '[]'));
                    }}
                    style={{
                      background: completedVids.includes(activeVideo.id) ? 'rgba(34, 197, 94, 0.1)' : 'rgba(90, 107, 250, 0.1)',
                      color: completedVids.includes(activeVideo.id) ? '#22c55e' : 'var(--accent)',
                      border: '1px solid',
                      borderColor: completedVids.includes(activeVideo.id) ? 'rgba(34, 197, 94, 0.3)' : 'rgba(90, 107, 250, 0.3)',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {completedVids.includes(activeVideo.id) ? '✓ Tugatildi' : 'Darsni tugatdim'}
                  </button>
                </div>
                <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>
                  {activeModule?.title}
                </span>
                <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem', lineHeight: 1.6 }}>
                  {lang === 'uz' ? "Ushbu dars haqida qisqacha ma'lumot shu yerda bo'ladi. Savollaringiz bo'lsa o'ng tarafdagi chat orqali menga yozishingiz mumkin." : lang === 'ru' ? "Краткая информация об этом уроке будет здесь. Если у вас есть вопросы, можете написать мне через чат справа." : "A brief description of this lesson will be here. If you have questions, you can message me via the chat on the right."}
                </p>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', gap: '1.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(90, 107, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', border: '1px solid rgba(90, 107, 250, 0.2)' }}>
                <PlayCircle size={32} />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 800 }}>
                  {lang === 'uz' ? "Darslar mavjud emas" : lang === 'ru' ? "Уроки отсутствуют" : "No Videos Available"}
                </h3>
                <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {lang === 'uz' ? "Ushbu modulga hali darslar qo'shilmagan. Ular tez orada admin tomonidan yuklanadi!" : lang === 'ru' ? "В этот модуль еще не добавлены уроки. Скоро они будут загружены!" : "No videos have been added to this module yet. They will be uploaded soon!"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Chat */}
        <div className="course-dashboard-chat-col">
          {purchasedModules.length > 0 ? (
            <StudentChat />
          ) : (
            <div style={{ height: '100%', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              {lang === 'uz' ? 'Modul xarid qilingandan keyin chat aktivlashadi.' : lang === 'ru' ? 'Чат активируется после покупки модуля.' : 'Chat will be activated after purchasing a module.'}
            </div>
          )}
        </div>

      </div>

      {showProfileModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '24px',
              padding: '2.5rem',
              maxWidth: '550px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              color: 'var(--text-main)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowProfileModal(false)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: 'rgba(255,255,255,0.05)', border: 'none',
                color: 'var(--text-muted)', width: '36px', height: '36px',
                borderRadius: '50%', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
              }}
            >
              ✕
            </button>

            {/* Profile Avatar & Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%)',
                margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontSize: '2.5rem',
                fontWeight: 800, border: '4px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 20px rgba(90,107,250,0.3)'
              }}>
                {session?.name ? session.name[0].toUpperCase() : 'U'}
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{session?.name || "O'quvchi"}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>{session?.contact}</p>
            </div>

            {/* Stats Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.25rem' }}>
                  {purchasedModules.length}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Faol Modullar</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 800, color: '#22c55e', marginBottom: '0.25rem' }}>
                  {completedVids.length}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tugatilgan Darslar</span>
              </div>
            </div>

            {/* Progress Bar */}
            {(() => {
              const totalVids = purchasedModules.reduce((acc, c) => acc + (c.videos?.length || 0), 0);
              const progressPercent = totalVids > 0 ? Math.round((completedVids.length / totalVids) * 100) : 0;

              return (
                <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', padding: '1.5rem', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Umumiy O'zlashtirish</span>
                    <span style={{ color: 'var(--accent)' }}>{progressPercent}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progressPercent}%` }} 
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #3b82f6)', borderRadius: '4px' }} 
                    />
                  </div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                    {completedVids.length} / {totalVids} dars tugatildi
                  </span>
                </div>
              );
            })()}

            {/* Active Modules List */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mening Modullarim</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {purchasedModules.map(mod => {
                  const modVids = mod.videos || [];
                  const completedInMod = modVids.filter(v => completedVids.includes(v.id)).length;
                  const percent = modVids.length > 0 ? Math.round((completedInMod / modVids.length) * 100) : 0;

                  return (
                    <div key={mod.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{mod.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completedInMod} / {modVids.length} dars ({percent}%)</div>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: percent === 100 ? '#22c55e' : 'var(--accent)' }}>
                        {percent === 100 ? 'Tugatildi ✓' : `${percent}%`}
                      </div>
                    </div>
                  );
                })}
                {purchasedModules.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                    Sizda hali sotib olingan modullar mavjud emas.
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => setShowProfileModal(false)}
              className="submit-form-btn" 
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Yopish
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CourseDashboard;
