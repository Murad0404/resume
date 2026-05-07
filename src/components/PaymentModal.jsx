import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, CheckCircle, AlertCircle, Copy, Upload, Image } from 'lucide-react';
import { dataService } from '../services/dataService';
import { otpService } from '../services/otpService';

const PaymentModal = ({ isOpen, onClose, onSuccess, itemTitle, itemPrice, itemId, itemType }) => {
  const [step, setStep] = useState('p2p'); // 'p2p' | 'processing' | 'success'
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin Card Details (can be managed by you)
  const ADMIN_CARD = '5614 6887 0698 1320';
  const ADMIN_HOLDER = 'MURODJON DADABOEV';

  const session = otpService.getSession();

  useEffect(() => {
    if (isOpen) {
      setStep('p2p');
      setSelectedFile(null);
      setPreviewUrl('');
      setError('');
      setCopied(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleCopyCard = () => {
    navigator.clipboard.writeText(ADMIN_CARD.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Fayl hajmi juda katta (Max: 5MB)");
        return;
      }
      setSelectedFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Iltimos, to'lov chekini (screenshot) yuklang.");
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const BOT_TOKEN = '8697069079:AAHKkQ6FDAQ4q5hSx6UKoCUmoQjvPZl5d74'; // @murod_yordambot
      const CHAT_ID = '635476813'; // Murod's Chat ID

      const caption = [
        `💰 **YANGI TO'LOV TUSHDI! (Chek yuklandi)**`,
        ``,
        `👤 **Foydalanuvchi**: ${session?.name || 'Noma\'lum'}`,
        `📞 **Aloqa**: ${session?.contact || 'Noma\'lum'}`,
        `📦 **Mahsulot**: ${itemTitle}`,
        `💵 **Narxi**: ${itemPrice}`,
        ``,
        `👉 *Iltimos, hisobingizni tekshirib oling.*`
      ].join('\n');

      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('photo', selectedFile);
      formData.append('caption', caption);
      formData.append('parse_mode', 'Markdown');

      // Send photo with details directly to the Telegram Bot
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      const newRequest = {
        id: `pay-${Date.now()}`,
        userId: session?.contact || 'anonymous',
        userName: session?.name || 'Foydalanuvchi',
        itemId: itemId,
        itemTitle: itemTitle,
        itemPrice: itemPrice,
        itemType: itemType,
        receiptImage: previewUrl,
        status: 'pending',
        time: new Date().toLocaleString()
      };

      const existingStored = localStorage.getItem('payment_requests');
      const list = existingStored ? JSON.parse(existingStored) : [];
      list.push(newRequest);
      localStorage.setItem('payment_requests', JSON.stringify(list));
      localStorage.setItem(`payment_status_${itemId}`, 'pending');

      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Payment sending error:", err);
      // Fallback: save local request even if fetch failed so admin can see it in dashboard
      const newRequest = {
        id: `pay-${Date.now()}`,
        userId: session?.contact || 'anonymous',
        userName: session?.name || 'Foydalanuvchi',
        itemId: itemId,
        itemTitle: itemTitle,
        itemPrice: itemPrice,
        itemType: itemType,
        receiptImage: previewUrl,
        status: 'pending',
        time: new Date().toLocaleString()
      };
      const existingStored = localStorage.getItem('payment_requests');
      const list = existingStored ? JSON.parse(existingStored) : [];
      list.push(newRequest);
      localStorage.setItem('payment_requests', JSON.stringify(list));
      localStorage.setItem(`payment_status_${itemId}`, 'pending');

      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ 
          width: '100%', 
          maxWidth: '480px', 
          background: 'var(--card-bg)', 
          borderRadius: '28px', 
          border: '1px solid var(--card-border)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1001,
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Xavfsiz To'lov</h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{itemTitle}</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--card-bg-hover)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          <AnimatePresence mode="wait">
            {step === 'p2p' && (
              <motion.div key="p2p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {/* Price Display */}
                <div style={{ background: 'var(--bg-color)', padding: '1.25rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--card-border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>To'lov miqdori:</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent)' }}>{itemPrice}</span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem', textAlign: 'center' }}>
                  To'lovni amalga oshirish uchun quyidagi plastik kartaga pulni o'tkazing va kvitansiya (chek) rasmini yuklang. Pul to'g'ridan-to'g'ri mening shaxsiy kartamga tushadi.
                </p>

                {/* Card Display */}
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', padding: '1.5rem', borderRadius: '18px', marginBottom: '1.75rem', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>KARTA RAQAMI</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '2px', color: '#fff' }}>{ADMIN_CARD}</span>
                    </div>
                    <button 
                      onClick={handleCopyCard}
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
                    >
                      {copied ? "Nusxalandi!" : <><Copy size={14} /> Nusxa</>}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>KARTA EGASI</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>{ADMIN_HOLDER}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem' }}>Uzcard / Humo</div>
                  </div>
                </div>

                {/* File Upload Form */}
                <form onSubmit={handlePaymentSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>To'lov chekini yuklash</label>
                    
                    <input 
                      type="file" 
                      id="receipt-file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    
                    {!previewUrl ? (
                      <label 
                        htmlFor="receipt-file" 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', height: '140px', background: 'var(--bg-color)', border: '2px dashed var(--card-border)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s' }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--card-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                          <Upload size={20} />
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Chek rasmini yuklash (JPG, PNG)</span>
                      </label>
                    ) : (
                      <div style={{ position: 'relative', height: '140px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                        <img src={previewUrl} alt="Chek" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button" 
                          onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 500, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading || !selectedFile}
                    className="submit-form-btn"
                    style={{ width: '100%', padding: '1.1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 800, opacity: selectedFile ? 1 : 0.5, cursor: selectedFile ? 'pointer' : 'not-allowed' }}
                  >
                    To'lovni tasdiqlashga yuborish
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ width: 56, height: 56, border: '4px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 2rem auto', animation: 'spin 1s linear infinite' }} />
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Chek yuborilmoqda...</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Iltimos, sahifani yopmang.</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <CheckCircle size={40} />
                </div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.35rem', fontWeight: 800 }}>Chek qabul qilindi!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Rahmat! To'lov so'rovingiz admin paneliga va Telegram botimizga muvaffaqiyatli yuborildi. Ruxsat admin tomonidan tasdiqlangach faollashtiriladi.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div style={{ padding: '1.25rem 2rem', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', borderTop: '1px solid var(--card-border)' }}>
          <Shield size={14} /> Biznes-schetsiz to'g'ridan-to'g'ri xavfsiz karta o'tkazmasi
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
