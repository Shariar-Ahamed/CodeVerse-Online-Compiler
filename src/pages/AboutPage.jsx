import React, { useEffect, useRef } from 'react';

export default function AboutPage() {
  const aboutRef = useRef(null);
  const aboutCanvasRef = useRef(null);

  useEffect(() => {
    const parentEl = aboutRef.current;
    const canvas = aboutCanvasRef.current;
    if (!parentEl || !canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId = null;
    const colors = [
      'rgba(99, 102, 241, ', 'rgba(168, 85, 247, ', 'rgba(34, 211, 238, ', 'rgba(8, 203, 0, ', 'rgba(255, 121, 198, '
    ];

    const setupCanvas = () => {
      const rect = parentEl.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    class GalaxyParticle {
      constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.angle = Math.random() * Math.PI * 2;
        this.spinSpeed = (Math.random() * 0.08 + 0.04) * (Math.random() > 0.5 ? 1 : -1);
        this.radius = Math.random() * 4 + 2;
        this.radiusExpansion = Math.random() * 1.2 + 0.6;
        this.size = Math.random() * 2 + 0.8;
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 1.0;
        this.decay = Math.random() * 0.02 + 0.015;
      }
      update() {
        this.angle += this.spinSpeed;
        this.radius += this.radiusExpansion;
        this.x = this.startX + Math.cos(this.angle) * this.radius;
        this.y = this.startY + Math.sin(this.angle) * this.radius;
        this.alpha -= this.decay;
        if (this.size > 0.1) this.size -= 0.01;
      }
      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + this.alpha + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.colorPrefix + '1)';
        ctx.fill();
        ctx.restore();
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.alpha <= 0 || p.size <= 0.1) {
          particles.splice(i, 1);
        } else {
          p.draw();
        }
      }

      if (particles.length > 0) {
        animFrameId = requestAnimationFrame(animate);
      } else {
        animFrameId = null;
      }
    };

    const handleMove = (e) => {
      const rect = parentEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (particles.length < 150) {
        for (let i = 0; i < 3; i++) {
          particles.push(new GalaxyParticle(x, y));
        }
      }
      if (!animFrameId) animate();
    };

    parentEl.addEventListener('mousemove', handleMove);
    window.addEventListener('resize', setupCanvas);
    setupCanvas();

    return () => {
      parentEl.removeEventListener('mousemove', handleMove);
      window.removeEventListener('resize', setupCanvas);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div className="flex-grow flex flex-col justify-center items-center">
      {/* Background Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-600/5 blur-[120px] z-0 pointer-events-none"></div>

      <section
        id="about"
        ref={aboutRef}
        className="w-full py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-primary)] border-b border-[var(--border-color)] relative flex flex-col justify-center min-h-[70vh] overflow-hidden"
      >
        <canvas ref={aboutCanvasRef} id="about-particles" className="absolute inset-0 pointer-events-none z-0" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6">
            About CodeVerse
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-6">
            CodeVerse was built with a vision to make programming compiler resources free, fast, and accessible for everyone without requiring complicated downloads or configurations. We bypass whitelisted/private API limits using community engines like Judge0 CE, giving developers a sandboxed space for writing algorithms, executing backend logical tests, and designing quick web applications.
          </p>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Whether you are testing a Rust snippet, calculating output parameters in Python, or sketching a frontend component, CodeVerse ensures a seamless, modern developer experience.
          </p>
        </div>
      </section>
    </div>
  );
}
