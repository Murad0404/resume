import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Sparkles, CheckCircle, Clock, Infinity as InfinityIcon, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { otpService } from '../services/otpService';
import OTPModal from '../components/OTPModal';
import PaymentModal from '../components/PaymentModal';

const PromptMarketplace = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [otpModal, setOtpModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Barchasi');
  const [hasPurchasedPrompts, setHasPurchasedPrompts] = useState(() => {
    return localStorage.getItem('hasPurchasedPrompts') === 'true';
  });

  const [session, setSession] = useState(() => otpService.getSession());

  useEffect(() => {
    const loadData = async () => {
      const data = await dataService.getPrompts();
      setPrompts(data || []);
      
      const plans = await dataService.getPricingPlans();
      const mapped = (plans || []).map(plan => ({
        ...plan,
        icon: plan.id === 'lifetime' ? <InfinityIcon size={24} /> : <Clock size={24} />
      }));
      setPricingPlans(mapped);
    };
    loadData();
  }, []);

  const handlePurchaseClick = (plan) => {
    const isPurchased = localStorage.getItem('hasPurchasedPrompts') === 'true' || localStorage.getItem(`purchased_${plan.id}`) === 'true';
    
    if (isPurchased) {
      navigate('/prompt-dashboard');
      return;
    }

    if (!session) {
      setPendingPlan(plan);
      setOtpModal(true);
      return;
    }
    setPurchaseModal(plan);
  };

  const handleOTPSuccess = () => {
    const activeSession = otpService.getSession();
    setSession(activeSession);
    setOtpModal(false);
    if (pendingPlan) {
      const isPurchased = localStorage.getItem('hasPurchasedPrompts') === 'true' || localStorage.getItem(`purchased_${pendingPlan.id}`) === 'true';
      if (isPurchased) {
        navigate('/prompt-dashboard');
      } else {
        setPurchaseModal(pendingPlan);
      }
    }
    setPendingPlan(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };



  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {otpModal && (
        <OTPModal
          onSuccess={handleOTPSuccess}
          onClose={() => { setOtpModal(false); setPendingPlan(null); }}
        />
      )}
      <div className="bento-wrapper" style={{ paddingTop: '150px', paddingBottom: '4rem' }}>
        
        {/* PROMPT MARKETPLACE HEADER */}
        <div className="projects-header" style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="projects-title">
              <span className="projects-accent">AI Promtlar Marketpleysi</span>
            </h1>
            <p className="projects-subtitle" style={{ margin: '1rem auto', maxWidth: '700px' }}>
              Midjourney, ChatGPT va Sora uchun professional promtlar to'plami bilan ish unumdorligingizni oshiring.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button 
                onClick={() => document.getElementById('pricing-plans')?.scrollIntoView({ behavior: 'smooth' })} 
                className="submit-form-btn" 
                style={{ padding: '0.8rem 2rem', margin: 0, background: 'var(--accent)' }}
              >
                <Sparkles size={18} style={{ marginRight: '0.5rem' }} /> Sara Promtlar
              </button>
            </div>
          </motion.div>
        </div>

        {/* FREE PROMPT CATALOG - REFERENCE IMAGE STYLE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            padding: '2.5rem 0', 
            marginBottom: '4rem'
          }}
        >
          <div style={{ marginBottom: '3rem', textAlign: 'left' }}>
            <h2 style={{ fontSize: '2.2rem', margin: 0, fontWeight: 700, color: '#fff' }}>Tasvir uslubini tanlang</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {prompts.filter(p => p.isFree).map(p => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                key={p.id} 
                onClick={() => handleCopy(p.prompt, p.id)}
                style={{ 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  height: '320px',
                  position: 'relative',
                  cursor: 'pointer',
                  background: '#1a1a1a',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {/* Gradient Overlay */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: '60%', 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '1.5rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>{p.title}</div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'rgba(255,255,255,0.6)', 
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      "{p.prompt}"
                    </div>
                    {copiedId === p.id && (
                      <div style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 800, marginTop: '0.25rem' }}>NUSXALANDI!</div>
                    )}
                  </div>
                </div>

                {/* Free Badge */}
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(34, 197, 94, 0.85)', padding: '0.25rem 0.6rem', borderRadius: '6px', color: '#fff', fontSize: '0.6rem', fontWeight: 800 }}>
                   BEPUL
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* PRICING PLANS HEADER */}
        <div id="pricing-plans" style={{ textAlign: 'center', scrollMarginTop: '100px', marginBottom: '3rem' }}>
           <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>Barcha promtlarga to'liq kirish</h2>
           <p style={{ opacity: 0.7, maxWidth: '600px', margin: '0 auto' }}>To'lovni amalga oshiring va bazadagi yuzlab professional promtlardan cheksiz foydalaning.</p>
        </div>

        {/* PRICING PLANS GRID */}
        <motion.div className="bento-grid" variants={containerVariants} initial="hidden" animate="visible">
          {pricingPlans.map((plan, idx) => (
            <motion.div 
              key={idx} 
              className={`bento-box ${plan.featured ? 'featured-plan' : ''}`} 
              variants={itemVariants}
              onClick={() => handlePurchaseClick(plan)}
              style={{ 
                gridColumn: 'span 2', 
                padding: '3rem 2.5rem',
                background: plan.featured ? `linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)` : 'var(--card-bg)',
                border: plan.featured ? `2px solid ${plan.color}88` : '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: plan.featured ? `0 20px 40px ${plan.color}22` : 'none',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              {plan.featured && (
                <div style={{ position: 'absolute', top: '1.2rem', right: '-2.5rem', background: plan.color, color: 'white', padding: '0.4rem 3.5rem', transform: 'rotate(45deg)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                  TAVSIYA
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                <div style={{ color: plan.color, background: `${plan.color}22`, padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {plan.icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', fontWeight: 800 }}>{plan.title}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{plan.duration === 'Lifetime' ? 'Cheksiz' : 'Muddati'}</span>
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-1px' }}>${plan.discountPrice || plan.price}</span>
                  {plan.discountPrice && (
                    <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', textDecoration: 'line-through', opacity: 0.5 }}>${plan.price}</span>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {plan.duration === 'Lifetime' ? "Bir marta to'lov, umrbod foydalanish" : "Oylik obuna, barcha imkoniyatlar bilan"}
                </p>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1rem', fontWeight: 500 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${plan.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle size={14} style={{ color: plan.color }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {(() => {
                const isPurchased = localStorage.getItem('hasPurchasedPrompts') === 'true' || localStorage.getItem(`purchased_${plan.id}`) === 'true';
                const isPending = localStorage.getItem(`payment_status_${plan.id}`) === 'pending';
                
                return (
                  <button 
                    className="nav-cta" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPurchased) {
                        if (!session) {
                          setPendingPlan(plan);
                          setOtpModal(true);
                          return;
                        }
                        navigate('/prompt-dashboard');
                      } else if (isPending) {
                        alert("Sizning to'lovingiz adminga yuborilgan. Iltimos, tasdiqlanishini kuting.");
                      } else {
                        handlePurchaseClick(plan);
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      background: isPurchased ? '#22c55e' : isPending ? 'rgba(255,255,255,0.05)' : plan.featured ? plan.color : 'rgba(255,255,255,0.05)', 
                      color: isPending ? 'var(--text-muted)' : 'white', 
                      border: isPurchased ? 'none' : isPending ? '1px solid var(--border-color)' : plan.featured ? 'none' : `1px solid var(--border-color)`, 
                      padding: '1.25rem', 
                      borderRadius: '16px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.75rem', 
                      fontWeight: 800,
                      fontSize: '1rem',
                      marginTop: 'auto',
                      transition: 'all 0.3s'
                    }}
                  >
                    {isPurchased ? "Promtlarni ko'rish" : isPending ? "Tekshirilmoqda ⏳" : t.prompts?.buyNow || "Sotib olish"} <ArrowUpRight size={20} />
                  </button>
                );
              })()}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={!!purchaseModal}
        onClose={() => setPurchaseModal(null)}
        onSuccess={() => {
          // Access is granted by Admin approval. UI will update to pending.
        }}
        itemTitle={purchaseModal?.title}
        itemPrice={`$${purchaseModal?.discountPrice || purchaseModal?.price}`}
        itemId={purchaseModal?.id}
        itemType="prompt"
      />
    </>
  );
};

export default PromptMarketplace;
