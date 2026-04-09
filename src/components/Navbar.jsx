import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Download, Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useModal } from '../contexts/ModalContext';

const Navbar = () => {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { openContactModal } = useModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    if (lang === 'uz') setLang('ru');
    else if (lang === 'ru') setLang('en');
    else setLang('uz');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="MD Logo" style={{ height: '48px', width: 'auto' }} />
          <span>Dadaboev Murod</span>
        </Link>
        
        {/* Hamburger Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'mobile-active' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>{t.nav.work}</Link>
          <Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>{t.nav.projects}</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>{t.nav.about}</Link>
          
          <div className="nav-actions">
            <button onClick={toggleLang} className="lang-toggle">
              <Globe size={16} style={{marginRight: '0.3rem'}}/> {lang.toUpperCase()}
            </button>

            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          
          <a 
            href="https://tashkent.hh.uz/resume/f3ee4db4ff0ff3b8e40039ed1f594473697567" 
            target="_blank" 
            rel="noopener noreferrer"
            className="resume-btn"
          >
            <Download size={16} /> {t.nav.resume}
          </a>
          
          <button 
            onClick={() => { openContactModal(); setIsMenuOpen(false); }} 
            className="nav-cta" 
            style={{border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem'}}
          >
            {t.nav.contact}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
