import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { ChevronRight, ArrowRight, Mail, MessageSquare, ExternalLink, ArrowLeft } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ModalProvider } from './contexts/ModalContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import AIChat from './components/AIChat';
import './App.css';

import { trackVisit } from './utils/analytics';

const PageViewTracker = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    trackVisit(pathname);
  }, [pathname]);
  
  return null;
};

const Layout = ({ children }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="app-main">
      <motion.div className="progress-bar" style={{ scaleX }} />
      <Navbar />
      <main>{children}</main>
      <AIChat />
      <footer className="footer">
        <p>© 2026 Dadaboev Murod. All rights reserved.</p>
        <div style={{display:'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem'}}>
          <a href="https://t.me/Murod_22_24" target="_blank" rel="noopener noreferrer">Telegram</a>
          <a href="https://www.linkedin.com/in/murod-dadaboev-057030209" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://medium.com/@muroddadaboev07" target="_blank" rel="noopener noreferrer">Medium</a>
          <a href="https://www.youtube.com/@myCodejourney_M/featured" target="_blank" rel="noopener noreferrer">YouTube</a>
        </div>
      </footer>

    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <ModalProvider>
        <Router>
          <PageViewTracker />
          <Layout>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
              </Routes>
            </AnimatePresence>
          </Layout>
        </Router>
      </ModalProvider>
    </LanguageProvider>
  );
};

export default App;
