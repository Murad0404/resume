import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ExternalLink, X, Layers, Smartphone, Monitor, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Faol images
import faolImage1 from '../assets/faol/new-image-1.png';
import faolImage2 from '../assets/faol/new-image-2.png';
import faolImage3 from '../assets/faol/new-image-3.png';
import faolImage4 from '../assets/faol/new-image-4.png';
import faolImage5 from '../assets/faol/new-image-5.jpg';

// Updive SIEM images
import updiveSiem1 from '../assets/updive/updive-1.png';
import updiveSiem2 from '../assets/updive/updive-2.png';
import updiveSiem3 from '../assets/updive/updive-3.png';

// Updive EDR images
import updiveEdr1 from '../assets/updive/edr-1.png';
import updiveEdr2 from '../assets/updive/edr-2.png';
import updiveEdr3 from '../assets/updive/edr-3.png';

// Ahmad Tea images
import ahmadTea1 from '../assets/ahmadtea/ahmad-1.jpg';
import ahmadTea2 from '../assets/ahmadtea/ahmad-2.jpg';

const FAOL_FIGMA = 'https://www.figma.com/design/heVsSmhOoLoCY1Z4BVSOg0/Untitled?node-id=13-1876&t=Z9jTcPD0gfyc3D1w-1';
const UPDIVE_SIEM_FIGMA = 'https://www.figma.com/design/MGfu2i3H8fN88KBDu1sTUw/Untitled?node-id=140-25525&t=2RIynajXfujjD3eR-1';
const UPDIVE_EDR_FIGMA = 'https://www.figma.com/design/rAMv4ycG3GNvNBfCWzQTsi/EDR?node-id=8-8187&t=hYOovscMRwHTXTgl-1';

const projectsData = [
  {
    id: 1,
    title: 'Updive — SIEM Platform',
    category: 'UX/UI Design',
    type: 'Enterprise Web',
    icon: <Monitor size={20} />,
    description: 'Kiberxavfsizlik platformasi uchun kompleks dashboard dizayni. SOC-analitiklar bilan bevosita ishlash orqali real workflow uchun optimallashtirilgan.',
    tags: ['Figma', 'UX Research', 'Dashboard', 'SIEM', 'DLP'],
    color: '#5a6bfa',
    status: 'Completed',
    year: '2025–2026',
    highlights: [
      'Incident boshqaruv dashboardi',
      'Real-time alert visualization',
      'SOC analyst workflow optimization',
      'Dark-first design system',
    ],
    images: [updiveSiem1, updiveSiem2, updiveSiem3],
    figmaUrl: UPDIVE_SIEM_FIGMA,
  },
  {
    id: 'faol',
    title: 'Faol — Sports Booking App',
    category: 'Full-Stack Product',
    type: 'Mobile App',
    icon: <Smartphone size={20} />,
    description: "O'zbekistonda sport maydonlarini bron qilish uchun to'liq mahsulot. Backend Java'da, mobil ilova React Native'da, UI/UX dizayn Figma'da — barchasi o'zim tomonidan yaratilgan.",
    tags: ['React Native', 'Java', 'Spring Boot', 'Figma', 'UX/UI'],
    color: '#22c55e',
    status: 'In Progress',
    year: '2025–Present',
    highlights: [
      "Maydon va yer bron qilish tizimi",
      'Real-time xarita integratsiyasi',
      'Java backend + REST API',
      "To'liq UI/UX dizayn sistema",
      'Faol Market & Faol Yo\'lda modullari',
    ],
    images: [faolImage1, faolImage2, faolImage3, faolImage4, faolImage5],
    figmaUrl: FAOL_FIGMA,
    isFeatured: true,
  },
  {
    id: 3,
    title: 'Updive — EDR Platform',
    category: 'UX/UI Design',
    type: 'Enterprise Web',
    icon: <Monitor size={20} />,
    description: "Endpoint qurilmalari holatini kuzatish va ilg'or tahdidlarni aniqlash uchun markazlashtirilgan EDR (Endpoint Detection and Response) platformasi paneli.",
    tags: ['Figma', 'UX Research', 'Dashboard', 'EDR', 'Security'],
    color: '#10b981',
    status: 'Completed',
    year: '2025',
    highlights: [
      'Unified security dashboard',
      'Advanced threat hunting componentlari',
      'Endpoint siyosatlarini boshqarish',
      'Dark-mode enterprise design',
    ],
    images: [updiveEdr1, updiveEdr2, updiveEdr3],
    figmaUrl: UPDIVE_EDR_FIGMA,
  },
  {
    id: 4,
    title: 'KPI.COM — Java Developer',
    category: 'Backend Engineering',
    type: 'Enterprise Web',
    icon: <Layers size={20} />,
    description: "Java dasturchi sifatida ERP tizimi uchun murakkab modullar, jumladan dinamik PDF va Excel hisobotlar generatsiya qilish tizimini ishlab chiqish va optimallashtirish.",
    tags: ['Java', 'Spring Boot', 'Apache Velocity', 'ERP', 'SQL', 'PostgreSQL'],
    color: '#a78bfa',
    status: 'Completed',
    year: '2024–2025',
    highlights: [
      'ERP tizimi modullarini ishlab chiqish',
      'Dynamic PDF/Excel generation',
      'Apache Velocity templating',
      'Tizim samaradorligini oshirish',
    ],
    images: [],
    figmaUrl: null,
  },
  {
    id: 5,
    title: 'Ahmad Tea — Social Media Visuals',
    category: 'Graphic Design',
    type: 'Brand Design',
    icon: <Palette size={20} />,
    description: "Ahmad Tea brendi uchun ijtimoiy tarmoqlarda ishlatiladigan reklama materiallari to'plami. Visual storytelling va brend identiyasiga mos dizaynlar.",
    tags: ['Photoshop', 'Illustrator', 'Branding', 'Social Media'],
    color: '#ec4899',
    status: 'Completed',
    year: '2023',
    highlights: [
      'Social media banner series',
      'Brand-consistent visuals',
      'Print-ready exports',
      'Campaign design',
    ],
    images: [ahmadTea1, ahmadTea2],
    figmaUrl: null,
    behanceUrl: 'https://www.behance.net/muroddadaboev',
    isFeatured: true,
  },
  {
    id: 6,
    title: 'MIO BEAUTY — REST API Backend',
    category: 'Backend Engineering',
    type: 'Web App',
    icon: <Layers size={20} />,
    description: "Go'zallik xizmatlari uchun web-ilova backend. Java 21 va REST API arxitekturasida qurilgan. Support tizimi va kichik online-trade platformasi.",
    tags: ['Java 21', 'Spring Boot', 'REST API', 'PostgreSQL'],
    color: '#06b6d4',
    status: 'Completed',
    year: '2025',
    highlights: [
      'REST API architecture',
      'Support ticket system',
      'Java 21 features',
      'Online trade module',
    ],
    images: [],
    figmaUrl: null,
  },
  {
    id: 7,
    title: 'Datasite Technology — Car Retouch & Graphics',
    category: 'Graphic Design',
    type: 'Professional Retouching',
    icon: <Palette size={20} />,
    description: "Chet el avtomobil kompaniyalari uchun professional retush va brending loyihalari. 4 yildan ortiq tajriba davomida yuzlab mashinalar rasmlari va grafik dizayn ishlari tayyorlangan.",
    tags: ['Photoshop', 'Retouching', 'Car Design', 'Graphic Design'],
    color: '#34d399',
    status: 'Completed',
    year: '2019–2023',
    highlights: [
      'Chet el bozorlari uchun mashina retushi',
      'Professional rang korreksiyasi va editing',
      'Yuqori sifatli grafik dizayn va branding',
      '4+ yillik tijoriy tajriba',
    ],
    images: [],
    behanceUrl: 'https://www.behance.net/muroddadaboev',
  },
];

const categoryFilters = ['Barchasi', 'UX/UI Design', 'Backend Engineering', 'Full-Stack Product', 'Graphic Design'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } },
};

/* ───── IMAGE GALLERY ───── */
const ImageGallery = ({ images, color }) => {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) return null;

  const prev = () => setActive(i => (i - 1 + images.length) % images.length);
  const next = () => setActive(i => (i + 1) % images.length);

  return (
    <div className="pm-gallery">
      <div className="pm-gallery-main">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={`preview-${active}`}
            className="pm-gallery-img"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button className="pm-gallery-nav prev" onClick={prev}>
              <ChevronLeft size={20} />
            </button>
            <button className="pm-gallery-nav next" onClick={next}>
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="pm-gallery-counter">
          {active + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="pm-gallery-thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              className={`pm-gallery-thumb ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
              style={{ borderColor: i === active ? color : 'transparent' }}
            >
              <img src={img} alt={`thumb-${i}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ───── PROJECT MODAL ───── */
const ProjectModal = ({ project, onClose, t }) => {
  if (!project) return null;
  const hasFigma = !!project.figmaUrl;
  const hasBehance = !!project.behanceUrl;
  const hasImages = project.images && project.images.length > 0;

  return (
    <motion.div
      className="project-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`project-modal ${hasImages ? 'project-modal--wide' : ''}`}
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-accent-line" style={{ background: project.color }} />
        <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>

        {/* Layout: wide = 2 col (gallery + info), narrow = 1 col */}
        <div className={hasImages ? 'pm-two-col' : ''}>

          {/* LEFT: Gallery */}
          {hasImages && (
            <div className="pm-gallery-col">
              <ImageGallery images={project.images} color={project.color} />

              {hasFigma && (
                <a
                  href={project.figmaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pm-figma-btn"
                  style={{ background: project.color }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z"/>
                    <path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z"/>
                    <path d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z"/>
                    <path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z"/>
                    <path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
                  </svg>
                  {t.nav?.work === 'Work' ? 'View on Figma' : t.nav?.work === 'Работы' ? 'Смотреть в Figma' : "Figma'da ko'rish"}
                  <ExternalLink size={14} />
                </a>
              )}
              {hasBehance && (
                <a
                  href={project.behanceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pm-figma-btn"
                  style={{ background: '#1769ff' }}
                >
                  {t.nav?.work === 'Work' ? 'View on Behance' : t.nav?.work === 'Работы' ? 'Смотреть в Behance' : "Behance'da ko'rish"}
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}

          {/* RIGHT: Info */}
          <div className="pm-info-col">
            <div className="pm-header">
              <div className="pm-icon" style={{ background: `${project.color}22`, color: project.color }}>
                {project.icon}
              </div>
              <div>
                <span className="pm-category" style={{ color: project.color }}>{project.category}</span>
                <h2 className="pm-title">{project.title}</h2>
              </div>
            </div>

            <div className="pm-meta">
              <span className={`pm-status ${project.status === 'In Progress' ? 'active' : ''}`}>
                <span className="pm-dot" style={{ background: project.status === 'In Progress' ? '#22c55e' : project.color }} />
                {project.status}
              </span>
              <span className="pm-year">{project.year}</span>
              <span className="pm-type">{project.type}</span>
            </div>

            <p className="pm-desc">{project.description}</p>

            <div className="pm-highlights">
              <h4>{t.nav?.work === 'Work' ? 'Key Highlights' : t.nav?.work === 'Работы' ? 'Ключевые моменты' : 'Asosiy jihatlar'}</h4>
              <ul>
                {project.highlights.map((h, i) => (
                  <li key={i}>
                    <span className="pm-check" style={{ color: project.color }}>✦</span> {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pm-tags">
              {project.tags.map(tag => (
                <span key={tag} className="pm-tag" style={{ borderColor: `${project.color}44`, color: project.color }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Figma button for narrow mode (no images) */}
            {hasFigma && !hasImages && (
              <a
                href={project.figmaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pm-figma-btn"
                style={{ background: project.color }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z"/>
                  <path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z"/>
                  <path d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z"/>
                  <path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z"/>
                  <path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
                </svg>
                {t.nav?.work === 'Work' ? 'View on Figma' : t.nav?.work === 'Работы' ? 'Смотреть в Figma' : "Figma'da ko'rish"}
                <ExternalLink size={14} />
              </a>
            )}
            {hasBehance && !hasImages && (
              <a
                href={project.behanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pm-figma-btn"
                style={{ background: '#1769ff' }}
              >
                {t.nav?.work === 'Work' ? 'View on Behance' : t.nav?.work === 'Работы' ? 'Смотреть в Behance' : "Behance'da ko'rish"}
                <ExternalLink size={14} />
              </a>
            )}

            {!hasImages && (
              <div className="pm-images-placeholder" style={{ marginTop: '1rem' }}>
                <Layers size={28} style={{ opacity: 0.3 }} />
                <p>{t.nav?.work === 'Work' ? 'Design preview coming soon' : t.nav?.work === 'Работы' ? 'Превью дизайна скоро появится' : "Dizayn preview tez orada qo'shiladi"}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ───── MAIN PAGE ───── */
const Projects = () => {
  const { t } = useLanguage();
  const [activeFilterIdx, setActiveFilterIdx] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  const translatedCategories = t.projectsData?.categories || categoryFilters;
  const activeFilter = translatedCategories[activeFilterIdx];

  const translatedProjects = projectsData.map(p => {
    const td = t.projectsData?.items?.[p.id];
    return td ? { ...p, ...td } : p;
  });

  const filtered = activeFilterIdx === 0
    ? translatedProjects
    : translatedProjects.filter(p => p.category === activeFilter);

  return (
    <motion.div
      className="projects-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="projects-header">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="projects-eyebrow">Portfolio</span>
          <h1 className="projects-title">
            <span className="projects-accent">{t.nav?.projects || 'Loyihalarim'}</span>
          </h1>
          <p className="projects-subtitle">
            {t.sections?.projectsDesc}
          </p>
        </motion.div>

        <motion.div className="projects-filters" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          {translatedCategories.map((f, i) => (
            <button key={f} className={`filter-chip ${activeFilterIdx === i ? 'active' : ''}`} onClick={() => setActiveFilterIdx(i)}>
              {f}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Grid */}
      <motion.div className="projects-grid" variants={containerVariants} initial="hidden" animate="visible" key={activeFilter}>
        {filtered.map(project => (
          <motion.div
            key={project.id}
            className={`project-card ${project.isFeatured ? 'project-card--featured' : ''}`}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            onClick={() => setSelectedProject(project)}
          >
            <div className="pc-accent" style={{ background: project.color }} />

            {/* Featured image preview for Faol */}
            {project.isFeatured && project.images.length > 0 && (
              <div className="pc-preview-img">
                <img src={project.images[0]} alt={project.title} />
                <div className="pc-preview-overlay" style={{ background: `linear-gradient(to bottom, transparent 30%, ${project.color}22 100%)` }} />
                {project.figmaUrl && (
                  <div className="pc-figma-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z"/>
                      <path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z"/>
                      <path d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z"/>
                      <path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z"/>
                      <path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
                    </svg>
                    Figma
                  </div>
                )}
                {project.behanceUrl && (
                  <div className="pc-figma-badge" style={{ background: '#1769ff', color: '#fff', borderColor: '#1769ff' }}>
                    <ExternalLink size={12} />
                    Behance
                  </div>
                )}
              </div>
            )}

            <div className="pc-body">
              <div className="pc-top">
                <div className="pc-icon" style={{ background: `${project.color}18`, color: project.color }}>
                  {project.icon}
                </div>
                <div className="pc-meta-right">
                  <span className={`pc-status ${project.status === 'In Progress' ? 'in-progress' : 'done'}`}>
                    {project.status}
                  </span>
                  <span className="pc-year">{project.year}</span>
                </div>
              </div>

              <span className="pc-category" style={{ color: project.color }}>{project.category}</span>
              <h3 className="pc-title">{project.title}</h3>
              <p className="pc-desc">{project.description}</p>

              <div className="pc-tags">
                {project.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="pc-tag">{tag}</span>
                ))}
                {project.tags.length > 3 && (
                  <span className="pc-tag-more">+{project.tags.length - 3}</span>
                )}
              </div>
            </div>

            <div className="pc-footer">
              <span className="pc-type">{project.type}</span>
              <span className="pc-open">
                {project.figmaUrl ? 'Figma' : project.behanceUrl ? 'Behance' : t.nav?.work === 'Work' ? 'Details' : t.nav?.work === 'Работы' ? 'Подробно' : 'Batafsil'} <ArrowUpRight size={16} />
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} t={t} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Projects;
