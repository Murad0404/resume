import React from 'react';
import { motion } from 'framer-motion';

import project1Img from '../assets/project1.png';
import project2Img from '../assets/project2.png';

const PerspectiveScroller = () => {
  const images = [project1Img, project2Img, project1Img]; // Repeats for demo

  return (
    <div className="perspective-container">
      <div className="section-meta mb-12">
        <span className="section-number">03</span>
        <span className="section-label">/ EXPERIMENTAL BROWSE</span>
      </div>
      <div className="scroller-wrapper">
        {images.map((img, i) => (
          <motion.div 
            key={i}
            className="perspective-item"
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <img src={img} alt="Gallery" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PerspectiveScroller;
