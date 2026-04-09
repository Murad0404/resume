import React, { useState, useEffect, useRef } from 'react';

const GlassShard = ({ size, shape, initialX, initialY, delay, zDepth, spinSpeedX, spinSpeedY, spinSpeedZ }) => {
  const shardRef = useRef(null);

  useEffect(() => {
    let mouseX = -1000;
    let mouseY = -1000;
    let currentX = initialX;
    let currentY = initialY;
    let time = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animId;
    const animate = () => {
      time += 0.01;
      
      // Floating movement (simulating zero gravity in space)
      const floatY = Math.sin(time + delay) * 40 * (zDepth / 100);
      const floatX = Math.cos(time * 0.8 + delay) * 30 * (zDepth / 100);

      // Complex 3D rotation in space
      const rotX = time * spinSpeedX * 100 + delay * 10;
      const rotY = time * spinSpeedY * 100 + delay * 10;
      const rotZ = time * spinSpeedZ * 100 + delay * 10;

      let targetX = initialX + floatX;
      let targetY = initialY + floatY;

      if (shardRef.current) {
        // Approximate center of the shard
        const centerX = currentX + size / 2;
        const centerY = currentY + size / 2;

        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const MathDist = Math.sqrt(dx * dx + dy * dy);

        // Repel from mouse like a force field
        const repelRadius = 250;
        if (MathDist < repelRadius) {
          const force = (repelRadius - MathDist) / repelRadius;
          const angle = Math.atan2(dy, dx);
          // Push away stronger near the mouse, scaling with depth so closer objects push further
          const pushDistance = 150 * (zDepth / 100);
          targetX -= Math.cos(angle) * force * pushDistance;
          targetY -= Math.sin(angle) * force * pushDistance;
        }

        // Elastic return (LERP) for smooth movement
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        // Apply 3D transform
        shardRef.current.style.transform = `
          translate3d(${currentX}px, ${currentY}px, ${zDepth}px) 
          rotateX(${rotX}deg) 
          rotateY(${rotY}deg) 
          rotateZ(${rotZ}deg)
        `;
        
        // Dynamic lighting based on rotation
        const lightIntensity = Math.abs(Math.sin(rotX * Math.PI / 180)) * 0.5;
        shardRef.current.style.background = `linear-gradient(135deg, rgba(255,255,255,${0.1 + lightIntensity}) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,${0.1 + lightIntensity / 2}) 100%)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [initialX, initialY, delay, size, zDepth, spinSpeedX, spinSpeedY, spinSpeedZ]);

  return (
    <div
      ref={shardRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: size,
        height: size,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.2) 100%)',
        backdropFilter: `blur(${Math.max(2, zDepth / 20)}px)`,
        WebkitBackdropFilter: `blur(${Math.max(2, zDepth / 20)}px)`,
        borderTop: '1px solid rgba(255,255,255,0.6)',
        borderLeft: '1px solid rgba(255,255,255,0.6)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.3)',
        clipPath: shape,
        pointerEvents: 'none',
        zIndex: 0, 
        willChange: 'transform, background',
        transformStyle: 'preserve-3d',
      }}
    />
  );
};

const GlassShards = () => {
  const [shards, setShards] = useState([]);

  useEffect(() => {
    // Generate shards only on client side after mounting
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 18; 
    
    // Create perspective container for 3D depth
    document.body.style.perspective = '1000px';
    
    const generated = Array.from({ length: count }).map((_, i) => {
      const size = 20 + Math.random() * 100;
      
      // Keep within bounds roughly
      const initialX = Math.random() * window.innerWidth;
      const initialY = Math.random() * window.innerHeight;
      const delay = Math.random() * 100;
      
      // Z depth for parallax and size effect (50 to 200)
      const zDepth = 50 + Math.random() * 150;
      
      // Random rotation speeds
      const spinSpeedX = (Math.random() - 0.5) * 1.5;
      const spinSpeedY = (Math.random() - 0.5) * 1.5;
      const spinSpeedZ = (Math.random() - 0.5) * 1.0;
      
      // More jagged / sharp polygon points to simulate real shattered glass
      let points = [];
      const type = Math.random();
      if (type < 0.3) {
        // Long sharp splinter
        points = ['0% 0%', '100% 5%', '90% 100%', '10% 90%'];
      } else if (type < 0.6) {
        // Triangle shard
        points = ['50% 0%', '100% 100%', '0% 90%'];
      } else {
        // Irregular polygon
        points = [
          `${Math.random() * 20}% ${Math.random() * 20}%`,
          `${80 + Math.random() * 20}% ${Math.random() * 20}%`,
          `${80 + Math.random() * 20}% ${80 + Math.random() * 20}%`,
          `${Math.random() * 20}% ${80 + Math.random() * 20}%`,
        ];
        if (Math.random() > 0.5) points.push(`${Math.random() * 100}% 50%`); // Add 5th point sometimes
      }

      return {
        id: i,
        size,
        initialX,
        initialY,
        delay,
        zDepth,
        spinSpeedX,
        spinSpeedY,
        spinSpeedZ,
        shape: `polygon(${points.join(', ')})`,
      };
    });
    setShards(generated);

    return () => {
      document.body.style.perspective = 'none';
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
        {shards.map((s) => (
          <GlassShard key={s.id} {...s} />
        ))}
      </div>
    </div>
  );
};

export default GlassShards;
