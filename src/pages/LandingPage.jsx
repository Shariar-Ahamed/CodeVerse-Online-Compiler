import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LANGUAGES = [
  { id: 'html', name: 'HTML/CSS/JS', desc: 'Web Lab Preview', icon: 'fab fa-html5', colorClass: 'bg-orange-500/10 border-orange-500/20 text-orange-500' },
  { id: 'c', name: 'C', desc: 'GCC 9.2.0 Compiler', icon: 'fas fa-code', colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { id: 'cpp', name: 'C++', desc: 'GCC 9.2.0 Compiler', icon: 'fas fa-code', colorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  { id: 'csharp', name: 'C#', desc: 'Mono 6.6.0 Compiler', icon: 'fas fa-code', colorClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
  { id: 'go', name: 'Go', desc: '1.13.5 Compiler', icon: 'fas fa-code', colorClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' },
  { id: 'rust', name: 'Rust', desc: '1.40.0 Compiler', icon: 'fas fa-code', colorClass: 'bg-orange-600/10 border-orange-600/20 text-orange-600' },
  { id: 'python', name: 'Python 3', desc: '3.8.1 Interpreter', icon: 'fab fa-python', colorClass: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
  { id: 'javascript', name: 'JavaScript', desc: 'NodeJS 12.14.0 Runtime', icon: 'fab fa-js', colorClass: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' },
  { id: 'typescript', name: 'TypeScript', desc: '3.7.4 Compiler', icon: 'fas fa-code', colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { id: 'java', name: 'Java', desc: 'OpenJDK 13.0.1 Runtime', icon: 'fab fa-java', colorClass: 'bg-red-500/10 border-red-500/20 text-red-500' },
  { id: 'kotlin', name: 'Kotlin', desc: '1.3.70 Compiler', icon: 'fas fa-code', colorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-500' },
  { id: 'php', name: 'PHP', desc: '7.4.1 Interpreter', icon: 'fab fa-php', colorClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
  { id: 'ruby', name: 'Ruby', desc: '2.7.0 Interpreter', icon: 'fas fa-code', colorClass: 'bg-red-500/10 border-red-500/20 text-red-500' },
  { id: 'swift', name: 'Swift', desc: '5.2.3 Compiler', icon: 'fab fa-swift', colorClass: 'bg-orange-500/10 border-orange-500/20 text-orange-500' },
  { id: 'bash', name: 'Bash Shell', desc: '5.0.0 Interpreter', icon: 'fas fa-terminal', colorClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  { id: 'sql', name: 'SQL', desc: 'SQLite 3.27.2 Database', icon: 'fas fa-database', colorClass: 'bg-sky-500/10 border-sky-500/20 text-sky-400' },
  { id: 'scala', name: 'Scala', desc: '2.13.2 Compiler', icon: 'fas fa-code', colorClass: 'bg-red-500/10 border-red-500/20 text-red-500' },
  { id: 'haskell', name: 'Haskell', desc: 'GHC 8.8.1 Compiler', icon: 'fas fa-code', colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { id: 'pascal', name: 'Pascal', desc: 'FPC 3.0.4 Compiler', icon: 'fas fa-code', colorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  { id: 'perl', name: 'Perl', desc: '5.28.1 Interpreter', icon: 'fas fa-code', colorClass: 'bg-teal-500/10 border-teal-500/20 text-teal-400' },
  { id: 'r', name: 'R', desc: '4.0.0 Interpreter', icon: 'fas fa-code', colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { id: 'lisp', name: 'Lisp', desc: 'SBCL 2.0.0 Interpreter', icon: 'fas fa-code', colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { id: 'fortran', name: 'Fortran', desc: 'GFortran 9.2.0 Compiler', icon: 'fas fa-code', colorClass: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
  { id: 'lua', name: 'Lua', desc: '5.3.5 Interpreter', icon: 'fas fa-code', colorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-500' },
  { id: 'assembly', name: 'Assembly', desc: 'NASM 2.14.02 Compiler', icon: 'fas fa-microchip', colorClass: 'bg-blue-400/10 border-blue-400/20 text-blue-400' },
  { id: 'elixir', name: 'Elixir', desc: '1.9.4 Compiler', icon: 'fas fa-code', colorClass: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
  { id: 'erlang', name: 'Erlang', desc: 'OTP 22.2 Runtime', icon: 'fas fa-code', colorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-500' },
  { id: 'clojure', name: 'Clojure', desc: '1.10.1 Workspace', icon: 'fas fa-code', colorClass: 'bg-blue-400/10 border-blue-400/20 text-blue-400' },
  { id: 'd', name: 'D', desc: 'DMD 2.089.1 Compiler', icon: 'fas fa-code', colorClass: 'bg-slate-500/10 border-slate-500/20 text-slate-500' }
];

const DEMO_SNIPPETS = [
  {
    tab: 'main.cpp',
    code: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, CodeVerse C++!" << std::endl;\n    return 0;\n}`,
    console: "Hello, CodeVerse C++!\n\n[Process completed with exit code 0]",
    status: 'Accepted',
    time: '0.04s'
  },
  {
    tab: 'script.py',
    code: `# Python Factorial function\ndef factorial(n):\n    return 1 if n <= 1 else n * factorial(n - 1)\n\nprint("Factorial of 5:", factorial(5))`,
    console: "Factorial of 5: 120\n\n[Process completed with exit code 0]",
    status: 'Accepted',
    time: '0.02s'
  },
  {
    tab: 'index.html',
    code: `<!-- Live Web Layout Preview -->\n<div style="background:#4f46e5;color:white;padding:15px;border-radius:10px">\n   <h3>HTML Visual workbench</h3>\n   <p>Interactive preview render works!</p>\n</div>`,
    console: "Web Sandbox Loaded.\nViewport: Rendered HTML/CSS/JS Sandbox Visuals successfully.",
    status: 'Web Sandbox',
    time: '0.00s'
  }
];

export default function LandingPage({ showToast }) {
  const navigate = useNavigate();

  // --- Auto-Typing States ---
  const [demoIndex, setDemoIndex] = useState(0);
  const [typedCode, setTypedCode] = useState('');
  const [consoleText, setConsoleText] = useState('');
  const [demoStatus, setDemoStatus] = useState('Accepted');
  const [demoTime, setDemoTime] = useState('0.04s');

  // Contact Form States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Refs for Canvases
  const heroRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const languagesRef = useRef(null);
  const languagesCanvasRef = useRef(null);
  const featuresRef = useRef(null);
  const featuresCanvasRef = useRef(null);
  const aboutRef = useRef(null);
  const aboutCanvasRef = useRef(null);
  const liveDemoRef = useRef(null);
  const liveDemoCanvasRef = useRef(null);
  const contactRef = useRef(null);
  const contactCanvasRef = useRef(null);

  // --- 1. Typing Simulation Effect ---
  useEffect(() => {
    let typingInterval = null;
    let snippet = DEMO_SNIPPETS[demoIndex];
    setTypedCode('');
    setConsoleText('Compiling processes...');
    setDemoStatus(snippet.status);
    setDemoTime(snippet.time);

    let charIndex = 0;
    typingInterval = setInterval(() => {
      if (charIndex < snippet.code.length) {
        setTypedCode(prev => prev + snippet.code.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setConsoleText(snippet.console);
          setTimeout(() => {
            // Start erasing
            let currentText = snippet.code;
            typingInterval = setInterval(() => {
              if (currentText.length > 0) {
                currentText = currentText.substring(0, currentText.length - 1);
                setTypedCode(currentText);
              } else {
                clearInterval(typingInterval);
                setDemoIndex(prev => (prev + 1) % DEMO_SNIPPETS.length);
              }
            }, 15);
          }, 4000);
        }, 800);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [demoIndex]);

  // --- 2. Interactive Canvases & Scroll Reveal Effect ---
  useEffect(() => {
    // ---- Scroll Reveal using Intersection Observer ----
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));

    // ---- Canvas Animations setup ----
    let animFrameIds = {};

    // A. Hero Background Grid
    const initHeroGrid = () => {
      const heroEl = heroRef.current;
      const canvas = heroCanvasRef.current;
      if (!heroEl || !canvas) return;

      const ctx = canvas.getContext('2d');
      let gridPoints = [];
      let mouse = { x: null, y: null, active: false };

      const setupGrid = () => {
        gridPoints = [];
        const rect = heroEl.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const spacing = 35;
        for (let y = spacing / 2; y < canvas.height; y += spacing) {
          for (let x = spacing / 2; x < canvas.width; x += spacing) {
            gridPoints.push({
              x: x, y: y, originX: x, originY: y, color: 'rgba(129, 140, 248, 0.25)'
            });
          }
        }
      };

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let needsUpdating = false;

        for (let pt of gridPoints) {
          let dx = 0, dy = 0, dist = Infinity;
          if (mouse.active && mouse.x !== null && mouse.y !== null) {
            dx = mouse.x - pt.originX;
            dy = mouse.y - pt.originY;
            dist = Math.sqrt(dx * dx + dy * dy);
          }

          const maxDist = 100;
          let targetX = pt.originX;
          let targetY = pt.originY;
          let size = 1.2;
          let opacity = 0.25;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            const angle = Math.atan2(dy, dx);
            targetX = pt.originX - Math.cos(angle) * force * 15;
            targetY = pt.originY - Math.sin(angle) * force * 15;
            size = 1.2 + force * 1.5;
            opacity = 0.25 + force * 0.55;
            pt.color = `rgba(34, 211, 238, ${opacity})`;
          } else {
            pt.color = 'rgba(129, 140, 248, 0.25)';
          }

          const diffX = targetX - pt.x;
          const diffY = targetY - pt.y;
          pt.x += diffX * 0.15;
          pt.y += diffY * 0.15;

          if (Math.abs(diffX) > 0.05 || Math.abs(diffY) > 0.05) {
            needsUpdating = true;
          }

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.fill();
        }

        if (mouse.active || needsUpdating) {
          animFrameIds.hero = requestAnimationFrame(animate);
        } else {
          animFrameIds.hero = null;
        }
      };

      const handleMove = (e) => {
        const rect = heroEl.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
        if (!animFrameIds.hero) animate();
      };

      const handleLeave = () => {
        mouse.active = false;
        mouse.x = null;
        mouse.y = null;
        if (!animFrameIds.hero) animate();
      };

      heroEl.addEventListener('mousemove', handleMove);
      heroEl.addEventListener('mouseenter', () => { mouse.active = true; });
      heroEl.addEventListener('mouseleave', handleLeave);
      window.addEventListener('resize', setupGrid);

      setupGrid();
      animate();

      return () => {
        heroEl.removeEventListener('mousemove', handleMove);
        heroEl.removeEventListener('mouseleave', handleLeave);
        window.removeEventListener('resize', setupGrid);
      };
    };

    // B. Galaxy Vortex Effect (shared logic)
    const initGalaxy = (parentEl, canvas) => {
      if (!parentEl || !canvas) return;
      const ctx = canvas.getContext('2d');
      let particles = [];
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
          animFrameIds[canvas.id] = requestAnimationFrame(animate);
        } else {
          animFrameIds[canvas.id] = null;
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
        if (!animFrameIds[canvas.id]) animate();
      };

      parentEl.addEventListener('mousemove', handleMove);
      window.addEventListener('resize', setupCanvas);
      setupCanvas();

      return () => {
        parentEl.removeEventListener('mousemove', handleMove);
        window.removeEventListener('resize', setupCanvas);
      };
    };

    // C. Sparkler Physics Canvas
    const initSparkler = () => {
      const featEl = featuresRef.current;
      const canvas = featuresCanvasRef.current;
      if (!featEl || !canvas) return;

      const ctx = canvas.getContext('2d');
      let particles = [];
      const colors = [
        'rgba(251, 191, 36, ', 'rgba(251, 146, 60, ', 'rgba(244, 63, 94, ', 'rgba(168, 85, 247, ', 'rgba(34, 211, 238, '
      ];

      const setupCanvas = () => {
        const rect = featEl.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      };

      class SparklerParticle {
        constructor(x, y) {
          this.x = x;
          this.y = y;
          this.size = Math.random() * 2.5 + 1;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1.5 + 0.5;
          this.speedX = Math.cos(angle) * speed;
          this.speedY = Math.sin(angle) * speed - 0.6;
          this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
          this.alpha = 1.0;
          this.decay = Math.random() * 0.02 + 0.015;
          this.gravity = 0.045;
        }
        update() {
          this.speedY += this.gravity;
          this.x += this.speedX;
          this.y += this.speedY;
          this.alpha -= this.decay;
          if (this.size > 0.1) this.size -= 0.02;
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
          animFrameIds.sparkler = requestAnimationFrame(animate);
        } else {
          animFrameIds.sparkler = null;
        }
      };

      const handleMove = (e) => {
        const rect = featEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (particles.length < 120) {
          for (let i = 0; i < 3; i++) {
            particles.push(new SparklerParticle(x, y));
          }
        }
        if (!animFrameIds.sparkler) animate();
      };

      featEl.addEventListener('mousemove', handleMove);
      window.addEventListener('resize', setupCanvas);
      setupCanvas();

      return () => {
        featEl.removeEventListener('mousemove', handleMove);
        window.removeEventListener('resize', setupCanvas);
      };
    };

    // D. Constellation Links Canvas (shared logic)
    const initConstellation = (parentEl, canvas) => {
      if (!parentEl || !canvas) return;
      const ctx = canvas.getContext('2d');
      let particles = [];
      const colors = [
        'rgba(99, 102, 241, ', 'rgba(168, 85, 247, ', 'rgba(34, 211, 238, ', 'rgba(8, 203, 0, ', 'rgba(255, 121, 198, '
      ];

      const setupCanvas = () => {
        const rect = parentEl.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      };

      class ConstellationParticle {
        constructor(x, y) {
          this.x = x;
          this.y = y;
          this.size = Math.random() * 2 + 1;
          this.speedX = (Math.random() - 0.5) * 1.5;
          this.speedY = (Math.random() - 0.5) * 1.5;
          this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
          this.alpha = 1.0;
          this.decay = Math.random() * 0.015 + 0.01;
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          this.alpha -= this.decay;
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.colorPrefix + this.alpha + ')';
          ctx.fill();
        }
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.update();
          if (p.alpha <= 0) {
            particles.splice(i, 1);
          }
        }

        ctx.save();
        const maxDistance = 75;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDistance) {
              const avgAlpha = (particles[i].alpha + particles[j].alpha) / 2;
              const lineAlpha = (1 - dist / maxDistance) * avgAlpha * 0.45;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
        ctx.restore();

        for (let p of particles) p.draw();

        if (particles.length > 0) {
          animFrameIds[canvas.id] = requestAnimationFrame(animate);
        } else {
          animFrameIds[canvas.id] = null;
        }
      };

      const handleMove = (e) => {
        const rect = parentEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (particles.length < 80) {
          for (let i = 0; i < 2; i++) {
            particles.push(new ConstellationParticle(x, y));
          }
        }
        if (!animFrameIds[canvas.id]) animate();
      };

      parentEl.addEventListener('mousemove', handleMove);
      window.addEventListener('resize', setupCanvas);
      setupCanvas();

      return () => {
        parentEl.removeEventListener('mousemove', handleMove);
        window.removeEventListener('resize', setupCanvas);
      };
    };

    // Run Initializations
    const clearHero = initHeroGrid();
    const clearLanguages = initGalaxy(languagesRef.current, languagesCanvasRef.current);
    const clearAbout = initGalaxy(aboutRef.current, aboutCanvasRef.current);
    const clearSparkler = initSparkler();
    const clearLiveDemo = initConstellation(liveDemoRef.current, liveDemoCanvasRef.current);
    const clearContact = initConstellation(contactRef.current, contactCanvasRef.current);

    return () => {
      observer.disconnect();
      if (clearHero) clearHero();
      if (clearLanguages) clearLanguages();
      if (clearAbout) clearAbout();
      if (clearSparkler) clearSparkler();
      if (clearLiveDemo) clearLiveDemo();
      if (clearContact) clearContact();
      
      // Cancel any outstanding animation frame requests
      Object.values(animFrameIds).forEach(id => {
        if (id) cancelAnimationFrame(id);
      });
    };
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    showToast(`Thank you, ${contactName}! Your message was sent successfully.`, 'success');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  return (
    <div id="home-view" className="flex-grow flex flex-col">
      {/* ==================== HERO VIEW ==================== */}
      <section
        id="hero"
        ref={heroRef}
        className="relative overflow-hidden py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-primary)] border-b border-[var(--border-color)]"
      >
        <canvas ref={heroCanvasRef} id="hero-particles" className="absolute inset-0 pointer-events-none z-0" />
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center pt-8 pb-12 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-400 mb-5 animate-bounce">
            <i className="fas fa-terminal text-[10px]"></i>
            <span>Judge0 CE Compiler Powered</span>
          </span>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Write Code. Compile Live.<br className="hidden md:inline" />{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              No Local Setup.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mb-8 leading-relaxed">
            CodeVerse is a cloud-based development playground. Write code in C, C++, C#, Python, Rust, Go, or launch full visual HTML previews and execute instantly in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/editor')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <i className="fas fa-code"></i>
              <span>Open Code Workspace</span>
            </button>
            <button
              onClick={() => {
                const langEl = document.getElementById('languages');
                if (langEl) langEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/30 hover:bg-[var(--bg-tertiary)] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Explore Languages</span>
              <i className="fas fa-chevron-down text-xs"></i>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== SUPPORTED LANGUAGES SECTION ==================== */}
      <section
        id="languages"
        ref={languagesRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative reveal-on-scroll"
      >
        <canvas ref={languagesCanvasRef} id="languages-particles" className="absolute inset-0 pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Supported Languages & Workspaces
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl mx-auto">
              Choose your stack. CodeVerse offers dedicated compiler environments and full interactive visual preview sandboxes.
            </p>
          </div>

          {/* Grid of Languages */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {LANGUAGES.map(lang => (
              <div
                key={lang.id}
                data-lang={lang.id}
                onClick={() => navigate(`/editor?lang=${lang.id}`)}
                className="lang-card glass-panel p-3.5 rounded-xl border border-[var(--border-color)] flex items-center gap-3 cursor-pointer group transition-all duration-300"
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base group-hover:scale-110 transition-transform duration-300 ${lang.colorClass}`}>
                  <i className={lang.icon}></i>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white text-xs">{lang.name}</h3>
                  <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">{lang.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== LIVE DEMO TYPING SECTION ==================== */}
      <section
        id="live-demo"
        ref={liveDemoRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)] relative reveal-on-scroll"
      >
        <canvas ref={liveDemoCanvasRef} id="live-demo-particles" className="absolute inset-0 pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              See CodeVerse in Action
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl mx-auto">
              Watch as code typing processes and standard input displays translate directly to console rendering in real time.
            </p>
          </div>

          {/* Mock IDE Container */}
          <div className="glass-panel rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-2xl max-w-5xl mx-auto">
            {/* Tab Bar Header */}
            <div className="h-11 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/45 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                </div>
                <span id="demo-tab-name" className="text-xs font-mono text-[var(--text-secondary)]">
                  main.cpp
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Auto Running
              </span>
            </div>

            {/* Content split grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)] min-h-[360px]">
              {/* Editor Mock */}
              <div className="md:col-span-3 p-4 bg-[#1e1e2e]/60 font-mono text-xs text-slate-300 leading-relaxed overflow-hidden relative text-left">
                <pre className="relative z-10 select-none whitespace-pre-wrap">
                  <code id="demo-editor-text">{typedCode}</code>
                  <span className="terminal-cursor"></span>
                </pre>
              </div>
              {/* Output Console Mock */}
              <div className="md:col-span-2 p-4 bg-[#0a0c10] font-mono text-xs flex flex-col justify-between text-left">
                <div>
                  <div className="text-[var(--text-muted)] text-[9px] uppercase tracking-wider mb-2 font-bold flex items-center gap-1">
                    <i className="fas fa-terminal"></i>
                    <span>Terminal Output</span>
                  </div>
                  <pre id="demo-console-text" className="text-emerald-400 whitespace-pre-wrap select-none">
                    {consoleText}
                  </pre>
                </div>

                <div className="pt-4 border-t border-[var(--border-color)]/30 flex items-center justify-between text-[9px] text-[var(--text-muted)] font-bold">
                  <span>Status: {demoStatus}</span>
                  <span>Time: {demoTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section
        id="features"
        ref={featuresRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative reveal-on-scroll"
      >
        <canvas ref={featuresCanvasRef} id="features-particles" className="absolute inset-0 pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Full-Featured Coding Workspaces
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl mx-auto">
              We bring professional desktop-grade compilers and frontend previews directly to your modern web browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg">
                <i className="fas fa-keyboard"></i>
              </div>
              <h3 className="font-bold text-white text-base">VS Code Core (Monaco)</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Powered by Monaco Editor. Customize settings, theme configurations, automatic auto-saving, and tab switching layouts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg">
                <i className="fas fa-eye"></i>
              </div>
              <h3 className="font-bold text-white text-base">Live Web Sandbox</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Write interactive templates using HTML, CSS, and JS. Render web pages inside the iframe preview and monitor output logs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="font-bold text-white text-base">Low-latency Execution</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Execute scripts instantly on pre-configured sandboxed backend endpoints without setup parameters.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-lg">
                <i className="fas fa-sun"></i>
              </div>
              <h3 className="font-bold text-white text-base">Dracula & Light Theme</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Toggle active dark theme settings with standard Dracula syntax highlighting rules and minimal light modes instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ABOUT SECTION ==================== */}
      <section
        id="about"
        ref={aboutRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)] border-b border-[var(--border-color)] relative reveal-on-scroll"
      >
        <canvas ref={aboutCanvasRef} id="about-particles" className="absolute inset-0 pointer-events-none z-0" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-6">
            About CodeVerse
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
            CodeVerse was built with a vision to make programming compiler resources free, fast, and accessible for everyone without requiring complicated downloads or configurations. We bypass whitelisted/private API limits using community engines like Judge0 CE, giving developers a sandboxed space for writing algorithms, executing backend logical tests, and designing quick web applications.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Whether you are testing a Rust snippet, calculating output parameters in Python, or sketching a frontend component, CodeVerse ensures a seamless, modern developer experience.
          </p>
        </div>
      </section>

      {/* ==================== CONTACT SECTION ==================== */}
      <section
        id="contact"
        ref={contactRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative reveal-on-scroll"
      >
        <canvas ref={contactCanvasRef} id="contact-particles" className="absolute inset-0 pointer-events-none z-0" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Contact details and support options */}
            <div className="flex flex-col gap-8 text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[10px] font-semibold text-indigo-400 mb-4 animate-pulse">
                  <i className="fas fa-headset text-[9px]"></i>
                  <span>24/7 Developer Support</span>
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
                  Get in Touch
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Have feedback, suggestions, or API connection issues? Drop us a message. Our compiler status monitors ensure logical sandbox resources stay up 24/7.
                </p>
              </div>

              {/* Quick Info Cards */}
              <div className="flex flex-col gap-4">
                {/* Email Support Card */}
                <a href="mailto:shariaralways@gmail.com" className="glass-panel p-4 rounded-xl border border-[var(--border-color)] flex items-center gap-4 hover:border-indigo-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-base">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Direct Support</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">shariaralways@gmail.com</p>
                  </div>
                </a>

                {/* LinkedIn Card */}
                <a href="https://www.linkedin.com/in/shariarahamed/" target="_blank" rel="noopener noreferrer" className="glass-panel p-4 rounded-xl border border-[var(--border-color)] flex items-center gap-4 hover:border-cyan-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-base">
                    <i className="fab fa-linkedin-in"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Professional Profile</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">linkedin.com/in/shariarahamed</p>
                  </div>
                </a>

                {/* Active Status Indicator */}
                <div className="flex items-center gap-2 px-1 text-xs text-[var(--text-secondary)] font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>All compiler sandboxes fully operational</span>
                </div>
              </div>
            </div>

            {/* Right Column: Glassmorphic Form */}
            <form
              onSubmit={handleContactSubmit}
              className="glass-panel p-8 rounded-2xl border border-[var(--border-color)] flex flex-col gap-5 shadow-xl text-left"
            >
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200"
                  placeholder="Write your name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200"
                  placeholder="abc@yourdomain.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows="4"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 resize-none"
                  placeholder="Enter your comments or questions..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10 active:scale-95 transition-all duration-200 btn-premium-glow"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
