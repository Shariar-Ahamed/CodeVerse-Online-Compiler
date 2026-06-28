import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LANGUAGES = [
  { id: 'text', name: 'Text Notes', desc: 'Personal Workspace', icon: 'fas fa-file-alt', colorClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
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

const MILESTONES = [
  {
    id: '01',
    title: 'Code Playgrounds',
    desc: 'Core Compilers & Runtimes',
    color: 'from-indigo-600 to-indigo-500',
    shadow: 'shadow-indigo-500/25',
    leftTopics: [
      { name: 'C/C++ GCC 9.2', desc: 'Powerful high-performance compilation' },
      { name: 'Python 3.8', desc: 'Vibrant and clean scripting interpreter' },
      { name: 'NodeJS 12.14', desc: 'Ultra-fast JavaScript backend runtime' },
      { name: 'Rust 1.40 Cargo', desc: 'Secure memory-safe compilation flow' }
    ],
    rightOutcomes: [
      { text: 'Run algorithm challenges instantly', completed: true },
      { text: 'Code on the go without local runtime installations', completed: true },
      { text: 'Get detailed runtime errors & compile timings', completed: true },
      { text: 'Write C/C++ apps directly in the browser', completed: true }
    ]
  },
  {
    id: '02',
    title: 'Web Laboratory',
    desc: 'Live Frontend Visual Sandboxes',
    color: 'from-cyan-600 to-cyan-500',
    shadow: 'shadow-cyan-500/25',
    leftTopics: [
      { name: 'HTML5 Semantic Structure', desc: 'Proper markup and content layouts' },
      { name: 'CSS Flexbox & Grid', desc: 'Beautiful responsive styling alignments' },
      { name: 'Vibrant Vanilla JavaScript', desc: 'Dynamic client-side action events' },
      { name: 'Iframe Isolated Preview', desc: 'Realtime hot-reloaded visual render' }
    ],
    rightOutcomes: [
      { text: 'Build interactive front-end web pages', completed: true },
      { text: 'Verify layout responsiveness instantly in viewport', completed: true },
      { text: 'Test JavaScript script DOM events visually', completed: true },
      { text: 'Create portfolio mockups and design drafts', completed: true }
    ]
  },
  {
    id: '03',
    title: 'Cloud Workspace',
    desc: 'Persistent Snippets & Identity',
    color: 'from-purple-600 to-purple-500',
    shadow: 'shadow-purple-500/25',
    leftTopics: [
      { name: 'Secure Google/GitHub Auth', desc: 'Single click authenticated sessions' },
      { name: 'Notepad Document Library', desc: 'Organized personal cloud document save' },
      { name: 'Firestore Rules Security', desc: 'Encrypted safe nested write validation' },
      { name: 'State Management Sync', desc: 'Automatic local-to-cloud workspace sync' }
    ],
    rightOutcomes: [
      { text: 'Access your saved documents from any device', completed: true },
      { text: 'Never lose code fragments with auto-cloud backing', completed: true },
      { text: 'Organize compiler workspaces in custom lists', completed: true },
      { text: 'Toggle secure guest workspace limits safely', completed: true }
    ]
  }
];

export default function LandingPage({ showToast }) {
  const navigate = useNavigate();

  // --- Milestone Roadmap States ---
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredRightIndex, setHoveredRightIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrevMilestone = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMilestoneIndex(prev => (prev === 0 ? MILESTONES.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 250);
  };

  const handleNextMilestone = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMilestoneIndex(prev => (prev === MILESTONES.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, 250);
  };

  // --- Auto-Typing States ---
  const [demoIndex, setDemoIndex] = useState(0);
  const [typedCode, setTypedCode] = useState('');
  const [consoleText, setConsoleText] = useState('');
  const [demoStatus, setDemoStatus] = useState('Accepted');
  const [demoTime, setDemoTime] = useState('0.04s');

  // Refs for Canvases
  const heroRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const languagesRef = useRef(null);
  const languagesCanvasRef = useRef(null);
  const featuresRef = useRef(null);
  const featuresCanvasRef = useRef(null);
  const liveDemoRef = useRef(null);
  const liveDemoCanvasRef = useRef(null);
  const milestonesRef = useRef(null);
  const milestonesCanvasRef = useRef(null);

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
    const clearSparkler = initSparkler();
    const clearLiveDemo = initConstellation(liveDemoRef.current, liveDemoCanvasRef.current);
    const clearMilestones = initConstellation(milestonesRef.current, milestonesCanvasRef.current);

    return () => {
      observer.disconnect();
      if (clearHero) clearHero();
      if (clearLanguages) clearLanguages();
      if (clearSparkler) clearSparkler();
      if (clearLiveDemo) clearLiveDemo();
      if (clearMilestones) clearMilestones();
      
      // Cancel any outstanding animation frame requests
      Object.values(animFrameIds).forEach(id => {
        if (id) cancelAnimationFrame(id);
      });
    };
  }, []);

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

        {/* Floating Language Badges (Hidden on mobile) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden lg:block hidden">
          {/* 1. Python (Left Topmost - Medium) */}
          <div className="absolute left-[3%] top-[15%] w-14 h-14 rounded-xl bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#3776ab]/70 shadow-[inset_0_0_10px_rgba(55,118,171,0.55),_0_0_12px_rgba(55,118,171,0.2)] flex items-center justify-center animate-float-1 select-none">
            <i className="fab fa-python text-[#3776ab] text-2xl"></i>
          </div>
          {/* 2. Swift (Left Inner Top - Medium - Fills Circle 1) */}
          <div className="absolute left-[16%] top-[25%] w-14 h-14 rounded-xl bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#fa7343]/70 shadow-[inset_0_0_10px_rgba(250,115,67,0.55),_0_0_12px_rgba(250,115,67,0.2)] flex items-center justify-center animate-float-2 select-none">
            <i className="fab fa-swift text-[#fa7343] text-2xl"></i>
          </div>
          {/* 3. C++ (Left Mid - Small) */}
          <div className="absolute left-[6%] top-[50%] -translate-y-1/2 w-11 h-11 rounded-lg bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#00599c]/70 shadow-[inset_0_0_8px_rgba(0,89,156,0.5),_0_0_10px_rgba(0,89,156,0.18)] flex items-center justify-center animate-float-3 select-none">
            <i className="fas fa-code text-[#00599c] text-lg"></i>
          </div>
          {/* 4. Bash Shell (Left Inner Bottom - Small - Fills Circle 2) */}
          <div className="absolute left-[18%] bottom-[20%] w-11 h-11 rounded-lg bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#34d399]/70 shadow-[inset_0_0_8px_rgba(52,211,153,0.5),_0_0_10px_rgba(52,211,153,0.18)] flex items-center justify-center animate-float-1 select-none">
            <i className="fas fa-terminal text-[#34d399] text-lg"></i>
          </div>
          {/* 5. Java (Left Bottommost - Large) */}
          <div className="absolute left-[4%] bottom-[12%] w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#ea2d2e]/70 shadow-[inset_0_0_12px_rgba(234,45,46,0.6),_0_0_15px_rgba(234,45,46,0.25)] flex items-center justify-center animate-float-2 select-none">
            <i className="fab fa-java text-[#ea2d2e] text-3xl"></i>
          </div>

          {/* 6. Ruby (Right Inner Top - Medium - Fills Circle 3) */}
          <div className="absolute right-[18%] top-[14%] w-14 h-14 rounded-xl bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#e0115f]/70 shadow-[inset_0_0_10px_rgba(224,17,95,0.55),_0_0_12px_rgba(224,17,95,0.2)] flex items-center justify-center animate-float-3 select-none">
            <i className="fas fa-gem text-[#e0115f] text-2xl"></i>
          </div>
          {/* 7. JavaScript (Right Topmost - Large) */}
          <div className="absolute right-[4%] top-[18%] w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#eab308]/70 shadow-[inset_0_0_12px_rgba(234,179,8,0.6),_0_0_15px_rgba(234,179,8,0.25)] flex items-center justify-center animate-float-2 select-none">
            <i className="fab fa-js text-[#eab308] text-3xl"></i>
          </div>
          {/* 7.5. Go (Right Inner Mid - Medium - Fills the empty right side area) */}
          <div className="absolute right-[21%] top-[42%] w-14 h-14 rounded-xl bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#00add8]/70 shadow-[inset_0_0_10px_rgba(0,173,216,0.55),_0_0_12px_rgba(0,173,216,0.2)] flex items-center justify-center animate-float-3 select-none">
            <i className="fas fa-code text-[#00add8] text-2xl"></i>
          </div>
          {/* 8. HTML5 (Right Mid - Medium) */}
          <div className="absolute right-[5%] top-[50%] -translate-y-1/2 w-14 h-14 rounded-xl bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#e34f26]/70 shadow-[inset_0_0_10px_rgba(227,79,38,0.55),_0_0_12px_rgba(227,79,38,0.2)] flex items-center justify-center animate-float-1 select-none">
            <i className="fab fa-html5 text-[#e34f26] text-2xl"></i>
          </div>
          {/* 9. PHP (Right Inner Bottom - Large - Fills Circle 4) */}
          <div className="absolute right-[16%] bottom-[14%] w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#777bb4]/70 shadow-[inset_0_0_12px_rgba(119,123,180,0.6),_0_0_15px_rgba(119,123,180,0.25)] flex items-center justify-center animate-float-1 select-none">
            <i className="fab fa-php text-[#777bb4] text-3xl"></i>
          </div>
          {/* 10. SQL (Right Bottommost - Small) */}
          <div className="absolute right-[3%] bottom-[10%] w-11 h-11 rounded-lg bg-[var(--bg-tertiary)]/50 backdrop-blur-sm border-2 border-[#0064a5]/70 shadow-[inset_0_0_8px_rgba(0,100,165,0.5),_0_0_10px_rgba(0,100,165,0.18)] flex items-center justify-center animate-float-3 select-none">
            <i className="fas fa-database text-[#0064a5] text-lg"></i>
          </div>
        </div>

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
            <div className="relative group w-full sm:w-auto">
              {/* Ripple 1 */}
              <div className="absolute inset-0 rounded-lg border-2 border-[#818cf8] pointer-events-none animate-ripple-1"></div>
              {/* Ripple 2 */}
              <div className="absolute inset-0 rounded-lg border-2 border-[#818cf8] pointer-events-none animate-ripple-2"></div>
              
              <button
                onClick={() => navigate('/editor')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 border border-indigo-500/20 relative z-10"
              >
                <i className="fas fa-code"></i>
                <span>Open Code Workspace</span>
              </button>
            </div>
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
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)] relative reveal-on-scroll overflow-hidden"
      >
        <canvas ref={liveDemoCanvasRef} id="live-demo-particles" className="absolute inset-0 pointer-events-none z-0" />
        
        {/* Futuristic Rotating Tech Dials (Left & Right Side background circles) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[40%] pointer-events-none z-0 opacity-20 sm:opacity-30 select-none hidden sm:block">
          <svg className="w-64 h-64 md:w-[450px] md:h-[450px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="95" stroke="url(#techGlow)" strokeWidth="1" strokeDasharray="15 8 40 5 10 10" className="animate-spin-slow-radar origin-center" />
            <circle cx="100" cy="100" r="82" stroke="url(#techGlow2)" strokeWidth="0.8" strokeDasharray="6 6 12 4" className="animate-spin-reverse-slow origin-center" />
            <circle cx="100" cy="100" r="70" stroke="url(#techGlow)" strokeWidth="1.5" strokeDasharray="50 15 80 20" className="animate-spin-slow origin-center" />
            <circle cx="100" cy="100" r="58" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.25" />
            <circle cx="100" cy="100" r="46" stroke="url(#techGlow)" strokeWidth="1" strokeDasharray="3 15" className="animate-spin-fast origin-center" />
            <circle cx="100" cy="100" r="30" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" className="animate-spin-slow origin-center" />
            <defs>
              <linearGradient id="techGlow" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="techGlow2" x1="200" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#08CB00" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[40%] pointer-events-none z-0 opacity-20 sm:opacity-30 select-none hidden sm:block">
          <svg className="w-64 h-64 md:w-[450px] md:h-[450px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="95" stroke="url(#techGlow)" strokeWidth="1" strokeDasharray="15 8 40 5 10 10" className="animate-spin-slow-radar origin-center" />
            <circle cx="100" cy="100" r="82" stroke="url(#techGlow2)" strokeWidth="0.8" strokeDasharray="6 6 12 4" className="animate-spin-reverse-slow origin-center" />
            <circle cx="100" cy="100" r="70" stroke="url(#techGlow)" strokeWidth="1.5" strokeDasharray="50 15 80 20" className="animate-spin-slow origin-center" />
            <circle cx="100" cy="100" r="58" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.25" />
            <circle cx="100" cy="100" r="46" stroke="url(#techGlow)" strokeWidth="1" strokeDasharray="3 15" className="animate-spin-fast origin-center" />
            <circle cx="100" cy="100" r="30" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" className="animate-spin-slow origin-center" />
          </svg>
        </div>

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

      {/* ==================== MILESTONE ROADMAP SECTION ==================== */}
      <section
        id="milestones"
        ref={milestonesRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] border-b border-[var(--border-color)] relative"
      >
        <canvas ref={milestonesCanvasRef} id="milestones-particles" className="absolute inset-0 pointer-events-none z-0" />
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs font-semibold text-indigo-400 mb-4 uppercase tracking-wider">
              <i className="fas fa-map-location-dot text-[10px]"></i>
              <span>Interactive Roadmap</span>
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              CodeVerse Journey Map
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl mx-auto">
              Select milestones to explore supported compiler environments, isolated previews, and saved cloud snippet workflows.
            </p>
          </div>

          {/* Symmetrical Interactive Container */}
          <div className="relative w-full max-w-5xl mx-auto min-h-[480px]">
            
            {/* Symmetrical SVG paths overlay (Hidden on mobile) */}
            <svg className={`absolute inset-0 w-full h-full pointer-events-none lg:block hidden z-[-1] transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} viewBox="0 0 1000 500" preserveAspectRatio="none">
              <defs>
                <linearGradient id="left-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="right-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Left lines (Topics -> Center) */}
              <path d="M 280 60 C 360 60, 420 250, 460 250" stroke="url(#left-line-grad)" strokeWidth="1.5" fill="none" className={hoveredIndex === 0 ? "flowing-path-left stroke-indigo-400 stroke-2" : ""} />
              <path d="M 280 160 C 360 160, 420 250, 460 250" stroke="url(#left-line-grad)" strokeWidth="1.5" fill="none" className={hoveredIndex === 1 ? "flowing-path-left stroke-indigo-400 stroke-2" : ""} />
              <path d="M 280 260 C 360 260, 420 250, 460 250" stroke="url(#left-line-grad)" strokeWidth="1.5" fill="none" className={hoveredIndex === 2 ? "flowing-path-left stroke-indigo-400 stroke-2" : ""} />
              <path d="M 280 360 C 360 360, 420 250, 460 250" stroke="url(#left-line-grad)" strokeWidth="1.5" fill="none" className={hoveredIndex === 3 ? "flowing-path-left stroke-indigo-400 stroke-2" : ""} />

              {/* Right lines (Center -> Outcomes) */}
              <path d="M 540 250 C 580 250, 640 60, 720 60" stroke="url(#right-line-grad)" strokeWidth="1.5" fill="none" className={hoveredRightIndex === 0 ? "flowing-path-right stroke-cyan-400 stroke-2" : ""} />
              <path d="M 540 250 C 580 250, 640 160, 720 160" stroke="url(#right-line-grad)" strokeWidth="1.5" fill="none" className={hoveredRightIndex === 1 ? "flowing-path-right stroke-cyan-400 stroke-2" : ""} />
              <path d="M 540 250 C 580 250, 640 260, 720 260" stroke="url(#right-line-grad)" strokeWidth="1.5" fill="none" className={hoveredRightIndex === 2 ? "flowing-path-right stroke-cyan-400 stroke-2" : ""} />
              <path d="M 540 250 C 580 250, 640 360, 720 360" stroke="url(#right-line-grad)" strokeWidth="1.5" fill="none" className={hoveredRightIndex === 3 ? "flowing-path-right stroke-cyan-400 stroke-2" : ""} />
            </svg>

            {/* Columns Grid */}
            <div className={`grid grid-cols-1 lg:grid-cols-5 gap-8 items-center relative z-10 min-h-[420px] transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95 blur-[2px]' : 'opacity-100 scale-100 blur-0'}`}>
              
              {/* Left Column: Topics */}
              <div className="lg:col-span-2 flex flex-col gap-4 justify-between h-full py-2">
                {MILESTONES[currentMilestoneIndex].leftTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`glass-panel p-4 rounded-2xl border transition-all duration-300 text-left select-none relative group cursor-pointer ${
                      hoveredIndex === idx
                        ? 'border-indigo-500/50 bg-indigo-500/5 lg:translate-x-2'
                        : 'border-[var(--border-color)] bg-[var(--bg-tertiary)]/20'
                    }`}
                  >
                    <h4 className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors duration-200">
                      {topic.name}
                    </h4>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {topic.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Center Column: Glossy Folder Card */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center py-6">
                <div className="relative w-48 h-40 flex flex-col select-none z-10">
                  
                  {/* Folder Tab (Layer 0) */}
                  <div className="absolute top-0 left-3 w-16 h-4 bg-indigo-600 rounded-t-md z-0 border-t border-x border-white/10"></div>
                  
                  {/* Layer 1: Back sheet (Indigo-800) */}
                  <div className="absolute top-3 left-2 right-2 h-10 bg-indigo-800 rounded-t-lg z-10 border-t border-x border-white/10"></div>
                  
                  {/* Layer 2: Sheet 1 (Indigo-500) */}
                  <div className="absolute top-5 left-4 right-4 h-8 bg-indigo-500 rounded-t-lg z-20 border-t border-x border-white/10"></div>
                  
                  {/* Layer 3: Sheet 2 (Cyan-500) */}
                  <div className="absolute top-7 left-3 right-3 h-6 bg-cyan-500 rounded-t-lg z-30 border-t border-x border-white/10"></div>
                  
                  {/* Layer 4: Front Cover (Dark Website-matching Theme) */}
                  <div className="absolute top-10 left-0 right-0 bottom-0 bg-gradient-to-br from-[#1b1c2a] via-[#151622] to-[#0f101a] rounded-2xl border border-indigo-500/40 shadow-2xl shadow-indigo-500/25 z-40 overflow-hidden flex flex-col justify-center items-center px-5 text-center transform transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer">
                    {/* Glass sheen reflection overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none"></div>
                    
                    {/* Top highlight line */}
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

                    <span className="text-[13px] font-extrabold tracking-widest text-white uppercase leading-none">
                      Step
                    </span>
                    <span className="text-5xl font-black text-white/50 mt-1.5 select-none tracking-tight">
                      {MILESTONES[currentMilestoneIndex].id}
                    </span>
                  </div>

                </div>
              </div>

              {/* Right Column: Outcomes */}
              <div className="lg:col-span-2 flex flex-col gap-4 justify-between h-full py-2">
                {MILESTONES[currentMilestoneIndex].rightOutcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredRightIndex(idx)}
                    onMouseLeave={() => setHoveredRightIndex(null)}
                    className={`glass-panel p-4 rounded-2xl border transition-all duration-300 text-left select-none group cursor-pointer ${
                      hoveredRightIndex === idx
                        ? 'border-cyan-500/50 bg-cyan-500/5 lg:-translate-x-2'
                        : 'border-[var(--border-color)] bg-[var(--bg-tertiary)]/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 mt-0.5 transition-all duration-300 ${
                        hoveredIndex === idx || hoveredRightIndex === idx
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-400/25'
                          : 'border-[var(--border-color)] bg-[var(--bg-tertiary)]/40 text-[var(--text-muted)]'
                      }`}>
                        <i className="fas fa-check"></i>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors duration-200 leading-relaxed">
                          {outcome.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={handlePrevMilestone}
              className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 hover:bg-[var(--bg-tertiary)] hover:border-indigo-500/50 text-[var(--text-secondary)] hover:text-white flex items-center justify-center active:scale-90 transition-all duration-200 focus:outline-none cursor-pointer"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            
            <div className="text-center min-w-[240px]">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {MILESTONES[currentMilestoneIndex].title}
              </h3>
              <p className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mt-0.5">
                {MILESTONES[currentMilestoneIndex].desc}
              </p>
            </div>

            <button
              onClick={handleNextMilestone}
              className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 hover:bg-[var(--bg-tertiary)] hover:border-indigo-500/50 text-[var(--text-secondary)] hover:text-white flex items-center justify-center active:scale-90 transition-all duration-200 focus:outline-none cursor-pointer"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>

          {/* Infinite Marquee of Languages */}
          <div className="mt-10 overflow-hidden relative w-full mask-gradient">
            <div className="animate-marquee-rtl hover:[animation-play-state:paused] flex gap-4">
              {/* 1st list */}
              {LANGUAGES.filter(lang => lang.id !== 'text').map((lang, idx) => (
                <div
                  key={`mar1-${lang.id}-${idx}`}
                  onClick={() => navigate(`/editor?lang=${lang.id}`)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[var(--bg-tertiary)]/20 border border-[var(--border-color)]/60 text-white hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 select-none cursor-pointer shrink-0"
                >
                  <span className={`${lang.colorClass} w-6 h-6 rounded-md flex items-center justify-center text-xs`}><i className={lang.icon}></i></span>
                  <span className="text-xs font-semibold">{lang.name}</span>
                </div>
              ))}
              {/* 2nd list for looping */}
              {LANGUAGES.filter(lang => lang.id !== 'text').map((lang, idx) => (
                <div
                  key={`mar2-${lang.id}-${idx}`}
                  onClick={() => navigate(`/editor?lang=${lang.id}`)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[var(--bg-tertiary)]/20 border border-[var(--border-color)]/60 text-white hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 select-none cursor-pointer shrink-0"
                >
                  <span className={`${lang.colorClass} w-6 h-6 rounded-md flex items-center justify-center text-xs`}><i className={lang.icon}></i></span>
                  <span className="text-xs font-semibold">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section
        id="features"
        ref={featuresRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative reveal-on-scroll overflow-hidden"
      >
        <canvas ref={featuresCanvasRef} id="features-particles" className="absolute inset-0 pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 relative">
            {/* Left 3D Rotating Prism/Tetrahedron */}
            <div className="absolute left-[-4%] md:left-[2%] lg:left-[6%] top-[35%] -translate-y-1/2 select-none pointer-events-none hidden sm:block">
              {/* Light Aura Glow */}
              <div className="absolute w-28 h-28 rounded-full bg-purple-500/20 blur-2xl animate-pulse -z-10"></div>
              <div className="tetra-container scale-75 md:scale-100">
                <div className="tetra-3d">
                  <div className="tetra-face tetra-face-1"></div>
                  <div className="tetra-face tetra-face-2"></div>
                  <div className="tetra-face tetra-face-3"></div>
                  <div className="tetra-face tetra-face-bottom"></div>
                </div>
              </div>
            </div>

            {/* Right 3D Rotating Glass/Wireframe Cube */}
            <div className="absolute right-[-4%] md:right-[2%] lg:right-[6%] top-[35%] -translate-y-1/2 select-none pointer-events-none hidden sm:block">
              {/* Light Aura Glow */}
              <div className="absolute w-28 h-28 rounded-full bg-cyan-500/20 blur-2xl animate-pulse -z-10"></div>
              <div className="cube-container scale-75 md:scale-100">
                <div className="cube-3d">
                  <div className="cube-face cube-face-front"></div>
                  <div className="cube-face cube-face-back"></div>
                  <div className="cube-face cube-face-left"></div>
                  <div className="cube-face cube-face-right"></div>
                  <div className="cube-face cube-face-top"></div>
                  <div className="cube-face cube-face-bottom"></div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white relative z-10">
              Full-Featured Coding Workspaces
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl mx-auto relative z-10">
              We bring professional desktop-grade compilers and frontend previews directly to your modern web browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {/* Feature 1 */}
            <div className="relative p-[1.5px] rounded-2xl overflow-hidden hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_12px_24px_rgba(99,102,241,0.15)] transition-all duration-300 group select-none">
              <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] border-beam-indigo animate-border-spin opacity-45 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-[var(--bg-secondary)] p-6 rounded-2xl h-full flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg">
                  <i className="fas fa-keyboard"></i>
                </div>
                <h3 className="font-bold text-white text-base">VS Code Core (Monaco)</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Powered by Monaco Editor. Customize settings, theme configurations, automatic auto-saving, and tab switching layouts.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative p-[1.5px] rounded-2xl overflow-hidden hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_12px_24px_rgba(6,182,212,0.15)] transition-all duration-300 group select-none">
              <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] border-beam-cyan animate-border-spin opacity-45 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-[var(--bg-secondary)] p-6 rounded-2xl h-full flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg">
                  <i className="fas fa-eye"></i>
                </div>
                <h3 className="font-bold text-white text-base">Live Web Sandbox</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Write interactive templates using HTML, CSS, and JS. Render web pages inside the iframe preview and monitor output logs.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative p-[1.5px] rounded-2xl overflow-hidden hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_12px_24px_rgba(16,185,129,0.15)] transition-all duration-300 group select-none">
              <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] border-beam-emerald animate-border-spin opacity-45 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-[var(--bg-secondary)] p-6 rounded-2xl h-full flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
                  <i className="fas fa-bolt"></i>
                </div>
                <h3 className="font-bold text-white text-base">Low-latency Execution</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Execute scripts instantly on pre-configured sandboxed backend endpoints without setup parameters.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative p-[1.5px] rounded-2xl overflow-hidden hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_12px_24px_rgba(168,85,247,0.15)] transition-all duration-300 group select-none">
              <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] border-beam-purple animate-border-spin opacity-45 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-[var(--bg-secondary)] p-6 rounded-2xl h-full flex flex-col gap-4">
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
        </div>
      </section>

    </div>
  );
}
