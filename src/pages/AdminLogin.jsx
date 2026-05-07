import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Key, User, RefreshCw } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('username'); // 'username' or 'otp'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpExpires, setOtpExpires] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    
    if (cleanUsername === 'murod' || cleanUsername === 'admin') {
      setLoading(true);
      setError('');
      
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      try {
        const BOT_TOKEN = '8697069079:AAHKkQ6FDAQ4q5hSx6UKoCUmoQjvPZl5d74'; // @murod_yordambot
        const CHAT_ID = '635476813';
        
        const message = `🔑 *Admin Panelga kirish*\n\nSizning bir martalik kirish parolingiz:\n👉 *${newOtp}*\n\n⏱ Ushbu kod 5 daqiqa davomida amal qiladi.`;
        
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
          })
        });
        
        const data = await res.json();
        
        if (res.ok && data.ok) {
          setGeneratedOtp(newOtp);
          setOtpExpires(Date.now() + 5 * 60 * 1000); // 5 minutes
          setStep('otp');
        } else {
          setError("Bot orqali xabar yuborishda xatolik yuz berdi.");
        }
      } catch (err) {
        setError("Tarmoq ulanishida xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Foydalanuvchi nomi noto'g'ri");
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    
    if (Date.now() > otpExpires) {
      setError("Kodning amal qilish muddati tugagan. Qaytadan foydalanuvchi nomini kiriting.");
      setStep('username');
      setOtp('');
      return;
    }
    
    if (otp.trim() === generatedOtp) {
      sessionStorage.setItem('admin_auth', 'true');
      navigate('/admin');
    } else {
      setError("Noto'g'ri tasdiqlash kodi");
    }
  };

  return (
    <div className="bento-wrapper" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div 
        className="bento-box"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ 
          width: '100%', 
          maxWidth: '420px', 
          padding: '3rem 2.5rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            style={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              background: 'rgba(90, 107, 250, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--accent)',
              border: '1px solid rgba(90, 107, 250, 0.2)'
            }}
          >
            <Shield size={32} />
          </motion.div>
        </div>
        
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>Admin Panel</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.92rem', lineHeight: 1.5 }}>
          {step === 'username' 
            ? "Tizimga kirish uchun foydalanuvchi nomingizni kiriting." 
            : "Telegram botimizga yuborilgan tasdiqlash kodini kiriting."
          }
        </p>

        <AnimatePresence mode="wait">
          {step === 'username' ? (
            <motion.form 
              key="username-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleRequestOtp} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.7 }} />
                <input 
                  type="text" 
                  placeholder="Foydalanuvchi nomi" 
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '1rem 1rem 1rem 2.8rem', 
                    borderRadius: '14px', 
                    background: 'var(--bg-color)', 
                    border: `1px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                />
              </div>

              {error && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 500, display: 'block' }}
                >
                  ⚠️ {error}
                </motion.span>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="submit-form-btn" 
                style={{ width: '100%', padding: '1.1rem', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                ) : (
                  <>
                    Davom etish <ArrowRight size={18} />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleVerifyOtp} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.7 }} />
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Tasdiqlash kodi" 
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '1rem 1rem 1rem 2.8rem', 
                    borderRadius: '14px', 
                    background: 'var(--bg-color)', 
                    border: `1px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '1.1rem',
                    letterSpacing: otp ? '4px' : 'normal',
                    textAlign: otp ? 'center' : 'left',
                    fontWeight: 700,
                    transition: 'all 0.3s'
                  }}
                />
              </div>

              {error && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 500, display: 'block' }}
                >
                  ⚠️ {error}
                </motion.span>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setStep('username'); setOtp(''); setError(''); }}
                  className="submit-form-btn" 
                  style={{ 
                    flex: 1, 
                    padding: '1rem', 
                    borderRadius: '14px', 
                    background: 'var(--card-bg-hover)', 
                    color: 'var(--text-main)', 
                    border: '1px solid var(--border-color)',
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontWeight: 600 
                  }}
                >
                  Orqaga
                </button>
                <button 
                  type="submit" 
                  className="submit-form-btn" 
                  style={{ flex: 1, padding: '1rem', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                >
                  Kirish <Shield size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RefreshCw size={12} /> Kodni qayta yuborish
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
