import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import project1Img from '../assets/project1.png';
import project2Img from '../assets/project2.png';
import { useLanguage } from '../contexts/LanguageContext';

const projectsData = {
  datagaze: {
    id: 1, // Matches translations projectsData items
    title: 'DATAGAZE / Updive',
    role: 'Middle UX/UI Engineer',
    duration: '2023 - Present',
    image: project1Img,
    tech: ['Figma', 'UX Research', 'Design Systems', 'Data Vis']
  },
  miobeauty: {
    id: 6, // Matches translations
    title: 'MIO BEAUTY',
    role: 'Java Developer',
    duration: '2022 - 2023',
    image: project2Img,
    tech: ['Java 21', 'Spring Boot', 'PostgreSQL', 'Docker']
  }
};

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projectsData[id];
  const { t } = useLanguage();

  if (!project) return <div className="bento-wrapper" style={{textAlign:'center', marginTop: '10rem'}}><h2>{t.nav?.work === 'Work' ? 'Not Found' : t.nav?.work === 'Работы' ? 'Не найдено' : 'Topilmadi'}</h2></div>;

  const translatedProject = t.projectsData?.items?.[project.id];
  const overview = translatedProject?.description || '';
  const outcome = translatedProject?.highlights?.join(', ') || '';

  return (
    <div className="bento-wrapper">
      <Link to="/" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 600}}>
        <ArrowLeft size={20} /> {t.nav?.work === 'Work' ? 'Back' : t.nav?.work === 'Работы' ? 'Назад' : 'Orqaga'}
      </Link>
      
      <motion.div 
        className="bento-grid"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bento-box bento-hero" style={{gridColumn: 'span 4', flexDirection: 'column', gap: '2rem'}}>
          <span className="project-tag" style={{color: 'var(--accent)', fontWeight: 800, fontSize: '1rem'}}>{project.role} | {project.duration}</span>
          <h1 className="hero-title">{project.title}</h1>
          <p className="hero-subtitle" style={{maxWidth: '800px'}}>{overview}</p>
        </div>

        <div className="bento-box" style={{gridColumn: 'span 4', padding: 0}}>
          <img src={project.image} alt={project.title} style={{width: '100%', height: '600px', objectFit: 'cover', display: 'block'}} />
        </div>

        <div className="bento-box" style={{gridColumn: 'span 2'}}>
          <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)'}}>{t.nav?.work === 'Work' ? 'Technologies' : t.nav?.work === 'Работы' ? 'Технологии' : 'Texnologiyalar'}</h3>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
            {project.tech.map(t => (
              <span key={t} style={{padding: '0.5rem 1rem', background: 'var(--card-bg-hover)', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 500}}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="bento-box" style={{gridColumn: 'span 2'}}>
          <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)'}}>{t.nav?.work === 'Work' ? 'Highlights' : t.nav?.work === 'Работы' ? 'Ключевые моменты' : 'Asosiy jihatlar'}</h3>
          <p style={{color: 'var(--text-muted)', lineHeight: 1.6}}>{outcome}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetail;
