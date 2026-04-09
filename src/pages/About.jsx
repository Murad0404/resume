import React from 'react';
import { motion } from 'framer-motion';
import { Send, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="bento-wrapper">
      <motion.div 
        className="bento-grid"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, staggerChildren: 0.1 }}
      >
        <motion.div className="bento-box bento-hero" style={{gridColumn: 'span 4', flexDirection: 'row', alignItems: 'center', gap: '4rem', padding: '4rem'}}>
          <div style={{flex: 1}}>
            <h1 className="hero-title">{t.about.title}</h1>
            <p className="hero-subtitle mt-4">{t.about.p1}</p>
            <p className="hero-subtitle mt-4">{t.about.p2}</p>
            <p className="hero-subtitle mt-4">{t.about.p3}</p>
            
            <div className="hero-socials mt-6">
              {/* Social icons removed per user request - available in Home/Work section */}
            </div>
          </div>
          
          <div className="hero-image-wrapper" style={{ flexShrink: 0 }}>
            <img src="/profile.jpg" alt="Murod Dadaboev" />
          </div>
        </motion.div>

        <motion.div className="bento-box bento-stat" style={{gridColumn: 'span 2'}}>
          <span className="stat-num">06+</span>
          <span className="stat-desc">{t.about.stats.exp}</span>
        </motion.div>

        <motion.div className="bento-box bento-stat" style={{gridColumn: 'span 1'}}>
          <span className="stat-num">20+</span>
          <span className="stat-desc">{t.about.stats.tools}</span>
        </motion.div>

        <motion.div className="bento-box bento-stat" style={{gridColumn: 'span 1'}}>
          <span className="stat-num">03</span>
          <span className="stat-desc">{t.about.stats.lang}</span>
        </motion.div>

        <motion.div className="bento-box bento-contact" style={{gridColumn: 'span 4', justifyContent: 'center'}}>
          <h2 style={{color: '#fff', fontSize: '2rem'}}>{t.about.location}</h2>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;
