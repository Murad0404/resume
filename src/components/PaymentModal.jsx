import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, CheckCircle, AlertCircle, Copy, Upload, Lock, Clock } from 'lucide-react';
import { otpService } from '../services/otpService';

const BOT_TOKEN = '8697069079:AAHKkQ6FDAQ4q5hSx6UKoCUmoQjvPZl5d74';
const CHAT_ID = '635476813';

// Generate a short unique payment ID
const generatePayId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'PAY-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

// Admin Card Details
const ADMIN_CARD = '5614 6887 0698 1320';
const ADMIN_HOLDER = 'MURODJON DADABOEV';

const PaymentModal = ({ isOpen, onClose, onSuccess, itemTitle, itemPrice, itemId, itemType }) => {
  const [step, setStep] = useState('p2p'); // 'p2p' | 'uploading' | 'pending' | 'success'
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [approvalCode, setApprovalCode] = useState('');
  const [approvalError, setApprovalError] = useState('');

  const session = otpService.getSession();

  useEffect(() => {
    if (isOpen) {
      // Check if already purchased or pending
      const existingStatus = localStorage.getItem(`payment_status_${itemId}`);
      if (existingStatus === 'approved') {
        setStep('success');
        return;
      }
      if (existingStatus === 'pending') {
        // Recover payment ID if available
        const requests = JSON.parse(localStorage.getItem('payment_requests') || '[]');
        const existing = requests.find(r => r.itemId === itemId && r.userId === (session?.contact || 'anonymous') && r.status === 'pending');
        if (existing) {
          setPaymentId(existing.id);
          setStep('pending');
          return;
        }
      }
      setStep('p2p');
      setSelectedFile(null);
      setPreviewUrl('');
      setError('');
      setApprovalCode('');
      setApprovalError('');
      setCopied(false);
      setLoading(false);
      const newId = generatePayId();
      setPaymentId(newId);
    }
  }, [isOpen, itemId]);

  // Check if already pending for this item (prevent duplicates)
  const isAlreadyPending = () => {
    const requests = JSON.parse(localStorage.getItem('payment_requests') || '[]');
    return requests.some(r =>
      r.itemId === itemId &&
      r.userId === (session?.contact || 'anonymous') &&
      r.status === 'pending'
    );
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(ADMIN_CARD.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(paymentId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Iltimos, to'lov chekini (screenshot) yuklang.");
      return;
    }

    // Prevent duplicate submissions
    if (isAlreadyPending()) {
      setStep('pending');
      return;
    }

    setLoading(true);
    setError('');
    setStep('uploading');

    const currentPayId = paymentId || generatePayId();
    setPaymentId(currentPayId);

    // Save to localStorage FIRST (before any network calls)
    const newRequest = {
      id: currentPayId,
      userId: session?.contact || 'anonymous',
      userName: session?.name || 'Foydalanuvchi',
      itemId: itemId,
      itemTitle: itemTitle,
      itemPrice: itemPrice,
      itemType: itemType,
      receiptImage: previewUrl,
      status: 'pending',
      time: new Date().toLocaleString('uz-UZ')
    };

    const existingStored = localStorage.getItem('payment_requests');
    const list = existingStored ? JSON.parse(existingStored) : [];
    list.push(newRequest);
    localStorage.setItem('payment_requests', JSON.stringify(list));
    localStorage.setItem(`payment_status_${itemId}`, 'pending');

    // Send to Telegram (best effort — don't block on failure)
    try {
      const caption = [
        `🧾 YANGI TO'LOV SO'ROVI`,
        ``,
        `🆔 To'lov ID: ${currentPayId}`,
        `👤 Foydalanuvchi: ${session?.name || 'Noma\'lum'}`,
        `📞 Aloqa: ${session?.contact || 'Noma\'lum'}`,
        `📦 Mahsulot: ${itemTitle}`,
        `💵 Narxi: ${itemPrice}`,
        `🗓️ Vaqt: ${new Date().toLocaleString('uz-UZ')}`,
        ``,
        `✅ TASDIQLASH UCHUN:`,
        `Admin panelida "${currentPayId}" ID li so'rovni tasdiqlang`,
        `YOKI foydalanuvchiga ushbu kodni yuboring: ${currentPayId}`,
      ].join('\n');

      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('photo', selectedFile);
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');

      await Promise.race([
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: formData }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000))
      ]);
    } catch (err) {
      // Telegram failed — that's OK, we already saved locally
      console.warn("Telegram notification failed (non-critical):", err);
    }

    // Also try Supabase silently
    try {
      const { supabase } = await import('../utils/supabaseClient');
      if (supabase) {
        await supabase.from('payment_requests').insert([{
          id: newRequest.id,
          user_id: newRequest.userId,
          user_name: newRequest.userName,
          item_id: newRequest.itemId,
          item_title: newRequest.itemTitle,
          item_price: newRequest.itemPrice,
          item_type: newRequest.itemType,
          receipt_image: newRequest.receiptImage,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);
      }
    } catch (dbErr) {
      // Supabase not configured — OK
    }

    setLoading(false);
    setStep('pending');
  };

  // Admin approval code verification
  const handleVerifyCode = (e) => {
    e.preventDefault();
    const code = approvalCode.trim().toUpperCase();

    if (!code) {
      setApprovalError("Kodni kiriting");
      return;
    }

    // Check if the entered code matches any approved payment for this item
    // Admin sends the paymentId back to user as "approval code"
    const requests = JSON.parse(localStorage.getItem('payment_requests') || '[]');
    const matchIndex = requests.findIndex(r => r.id === code && r.itemId === itemId);

    if (matchIndex !== -1) {
      // Approve it
      requests[matchIndex].status = 'approved';
      localStorage.setItem('payment_requests', JSON.stringify(requests));
      localStorage.setItem(`purchased_${itemId}`, 'true');
      localStorage.setItem(`purchased_${itemId}_at`, Date.now().toString());
      localStorage.setItem(`payment_status_${itemId}`, 'approved');

      if (itemType === 'prompt') {
        localStorage.setItem('hasPurchasedPrompts', 'true');
      }

      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2500);
    } else {
      // Also check if admin already approved via Supabase (payment_status in localStorage might be updated)
      const currentStatus = localStorage.getItem(`payment_status_${itemId}`);
      if (currentStatus === 'approved') {
        setStep('success');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2500);
      } else {
        setApprovalError("Kod noto'g'ri. Admin tomonidan yuborilgan kodni kiriting.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step === 'uploading' ? undefined : onClose}
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
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Xavfsiz To'lov</h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{itemTitle}</p>
          </div>
          {step !== 'uploading' && (
            <button onClick={onClose} style={{ background: 'var(--card-bg-hover)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <div style={{ padding: '2rem' }}>
          <AnimatePresence mode="wait">

            {/* STEP 1: P2P Payment Form */}
            {step === 'p2p' && (
              <motion.div key="p2p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {/* Price */}
                <div style={{ background: 'var(--bg-color)', padding: '1.25rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--card-border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>To'lov miqdori:</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent)' }}>{itemPrice}</span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem', textAlign: 'center' }}>
                  To'lovni amalga oshirish uchun quyidagi kartaga pul o'tkaring, so'ng chek rasmini yuklang. Tasdiqlangach kirish ochiladi.
                </p>

                {/* Card */}
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
                      {copied ? "✓ Nusxalandi!" : <><Copy size={14} /> Nusxa</>}
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
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >✕</button>
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

            {/* STEP 2: Uploading */}
            {step === 'uploading' && (
              <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ width: 56, height: 56, border: '4px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 2rem auto', animation: 'spin 1s linear infinite' }} />
                <h3 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Chek yuborilmoqda...</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Iltimos, sahifani yopmang.</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </motion.div>
            )}

            {/* STEP 3: Pending — waiting for admin */}
            {step === 'pending' && (
              <motion.div key="pending" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <Clock size={40} />
                </div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 800 }}>Chek qabul qilindi!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  To'lovingiz admin ko'rib chiqmoqda. Tasdiqlangach, admin sizga <strong>tasdiqlash kodi</strong> yuboradi. Kodni quyida kiriting.
                </p>

                {/* Payment ID display */}
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sizning to'lov ID:</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '2px', color: '#f59e0b' }}>{paymentId}</div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.2s' }}
                  >
                    {copiedCode ? '✓ Nusxalandi' : <><Copy size={12} style={{ display: 'inline', marginRight: '4px' }} />Nusxa</>}
                  </button>
                </div>

                {/* Approval Code Input */}
                <form onSubmit={handleVerifyCode}>
                  <div style={{ marginBottom: '0.75rem', textAlign: 'left' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                      <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Admin tasdiqlash kodini kiriting:
                    </label>
                    <input
                      type="text"
                      value={approvalCode}
                      onChange={e => { setApprovalCode(e.target.value.toUpperCase()); setApprovalError(''); }}
                      placeholder="Masalan: PAY-AB12CD"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        background: 'var(--bg-color)',
                        border: `1px solid ${approvalError ? '#ef4444' : 'var(--card-border)'}`,
                        color: 'var(--text-main)',
                        fontFamily: 'monospace',
                        fontSize: '1rem',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {approvalError && (
                      <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertCircle size={12} /> {approvalError}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="submit-form-btn" style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} /> Kirish imkoniyatini ochish
                  </button>
                </form>

                <button
                  onClick={onClose}
                  style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                >
                  Keyinroq kirish
                </button>
              </motion.div>
            )}

            {/* STEP 4: Success */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <CheckCircle size={40} />
                </div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.35rem', fontWeight: 800 }}>To'lov tasdiqlandi!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Tabriklaymiz! Kirish muvaffaqiyatli ochildi. Endi kontentdan foydalanishingiz mumkin.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 2rem', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', borderTop: '1px solid var(--card-border)' }}>
          <Shield size={14} /> Xavfsiz P2P to'lov • Admin tomonidan tekshiriladi
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
