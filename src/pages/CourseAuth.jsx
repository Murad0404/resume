import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const CourseAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await login(email, password);
        if (error) throw error;
        navigate('/course-dashboard');
      } else {
        const { error } = await register(email, password, phone, name);
        if (error) throw error;
        navigate('/course-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="bento-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <button className="nav-cta" onClick={() => navigate(-1)} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> {lang === 'uz' ? 'Ortga' : lang === 'ru' ? 'Назад' : 'Back'}
      </button>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="bento-box" style={{ padding: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="hero-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {isLogin 
                ? (lang === 'uz' ? 'Tizimga kirish' : lang === 'ru' ? 'Вход в систему' : 'Sign In') 
                : (lang === 'uz' ? "Ro'yxatdan o'tish" : lang === 'ru' ? 'Регистрация' : 'Sign Up')}
            </h1>
            <p className="hero-subtitle">{lang === 'uz' ? 'Kurs paneli uchun avtorizatsiya' : lang === 'ru' ? 'Авторизация для панели курсов' : 'Authorization for the course panel'}</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="ai-contact-form" style={{ marginTop: 0 }}>
            {!isLogin && (
              <>
                <div className="form-group" style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder={lang === 'uz' ? 'Ismingiz' : lang === 'ru' ? 'Ваше имя' : 'Your name'} 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    style={{ paddingLeft: '2.8rem' }}
                    required 
                  />
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="tel" 
                    placeholder={lang === 'uz' ? 'Telefon raqam (+998...)' : lang === 'ru' ? 'Номер телефона (+998...)' : 'Phone number (+998...)'} 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    style={{ paddingLeft: '2.8rem' }}
                    required 
                  />
                </div>
              </>
            )}

            <div className="form-group" style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder={lang === 'uz' ? 'Email pochta' : lang === 'ru' ? 'Электронная почта' : 'Email address'} 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ paddingLeft: '2.8rem' }}
                required 
              />
            </div>

            <div className="form-group" style={{ position: 'relative', marginTop: '0.25rem' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder={lang === 'uz' ? 'Parol' : lang === 'ru' ? 'Пароль' : 'Password'} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ paddingLeft: '2.8rem' }}
                required 
                minLength={6}
              />
            </div>

            <button type="submit" className="submit-form-btn" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? <div className="spinner" /> : (
                <>
                  {isLogin 
                    ? (lang === 'uz' ? 'Kirish' : lang === 'ru' ? 'Войти' : 'Sign In') 
                    : (lang === 'uz' ? "Ro'yxatdan o'tish" : lang === 'ru' ? 'Зарегистрироваться' : 'Sign Up')} 
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
            >
              {isLogin 
                ? (lang === 'uz' ? "Akkauntingiz yo'qmi? Ro'yxatdan o'ting" : lang === 'ru' ? "Нет аккаунта? Зарегистрируйтесь" : "Don't have an account? Sign Up") 
                : (lang === 'uz' ? "Akkauntingiz bormi? Kirish" : lang === 'ru' ? "Есть аккаунт? Войти" : "Already have an account? Sign In")}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseAuth;
