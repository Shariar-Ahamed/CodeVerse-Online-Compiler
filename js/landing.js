/**
 * CodeVerse - Landing Page JavaScript Engine
 * Handles interactive particles canvases, auto-typing editor simulation, and home page interactions
 */

// --- Live Auto-Typing Simulation Engine ---
const DEMO_SNIPPETS = [
  {
    tab: "main.cpp",
    code: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, CodeVerse C++!" << std::endl;\n    return 0;\n}`,
    console: "Hello, CodeVerse C++!\n\n[Process completed with exit code 0]",
    status: "Accepted",
    time: "0.04s"
  },
  {
    tab: "script.py",
    code: `# Python Factorial function\ndef factorial(n):\n    return 1 if n <= 1 else n * factorial(n - 1)\n\nprint("Factorial of 5:", factorial(5))`,
    console: "Factorial of 5: 120\n\n[Process completed with exit code 0]",
    status: "Accepted",
    time: "0.02s"
  },
  {
    tab: "index.html",
    code: `<!-- Live Web Layout Preview -->\n<div style="background:#4f46e5;color:white;padding:15px;border-radius:10px">\n   <h3>HTML Visual workbench</h3>\n   <p>Interactive preview render works!</p>\n</div>`,
    console: "Web Sandbox Loaded.\nViewport: Rendered HTML/CSS/JS Sandbox Visuals successfully.",
    status: "Web Sandbox",
    time: "0.00s"
  }
];

let currentDemoIndex = 0;
let demoTypingInterval = null;

function startDemoAnimation() {
  const demoTabName = document.getElementById("demo-tab-name");
  const demoEditorText = document.getElementById("demo-editor-text");
  const demoConsoleText = document.getElementById("demo-console-text");
  
  if (!demoTabName || !demoEditorText || !demoConsoleText) return;
  
  function typeNextSnippet() {
    const snippet = DEMO_SNIPPETS[currentDemoIndex];
    demoTabName.textContent = snippet.tab;
    demoEditorText.textContent = "";
    demoConsoleText.textContent = "Compiling processes...";
    
    let charIndex = 0;
    clearInterval(demoTypingInterval);
    
    demoTypingInterval = setInterval(() => {
      if (charIndex < snippet.code.length) {
        demoEditorText.textContent += snippet.code.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(demoTypingInterval);
        setTimeout(() => {
          demoConsoleText.textContent = snippet.console;
          setTimeout(() => {
            eraseSnippet();
          }, 4000);
        }, 800);
      }
    }, 30);
  }
  
  function eraseSnippet() {
    let currentText = demoEditorText.textContent;
    clearInterval(demoTypingInterval);
    
    demoTypingInterval = setInterval(() => {
      if (currentText.length > 0) {
        currentText = currentText.substring(0, currentText.length - 1);
        demoEditorText.textContent = currentText;
      } else {
        clearInterval(demoTypingInterval);
        currentDemoIndex = (currentDemoIndex + 1) % DEMO_SNIPPETS.length;
        setTimeout(typeNextSnippet, 500);
      }
    }, 15);
  }
  
  typeNextSnippet();
}

// --- Interactive Background Grid (Hero Section) ---
function initHeroGridAnimation() {
  const heroEl = document.getElementById("hero");
  const heroCanvas = document.getElementById("hero-particles");
  if (!heroEl || !heroCanvas) return;
  
  const ctx = heroCanvas.getContext("2d");
  let gridPoints = [];
  let animationFrameId = null;
  let mouse = { x: null, y: null, active: false };

  function initGrid() {
    gridPoints = [];
    const rect = heroEl.getBoundingClientRect();
    heroCanvas.width = rect.width;
    heroCanvas.height = rect.height;

    const spacing = 35;
    for (let y = spacing / 2; y < heroCanvas.height; y += spacing) {
      for (let x = spacing / 2; x < heroCanvas.width; x += spacing) {
        gridPoints.push({
          x: x,
          y: y,
          originX: x,
          originY: y,
          color: "rgba(129, 140, 248, 0.25)"
        });
      }
    }
  }

  initGrid();
  window.addEventListener("resize", initGrid);

  function animateGrid() {
    ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    let needsUpdating = false;

    for (let i = 0; i < gridPoints.length; i++) {
      const pt = gridPoints[i];
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
        pt.color = `rgba(129, 140, 248, 0.25)`;
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
      animationFrameId = requestAnimationFrame(animateGrid);
    } else {
      animationFrameId = null;
    }
  }

  heroEl.addEventListener("mousemove", (e) => {
    const rect = heroEl.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
    if (!animationFrameId) animateGrid();
  });

  heroEl.addEventListener("mouseenter", () => {
    mouse.active = true;
    if (!animationFrameId) animateGrid();
  });

  heroEl.addEventListener("mouseleave", () => {
    mouse.active = false;
    mouse.x = null;
    mouse.y = null;
    if (!animationFrameId) animateGrid();
  });
}

// --- Swirling Galaxy / Vortex (Languages & About Sections) ---
function initGalaxyEffect(elementId, canvasId) {
  const parentEl = document.getElementById(elementId);
  const canvas = document.getElementById(canvasId);
  if (!parentEl || !canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let animationFrameId = null;

  const colors = [
    "rgba(99, 102, 241, ",  // Indigo
    "rgba(168, 85, 247, ",  // Purple
    "rgba(34, 211, 238, ",  // Cyan
    "rgba(8, 203, 0, ",     // Neon Green
    "rgba(255, 121, 198, "  // Hot Pink
  ];

  function resizeCanvas() {
    const rect = parentEl.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

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
      ctx.fillStyle = this.colorPrefix + this.alpha + ")";
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.colorPrefix + "1)";
      ctx.fill();
      ctx.restore();
    }
  }

  function animateGalaxy() {
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
      animationFrameId = requestAnimationFrame(animateGalaxy);
    } else {
      animationFrameId = null;
    }
  }

  parentEl.addEventListener("mousemove", (e) => {
    const rect = parentEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (particles.length < 150) {
      for (let i = 0; i < 3; i++) {
        particles.push(new GalaxyParticle(x, y));
      }
    }

    if (!animationFrameId) {
      animateGalaxy();
    }
  });
}

// --- Sparkler with Gravity (Features Section) ---
function initSparklerEffect() {
  const featEl = document.getElementById("features");
  const featCanvas = document.getElementById("features-particles");
  if (!featEl || !featCanvas) return;
  const ctx = featCanvas.getContext("2d");
  let particles = [];
  let animationFrameId = null;

  const colors = [
    "rgba(251, 191, 36, ",  // Amber/Gold
    "rgba(251, 146, 60, ",  // Orange
    "rgba(244, 63, 94, ",   // Rose
    "rgba(168, 85, 247, ",  // Purple
    "rgba(34, 211, 238, "   // Cyan
  ];

  function resizeFeatCanvas() {
    const rect = featEl.getBoundingClientRect();
    featCanvas.width = rect.width;
    featCanvas.height = rect.height;
  }

  resizeFeatCanvas();
  window.addEventListener("resize", resizeFeatCanvas);

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
      ctx.fillStyle = this.colorPrefix + this.alpha + ")";
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.colorPrefix + "1)";
      ctx.fill();
      ctx.restore();
    }
  }

  function animateSparkler() {
    ctx.clearRect(0, 0, featCanvas.width, featCanvas.height);
    
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
      animationFrameId = requestAnimationFrame(animateSparkler);
    } else {
      animationFrameId = null;
    }
  }

  featEl.addEventListener("mousemove", (e) => {
    const rect = featEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (particles.length < 120) {
      for (let i = 0; i < 3; i++) {
        particles.push(new SparklerParticle(x, y));
      }
    }

    if (!animationFrameId) {
      animateSparkler();
    }
  });
}

// --- Constellation Mesh (Live Demo & Contact Sections) ---
function initConstellationEffect(elementId, canvasId) {
  const parentEl = document.getElementById(elementId);
  const canvas = document.getElementById(canvasId);
  if (!parentEl || !canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let animationFrameId = null;

  const colors = [
    "rgba(99, 102, 241, ",  // Indigo
    "rgba(168, 85, 247, ",  // Purple
    "rgba(34, 211, 238, ",  // Cyan
    "rgba(8, 203, 0, ",     // Neon Green
    "rgba(255, 121, 198, "  // Hot Pink
  ];

  function resizeCanvas() {
    const rect = parentEl.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

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
      ctx.fillStyle = this.colorPrefix + this.alpha + ")";
      ctx.fill();
    }
  }

  function animateConstellation() {
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

    for (let i = 0; i < particles.length; i++) {
      particles[i].draw();
    }

    if (particles.length > 0) {
      animationFrameId = requestAnimationFrame(animateConstellation);
    } else {
      animationFrameId = null;
    }
  }

  parentEl.addEventListener("mousemove", (e) => {
    const rect = parentEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (particles.length < 80) {
      for (let i = 0; i < 2; i++) {
        particles.push(new ConstellationParticle(x, y));
      }
    }

    if (!animationFrameId) {
      animateConstellation();
    }
  });
}

// --- Home Page Setup ---
function initLandingPage() {
  startDemoAnimation();
  initHeroGridAnimation();
  initGalaxyEffect("languages", "languages-particles");
  initGalaxyEffect("about", "about-particles");
  initSparklerEffect();
  initConstellationEffect("live-demo", "live-demo-particles");
  initConstellationEffect("contact", "contact-particles");

  // Navigation Links smooth scrolling & Editor redirects
  const heroStartBtn = document.getElementById("hero-start-btn");
  if (heroStartBtn) {
    heroStartBtn.addEventListener("click", () => {
      window.location.href = "editor.html";
    });
  }

  const navCtaBtn = document.getElementById("nav-cta-btn");
  if (navCtaBtn) {
    navCtaBtn.addEventListener("click", () => {
      window.location.href = "editor.html";
    });
  }

  const mobileNavCta = document.getElementById("mobile-nav-cta");
  if (mobileNavCta) {
    mobileNavCta.addEventListener("click", () => {
      window.location.href = "editor.html";
    });
  }

  // Language Cards click redirect
  const langCards = document.querySelectorAll(".lang-card");
  langCards.forEach(card => {
    card.addEventListener("click", () => {
      const langKey = card.getAttribute("data-lang");
      window.location.href = `editor.html?lang=${langKey}`;
    });
  });

  // Smooth scroll for nav links on landing page
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      
      // Close mobile nav drawer if open
      const mobileNav = document.getElementById("mobile-nav");
      if (mobileNav) mobileNav.classList.add("hidden");

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Contact Form Submission Mock
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (typeof showToast === 'function') {
        showToast("Thank you! Your feedback has been sent.", "success");
      }
      contactForm.reset();
    });
  }

  // Intersection Observer for scroll reveal animations
  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target); // Reveal only once
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px"
    });
    
    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add("revealed"));
  }
}

document.addEventListener("DOMContentLoaded", initLandingPage);
