import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X, Globe, Layers, Code, Play, Send, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useModal } from '../contexts/ModalContext';

import mioBeautyImg from '../assets/brands/mio-beauty.png';
import datagazeImg from '../assets/brands/datagaze.png';
import updiveBrandImg from '../assets/brands/updive.png';
import kpiImg from '../assets/brands/kpi.png';
import datasiteImg from '../assets/brands/datasite.png';
import ahmadTea1 from '../assets/ahmadtea/ahmad-new.jpg';
const Home = () => {
  const { t } = useLanguage();
  const { openContactModal } = useModal();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [profileImageIndex, setProfileImageIndex] = useState(0);

  const profileImages = ["/profile.jpg", "/profile_murod.png"];

  const languages = [
    { name: t.langs?.uz || "O'zbek tili", level: t.langs?.native || "Ona tilim", flag: "🇺🇿", bar: 100, color: "#22c55e" },
    { name: t.langs?.ru || "Rus tili",    level: "B1",        flag: "🇷🇺", bar: 60,  color: "#5a6bfa" },
    { name: t.langs?.en || "Ingliz tili", level: "A1",        flag: "🇬🇧", bar: 25,  color: "#f59e0b" },
  ];

  const tools = [
    { category: t.langs?.uz === "O'zbek tili" ? 'Backend va Ma\'lumotlar Bazasi' : t.langs?.ru === "Узбекский" ? 'Бэкенд и БД' : 'Backend & DB', items: ['Java', 'Java EE', 'Spring Boot', 'Spring Framework', 'Hibernate', 'GWT', 'SQL', 'PostgreSQL'] },
    { category: t.langs?.uz === "O'zbek tili" ? 'Mahsulot Dizayni' : t.langs?.ru === "Узбекский" ? 'Продуктовый Дизайн' : 'Product Design', items: ['Figma', 'Framer', 'Web Design', 'UX Research', 'A/B Tests'] },
    { category: t.langs?.uz === "O'zbek tili" ? 'Grafika va Animatsiya' : t.langs?.ru === "Узбекский" ? 'Графика и Анимация' : 'Graphic & Motion', items: ['Adobe Photoshop', 'Adobe Illustrator', 'CapCut', 'AI'] },
    { category: t.langs?.uz === "O'zbek tili" ? 'DevOps va Dasturlash' : t.langs?.ru === "Узбекский" ? 'DevOps и Разработка' : 'DevOps & Development', items: ['Git', 'GitLab', 'GitHub', 'CI/CD', 'Docker', 'Web Programming', 'HTML', 'CSS'] }
  ];

  const homeProjects = [
    { id: 10, tag: 'UX/UI DESIGN',   title: 'UPDIVE',               desc: 'Enterprise Dashboard',  link: '/projects', img: updiveBrandImg },
    { id: 1,  tag: 'MIDDLE UX/UI',   title: 'DATAGAZE',             desc: t.stats?.cyber || 'Cybersecurity UX/UI', link: '/projects', img: datagazeImg },
    { id: 6,  tag: 'JAVA ENGINEER',  title: 'MIO BEAUTY',          desc: 'REST API Backend',      link: '/projects', img: mioBeautyImg },
    { id: 4,  tag: 'JAVA DEVELOPER', title: 'KPI.com',              desc: 'ERP Module Development', link: '/projects', img: kpiImg },
    { id: 5,  tag: 'GRAPHIC DESIGN', title: 'Ahmad Tea',            desc: 'Social Media Visuals',   link: '/projects', img: ahmadTea1 },
    { id: 7,  tag: 'GRAPHIC DESIGN', title: 'Datasite Technology',  desc: 'Graphic Design',         link: '/projects', img: datasiteImg },
  ];

  return (
    <div className="bento-wrapper">
      <motion.div 
        className="bento-grid"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, staggerChildren: 0.1 }}
      >
        {/* HERO */}
        <motion.div className="bento-box bento-hero">
          <div className="hero-text-content">
            <h1 className="hero-title">{t.hero.title} <br/> <span style={{color: 'var(--accent)'}}>{t.hero.subtitle}</span></h1>
            <p className="hero-subtitle">{t.hero.bio}</p>
            <div className="hero-socials">
              <a href="https://t.me/Murod_22_24" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="Telegram">
                <Send size={20} />
              </a>
              <a href="https://linkedin.com/in/murod-dadaboev" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://medium.com/@murod_dadaboev" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="Medium">
                <FileText size={20} />
              </a>
            </div>
          </div>
          {/* Profile image — click to open lightbox */}
          <div
            className="hero-image-wrapper"
            onClick={() => setLightboxOpen(true)}
            style={{ cursor: 'pointer', position: 'relative' }}
            title="Rasmni to'liq ko'rish"
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={profileImageIndex}
                src={profileImages[profileImageIndex]} 
                alt="Murod Dadaboev" 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
            <div 
              className="image-switch-badge" 
              onClick={(e) => {
                e.stopPropagation();
                setProfileImageIndex(prev => (prev + 1) % profileImages.length);
              }}
              title="Rasmni almashtirish"
            >
              <Layers size={14} fill="currentColor" />
            </div>
          </div>
        </motion.div>

        {/* YEARS EXP */}
        <motion.div className="bento-box bento-stat">
          <span className="stat-num">6+</span>
          <span className="stat-desc">{t.stats.exp}</span>
        </motion.div>

        {/* TECH */}
        <motion.div 
          className="bento-box bento-stat"
          onClick={() => setToolsModalOpen(true)}
          style={{ cursor: 'pointer', position: 'relative' }}
          whileHover={{ scale: 1.02 }}
          title={t.stats?.tools || "Texnologiyalar"}
        >
          <span className="stat-num">20+</span>
          <span className="stat-desc">{t.stats.tools}</span>
          <Code size={16} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.4 }} />
        </motion.div>

        {/* PROJECTS TO GRID */}
        {homeProjects.map(p => (
          <motion.div key={p.id} className={`bento-box bento-project project-${p.id}`}>
            <div className="project-img-wrapper" style={!p.img ? { background: 'var(--card-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}>
              {p.img ? (
                <img src={p.img} alt={p.title} />
              ) : (
                <div style={{ opacity: 0.3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Layers size={48} />
                  <span style={{ marginTop: '1rem', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 'bold' }}>NO PREVIEW</span>
                </div>
              )}
            </div>
            <div className="project-content">
              <span className="project-tag">{p.tag}</span>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-desc">{p.desc}</p>
                </div>
                <Link to={p.link} style={{color: 'var(--text-main)'}}>
                  <ArrowUpRight size={24}/>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}

        {/* TEXT HIGHLIGHT */}
        <motion.div className="bento-box bento-text">
          <p>{t.hero.highlight}</p>
        </motion.div>

        {/* LANGS — click to show language levels */}
        <motion.div
          className="bento-box bento-stat"
          onClick={() => setLangModalOpen(true)}
          style={{ cursor: 'pointer', position: 'relative' }}
          whileHover={{ scale: 1.02 }}
          title="Tillarni ko'rish"
        >
          <span className="stat-num">3x</span>
          <span className="stat-desc">{t.stats.global}</span>
          <Globe size={16} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.4 }} />
        </motion.div>

        {/* CONTACT */}
        <motion.div className="bento-box bento-contact">
          <h2>{t.hero.contactTitle}</h2>
          <button onClick={openContactModal} className="nav-cta" style={{background: 'var(--bg-color)', color: 'var(--text-main) !important', padding: '1rem 2rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem'}}>
            {t.nav.contact} <ArrowUpRight size={18} style={{marginLeft: 8, verticalAlign: 'middle'}}/>
          </button>
        </motion.div>

      </motion.div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              className="lightbox-inner"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
                <X size={22} />
              </button>
              <img src={profileImages[profileImageIndex]} alt="Murod Dadaboev" className="lightbox-img" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LANGUAGE MODAL ── */}
      <AnimatePresence>
        {langModalOpen && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLangModalOpen(false)}
          >
            <motion.div
              className="lang-modal"
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <button className="lightbox-close" onClick={() => setLangModalOpen(false)}>
                <X size={20} />
              </button>
              <h3 className="lang-modal-title" style={{marginBottom: '2rem'}}>🌍 {t.langs?.modalTitle || "Til darajalari"}</h3>
              <div className="lang-list">
                {languages.map((l, i) => (
                  <motion.div
                    key={l.name}
                    className="lang-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                  >
                    <div className="lang-row">
                      <span className="lang-flag">{l.flag}</span>
                      <span className="lang-name">{l.name}</span>
                      <span className="lang-level-badge" style={{ background: `${l.color}22`, color: l.color, border: `1px solid ${l.color}44` }}>
                        {l.level}
                      </span>
                    </div>
                    <div className="lang-bar-track">
                      <motion.div
                        className="lang-bar-fill"
                        style={{ background: l.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${l.bar}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOOLS MODAL ── */}
      <AnimatePresence>
        {toolsModalOpen && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setToolsModalOpen(false)}
          >
            <motion.div
              className="lang-modal"
              style={{ maxWidth: '600px', width: '90%' }}
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <button className="lightbox-close" onClick={() => setToolsModalOpen(false)}>
                <X size={20} />
              </button>
              <h3 className="lang-modal-title" style={{marginBottom: '2rem'}}><Code size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} /> {t.stats?.tools || "Texnologiyalar"}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {tools.map((section, idx) => (
                  <motion.div 
                    key={section.category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 + 0.1 }}
                  >
                    <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {section.category}
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                      {section.items.map(item => (
                        <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Play size={10} style={{ opacity: 0.3, color: 'var(--accent)' }} /> {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
