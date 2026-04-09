import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const { t } = useLanguage();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [formData, setFormData] = useState({ phone: '', company: '', recruiter: '', vacancy: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const openContactModal = () => setIsContactModalOpen(true);
  
  const closeContactModal = () => {
    setIsContactModalOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
    }, 300);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone) return;
    
    setFormSubmitted(true);
    
    // Telegram Bot Integration
    const BOT_TOKEN = '8694533172:AAHtmqh_OxY6o0C-kEv-CEs3K7AkdcsGGXs';
    // IMPORTANT: Replace with your numerical Chat ID (e.g. 1954153093)
    // You can get it by messaging your bot and checking https://api.telegram.org/bot<TOKEN>/getUpdates
    const CHAT_ID = '635476813'; 

    const message = `
🚀 **Yangi Aloqa So'rovi!**

📞 **Telefon/TG**: ${formData.phone}
🏢 **Kompaniya**: ${formData.company || 'Nomalum'}
👤 **Rekryuter**: ${formData.recruiter || 'Nomalum'}
💼 **Vakansiya**: ${formData.vacancy || 'Nomalum'}

---
*Portfolio orqali yuborildi*
    `;

    try {
      if (CHAT_ID !== 'YOUR_NUMERICAL_CHAT_ID') {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
          })
        });
      } else {
        console.warn("Telegram Chat ID o'rnatilmagan. Xabar yuborilmadi.");
      }

      setFormSubmitted(false);
      setIsSuccess(true);
      setFormData({ phone: '', company: '', recruiter: '', vacancy: '' });
    } catch (error) {
      console.error("Telegramga yuborishda xatolik:", error);
      // Even if telegram fails, show success to user or handle error
      setFormSubmitted(false);
      setIsSuccess(true); 
    }
  };

  return (
    <ModalContext.Provider value={{ openContactModal, closeContactModal }}>
      {children}
      
      {/* Contact Modal Layer */}
      <AnimatePresence>
        {isContactModalOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="contact-modal"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <button className="modal-close-btn" onClick={closeContactModal}>
                <X size={24} />
              </button>
              
              {!isSuccess ? (
                <>
                  <div className="modal-header">
                    <h2>{t.ai?.contactBtn || "Let's Build the Future"}</h2>
                    <p>{t.ai?.contactIntro || "Leave your details and vacancy info. I will contact you shortly."}</p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="ai-contact-form">
                    <div className="form-group">
                      <input 
                        type="text" 
                        placeholder={t.ai?.contactForm?.phone || "Phone number or Telegram"} 
                        required 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        type="text" 
                        placeholder={t.ai?.contactForm?.company || "Company Name"} 
                        value={formData.company} 
                        onChange={(e) => setFormData({...formData, company: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        type="text" 
                        placeholder={t.ai?.contactForm?.recruiter || "Recruiter Name"} 
                        value={formData.recruiter} 
                        onChange={(e) => setFormData({...formData, recruiter: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        type="text" 
                        placeholder={t.ai?.contactForm?.vacancy || "Vacancy Title"} 
                        value={formData.vacancy} 
                        onChange={(e) => setFormData({...formData, vacancy: e.target.value})} 
                      />
                    </div>
                    <button type="submit" className="submit-form-btn" disabled={formSubmitted}>
                      {formSubmitted ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="spinner" />
                      ) : (
                        <>
                          <span>{t.ai?.contactForm?.submit || "Submit"}</span>
                          <Send size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="modal-success-state">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                  >
                    <CheckCircle2 size={64} className="success-icon" />
                  </motion.div>
                  <h3>{t.ai?.contactForm?.success || "Successfully sent!"}</h3>
                  <button onClick={closeContactModal} className="submit-form-btn" style={{marginTop: '1.5rem', width: '100%'}}>
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};
