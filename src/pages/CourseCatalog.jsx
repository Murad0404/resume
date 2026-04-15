import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Clock, CheckCircle, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const modules = [
  {
    id: 'module-1',
    title: '1-Modul: AI Vositalar (Amaliy)',
    duration: '2 oy',
    price: '700 000 UZS',
    description: 'AI yordamida rasm va video generatsiya qilish, eski rasmlarni tiklash, va qaysi AI qaysi soha uchun yaxshiligi — hammasi amaliy misollar bilan.',
    features: [
      '🎨 AI bilan rasm generatsiya (Midjourney, DALL-E, Stable Diffusion)',
      '🎬 AI bilan video generatsiya (Sora, Runway, Kling)',
      '🖼️ Eski foto va rasmlarni AI orqali tiklash',
      '🤖 Qaysi AI qaysi sohada eng kuchli — taqqoslash',
      '💡 ChatGPT, Claude, Gemini — farqlari va foydalanish usullari',
    ],
    videoCount: 14
  },
  {
    id: 'module-2',
    title: '2-Modul: AI Bilan Dasturlash & Prompting',
    duration: '2 oy',
    price: '700 000 UZS',
    description: "AI yordamida Frontend va Backend kod yozish, to'g'ri va optimal prompt tuzish, AI limitlarini tejab ishlash va eng foydali AI workflow strategiyalari.",
    features: [
      '⚡ AI bilan Frontend (React, HTML/CSS) tez qurish',
      '🔧 AI bilan Backend (API, DB) logika yozish',
      "📝 To'g'ri prompt berish (Prompt Engineering asoslari)",
      '🔋 Limitdan samarali foydalanish — tokenni tejash usullari',
      '🚀 AI workflow: loyihada AI ni qanday integratsiya qilish',
    ],
    videoCount: 16
  }
];


const CourseCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [purchaseModal, setPurchaseModal] = useState(null);

  const handleEnroll = (mod) => {
    if (!user) {
      navigate('/course-auth');
      return;
    }
    setPurchaseModal(mod);
  };

  const confirmPurchase = () => {
    // Simulate purchase by setting a local storage flag for MVP
    // In production: route to Payme/Click gateway, or save to Supabase 'purchases' table
    localStorage.setItem(`purchased_${purchaseModal.id}`, 'true');
    setPurchaseModal(null);
    alert('🎉 Xarid amalga oshdi! Videolar ochildi.');
    navigate('/course-dashboard');
  };

  return (
    <motion.div 
      className="bento-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="projects-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="projects-eyebrow">{lang === 'uz' ? "Online Ta'lim" : lang === 'ru' ? "Онлайн Образование" : "Online Education"}</span>
          <h1 className="projects-title">
            <span className="projects-accent">{lang === 'uz' ? "Mahorat Darslari" : lang === 'ru' ? "Мастер-классы" : "Masterclasses"}</span>
          </h1>
          <p className="projects-subtitle" style={{ margin: '1rem auto' }}>
            {lang === 'uz' ? "Amaliy loyihalar va sifatli bilim orqali professional dizayner va dasturchi darajasiga chiqing." : lang === 'ru' ? "Станьте профессионалом уровня Pro с помощью практических проектов и качественных знаний." : "Reach professional designer and developer level through practical projects and quality knowledge."}
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        style={{ maxWidth: '1000px', margin: '0 auto 4rem auto' }}
      >
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '1.25rem', marginBottom: '3rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyItems: 'center', flexShrink: 0, justifyContent: 'center', fontWeight: 'bold' }}>!</div>
          <p style={{ color: '#ef4444', margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>
            <strong>{lang === 'uz' ? 'Diqqat:' : lang === 'ru' ? 'Внимание:' : 'Attention:'}</strong> {lang === 'uz' ? "Kurslar hali to'liq tayyorlanmoqda. Ular juda foydali va Pro darajada bo'ladi. Kurs tayyor bo'lishi bilan uning narxini ham yanada arzonroq qilaman degan umiddaman!" : lang === 'ru' ? "Курсы еще в стадии подготовки. Они будут очень полезными и на уровне Pro. Как только курс будет готов, надеюсь сделать цену еще доступнее!" : "Courses are still in preparation. They will be highly useful and Pro level. I hope to make the price even more affordable once the course is ready!"}
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
            <PlayCircle size={32} style={{ color: 'var(--accent)' }} /> 
            {lang === 'uz' ? "Nima uchun AI ni o'rganish \"Must-have\"?" : lang === 'ru' ? "Почему изучение ИИ — это \"Маст-хэв\"?" : "Why learning AI is a \"Must-have\"?"}
          </h2>
        </div>

        <div className="bento-box" style={{ padding: '1rem' }}>
          <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/UclrVWafRAI" 
              title="Nima uchun AI ni o'rganish muhim?" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {modules.map((mod, i) => (
          <motion.div 
            key={mod.id}
            className="bento-box" 
            style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <span style={{ color: i === 0 ? '#5a6bfa' : '#22c55e', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Modul {i + 1}
            </span>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{mod.title}</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              {mod.description}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Clock size={16} /> {mod.duration}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <PlayCircle size={16} /> {mod.videoCount} Dars
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1 }}>
              {mod.features.map((feat, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  <CheckCircle size={18} style={{ color: i === 0 ? '#5a6bfa' : '#22c55e', flexShrink: 0 }} />
                  {feat}
                </li>
              ))}
            </ul>

            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Narxi</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {mod.price}
                </div>
              </div>
              <button onClick={() => handleEnroll(mod)} className="submit-form-btn" style={{ background: i === 0 ? '#5a6bfa' : '#22c55e', padding: '0.75rem 1.5rem', margin: 0, display: 'inline-flex' }}>
                Xarid qilish
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Simulation Modal */}
      <AnimatePresence>
        {purchaseModal && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPurchaseModal(null)}
          >
            <motion.div
              className="lang-modal"
              style={{ maxWidth: '450px', width: '90%' }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="lightbox-close" onClick={() => setPurchaseModal(null)}>
                <X size={20} />
              </button>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                  <ShieldCheck size={30} />
                </div>
              </div>
              
              <h3 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Tekshiruv xaridi</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Tizim sinov rejimida. Tugmani bossangiz, <b>{purchaseModal.title}</b> darslari bepul ochiladi.
              </p>

              <div style={{ background: 'var(--card-bg-hover)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>To'lov summasi:</span>
                <span style={{ fontWeight: 800 }}>{purchaseModal.price}</span>
              </div>

              <button onClick={confirmPurchase} className="submit-form-btn" style={{ width: '100%', padding: '1rem' }}>
                Sinov rejimida to'lash <ArrowRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default CourseCatalog;
