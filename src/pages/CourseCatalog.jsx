import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Clock, CheckCircle, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { otpService } from '../services/otpService';
import OTPModal from '../components/OTPModal';
import PaymentModal from '../components/PaymentModal';
import { useLanguage } from '../contexts/LanguageContext';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [otpModal, setOtpModal] = useState(false);
  const [pendingModule, setPendingModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [session, setSession] = useState(() => otpService.getSession());

  useEffect(() => {
    const fetchCourses = async () => {
      const courses = await dataService.getCourses();
      setModules(courses || []);
    };
    fetchCourses();
  }, []);

  const handleEnroll = (mod) => {
    if (!session) {
      setPendingModule(mod);
      setOtpModal(true);
      return;
    }
    setPurchaseModal(mod);
  };

  const handleOTPSuccess = () => {
    const activeSession = otpService.getSession();
    setSession(activeSession);
    setOtpModal(false);
    if (pendingModule) {
      const isPurchased = localStorage.getItem(`purchased_${pendingModule.id}`) === 'true';
      if (isPurchased) {
        navigate('/course-dashboard');
      } else {
        setPurchaseModal(pendingModule);
      }
    }
    setPendingModule(null);
  };

  return (
    <>
      {otpModal && (
        <OTPModal
          onSuccess={handleOTPSuccess}
          onClose={() => { setOtpModal(false); setPendingModule(null); }}
        />
      )}
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
                <PlayCircle size={16} /> {(mod.videos?.length || 0)} Dars
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1 }}>
              {(mod.features || []).map((feat, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  <CheckCircle size={18} style={{ color: i === 0 ? '#5a6bfa' : '#22c55e', flexShrink: 0 }} />
                  {feat}
                </li>
              ))}
            </ul>

            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Narxi</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.25rem' }}>
                  {mod.discountPrice ? (
                    <>
                      <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 500, lineHeight: 1 }}>{mod.price}</span>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>{mod.discountPrice}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{mod.price}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => {
                  const isPurchased = localStorage.getItem(`purchased_${mod.id}`) === 'true';
                  const isPending = localStorage.getItem(`payment_status_${mod.id}`) === 'pending';
                  if (isPurchased) {
                    if (!session) {
                      setPendingModule(mod);
                      setOtpModal(true);
                      return;
                    }
                    navigate('/course-dashboard');
                  } else if (isPending) {
                    alert("Sizning to'lovingiz adminga yuborilgan. Iltimos, tasdiqlanishini kuting.");
                  } else {
                    handleEnroll(mod);
                  }
                }} 
                className="submit-form-btn" 
                style={{ 
                  background: localStorage.getItem(`purchased_${mod.id}`) === 'true' 
                    ? '#22c55e' 
                    : localStorage.getItem(`payment_status_${mod.id}`) === 'pending' 
                      ? 'rgba(255,255,255,0.05)' 
                      : i === 0 ? '#5a6bfa' : '#22c55e', 
                  color: localStorage.getItem(`payment_status_${mod.id}`) === 'pending' ? 'var(--text-muted)' : 'white',
                  border: localStorage.getItem(`payment_status_${mod.id}`) === 'pending' ? '1px solid var(--border-color)' : 'none',
                  padding: '0.75rem 1.5rem', 
                  margin: 0, 
                  display: 'inline-flex',
                  cursor: 'pointer'
                }}
              >
                {localStorage.getItem(`purchased_${mod.id}`) === 'true' 
                  ? "Darslarni ko'rish" 
                  : localStorage.getItem(`payment_status_${mod.id}`) === 'pending' 
                    ? "Tekshirilmoqda ⏳" 
                    : "Xarid qilish"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <PaymentModal 
        isOpen={!!purchaseModal}
        onClose={() => setPurchaseModal(null)}
        onSuccess={() => {
          // Admin approval needed, just let UI update to pending
        }}
        itemTitle={purchaseModal?.title}
        itemPrice={purchaseModal?.discountPrice || purchaseModal?.price}
        itemId={purchaseModal?.id}
        itemType="course"
      />

    </motion.div>
    </>
  );
};

export default CourseCatalog;
