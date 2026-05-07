import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageCircle, ArrowRight, Shield, RefreshCw, CheckCircle, ExternalLink, User, LogIn, UserPlus } from 'lucide-react';
import { otpService } from '../services/otpService';

/**
 * OTPModal — Explicit Login / Register split.
 */
const OTPModal = ({ onSuccess, onClose }) => {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [method, setMethod] = useState('email'); // 'email' | 'telegram'
  const [contact, setContact] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BOT_USERNAME = 'murod_yordambot';

  const normalizedContact = method === 'telegram'
    ? (contact.trim().startsWith('@') ? contact.trim() : `@${contact.trim()}`)
    : contact.trim();

  const handleSendOTP = async () => {
    setError('');

    if (!contact.trim()) {
      setError(method === 'email' ? 'Emailni kiriting.' : 'Telegram username-ni kiriting.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Ismingizni kiriting.');
      return;
    }

    setLoading(true);
    let result;
    if (method === 'email') {
      result = await otpService.sendEmailOTP(contact.trim());
    } else {
      result = await otpService.sendTelegramOTP(contact.trim());
    }
    setLoading(false);

    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error);
    }
  };

  const handleVerifyOTP = () => {
    setError('');
    if (otp.length !== 6) {
      setError('6 xonali kodni kiriting.');
      return;
    }

    const valid = otpService.verifyOTP(normalizedContact, otp);
    if (!valid) {
      setError("Kod noto'g'ri.");
      return;
    }

    otpService.clearOTP(normalizedContact);
    
    // In register mode, we save the new name. In login mode, we try to get the existing name.
    let finalName = name;
    if (mode === 'login') {
      finalName = otpService.getUserName(normalizedContact) || 'Foydalanuvchi';
    }

    otpService.saveSession(normalizedContact, finalName);
    onSuccess({ contact: normalizedContact, name: finalName });
  };

  const inpStyle = {
    width: '100%', padding: '0.8rem 1rem', borderRadius: '12px',
    background: 'var(--bg-color)', border: '1px solid var(--border-color)',
    color: 'var(--text-main)', outline: 'none', marginBottom: '1rem',
    fontSize: '0.95rem'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem', backdropFilter: 'blur(10px)'
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 400, background: 'var(--card-bg)',
            borderRadius: '28px', border: '1px solid var(--border-color)',
            padding: '2rem', position: 'relative'
          }}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>

          {step === 'form' ? (
            <>
              {/* Tab Switcher */}
              <div style={{ display: 'flex', background: 'var(--bg-color)', borderRadius: '14px', padding: '0.3rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <button 
                  onClick={() => { setMode('login'); setError(''); }}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: mode === 'login' ? 'var(--card-bg)' : 'transparent', color: mode === 'login' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.2s' }}
                >
                  <LogIn size={16} /> Kirish
                </button>
                <button 
                  onClick={() => { setMode('register'); setError(''); }}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: mode === 'register' ? 'var(--card-bg)' : 'transparent', color: mode === 'register' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.2s' }}
                >
                  <UserPlus size={16} /> Ro'yxatdan o'tish
                </button>
              </div>

              <h2 style={{ textAlign: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
                {mode === 'login' ? 'Xush kelibsiz!' : 'Yangi hisob yaratish'}
              </h2>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button onClick={() => setMethod('email')} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1px solid', borderColor: method === 'email' ? 'var(--accent)' : 'var(--border-color)', background: method === 'email' ? 'rgba(90,107,250,0.1)' : 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}>Email</button>
                <button onClick={() => setMethod('telegram')} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1px solid', borderColor: method === 'telegram' ? '#29a3d4' : 'var(--border-color)', background: method === 'telegram' ? 'rgba(41,163,212,0.1)' : 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}>Telegram</button>
              </div>

              {mode === 'register' && (
                <input style={inpStyle} placeholder="Ismingiz" value={name} onChange={e => setName(e.target.value)} />
              )}
              
              <input 
                style={inpStyle} 
                placeholder={method === 'email' ? 'email@example.com' : '@username'} 
                value={contact} 
                onChange={e => setContact(e.target.value)} 
              />

              {method === 'telegram' && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
                  Botga <strong>/start</strong> bosgan bo'lishingiz kerak: <a href={`https://t.me/${BOT_USERNAME}`} target="_blank" rel="noreferrer" style={{ color: '#29a3d4' }}>@{BOT_USERNAME}</a>
                </p>
              )}

              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

              <button 
                onClick={handleSendOTP} 
                className="submit-form-btn" 
                style={{ width: '100%', padding: '1rem' }} 
                disabled={loading}
              >
                {loading ? 'Yuborilmoqda...' : 'OTP kodini olish'}
              </button>
            </>
          ) : (
            <>
              <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Kodni tasdiqlang</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {normalizedContact} ga yuborilgan 6 xonali kodni kiriting.
              </p>
              <input 
                style={{ ...inpStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }} 
                maxLength={6} 
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
              />
              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
              <button onClick={handleVerifyOTP} className="submit-form-btn" style={{ width: '100%', padding: '1rem' }}>Tasdiqlash</button>
              <button onClick={() => setStep('form')} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '1rem', cursor: 'pointer' }}>Orqaga</button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OTPModal;
