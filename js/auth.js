/**
 * CodeVerse - Dedicated Auth Page JavaScript Engine
 * Handles Login & Registration form submissions, sliding card transitions, and background particle animation
 */

let authCurrentTab = "login"; // "login" or "signup"

const authDOM = {
  authCard: document.getElementById("auth-card"),
  authTabLogin: document.getElementById("auth-tab-login"),
  authTabSignup: document.getElementById("auth-tab-signup"),
  authTabIndicator: document.getElementById("auth-tab-indicator"),
  authSlider: document.getElementById("auth-slider"),

  // Login Form elements
  loginForm: document.getElementById("login-form"),
  loginEmail: document.getElementById("login-email"),
  loginPassword: document.getElementById("login-password"),
  loginTogglePass: document.querySelector(".login-toggle-pass"),

  // Signup Form elements
  signupForm: document.getElementById("signup-form"),
  signupName: document.getElementById("signup-name"),
  signupEmail: document.getElementById("signup-email"),
  signupPassword: document.getElementById("signup-password"),
  signupConfirmPass: document.getElementById("signup-confirm-pass"),
  signupTogglePass: document.querySelector(".signup-toggle-pass"),

  // Social logins
  authSocialGithub: document.getElementById("auth-social-github"),
  authSocialGoogle: document.getElementById("auth-social-google")
};

// --- Form Sliding Transition Logic ---
function switchAuthTab(tab) {
  authCurrentTab = tab;
  if (!authDOM.authSlider || !authDOM.authTabIndicator) return;

  if (tab === "login") {
    // Slide forms left to 0%
    authDOM.authSlider.style.transform = "translateX(0%)";
    // Slide indicator tab
    authDOM.authTabIndicator.style.left = "0%";

    // Tab buttons active states
    authDOM.authTabLogin.classList.remove("text-[var(--text-secondary)]");
    authDOM.authTabLogin.classList.add("text-white");
    authDOM.authTabSignup.classList.remove("text-white");
    authDOM.authTabSignup.classList.add("text-[var(--text-secondary)]");
  } else {
    // Slide forms right to -50%
    authDOM.authSlider.style.transform = "translateX(-50%)";
    // Slide indicator tab
    authDOM.authTabIndicator.style.left = "50%";

    // Tab buttons active states
    authDOM.authTabSignup.classList.remove("text-[var(--text-secondary)]");
    authDOM.authTabSignup.classList.add("text-white");
    authDOM.authTabLogin.classList.remove("text-white");
    authDOM.authTabLogin.classList.add("text-[var(--text-secondary)]");
  }
}

// --- Submit Handlers ---
function handleLoginSubmit(e) {
  e.preventDefault();
  if (!authDOM.loginEmail || !authDOM.loginPassword) return;

  const email = authDOM.loginEmail.value.trim();
  const password = authDOM.loginPassword.value;

  const name = email.split('@')[0]; // Default user name from email
  const loggedUser = { name: name.charAt(0).toUpperCase() + name.slice(1), email };
  localStorage.setItem("codeverse_user", JSON.stringify(loggedUser));
  
  if (typeof showToast === 'function') {
    showToast(`Welcome back, ${loggedUser.name}!`, "success");
  }
  
  if (typeof initAuth === 'function') initAuth();

  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

function handleSignupSubmit(e) {
  e.preventDefault();
  if (!authDOM.signupName || !authDOM.signupEmail || !authDOM.signupPassword || !authDOM.signupConfirmPass) return;

  const name = authDOM.signupName.value.trim();
  const email = authDOM.signupEmail.value.trim();
  const password = authDOM.signupPassword.value;
  const confirmPass = authDOM.signupConfirmPass.value;

  if (password !== confirmPass) {
    if (typeof showToast === 'function') showToast("Passwords do not match!", "error");
    return;
  }

  const loggedUser = { name, email };
  localStorage.setItem("codeverse_user", JSON.stringify(loggedUser));

  if (typeof showToast === 'function') {
    showToast(`Welcome to CodeVerse, ${name}!`, "success");
  }

  if (typeof initAuth === 'function') initAuth();

  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

// --- Password Visibility Toggles ---
function togglePassword(inputEl, buttonEl) {
  if (!inputEl || !buttonEl) return;
  const type = inputEl.getAttribute("type") === "password" ? "text" : "password";
  inputEl.setAttribute("type", type);
  const icon = buttonEl.querySelector("i");
  if (icon) {
    icon.className = type === "password" ? "fas fa-eye text-xs" : "fas fa-eye-slash text-xs";
  }
}

// --- Interactive Swirling Canvas Particles ---
function initCanvasParticles() {
  const canvas = document.getElementById("auth-particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: null, y: null, radius: 120 };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.2 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = (Math.random() - 0.5) * 0.8;
      this.baseColor = Math.random() > 0.5 ? "rgba(99, 102, 241, " : "rgba(34, 211, 238, ";
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      // Boundaries check
      if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
      if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

      // Mouse interactive attraction
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          this.x -= dx * force * 0.03;
          this.y -= dy * force * 0.03;
        }
      }

      this.x += this.speedX;
      this.y += this.speedY;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.baseColor + this.alpha + ")";
      ctx.fill();
    }
  }

  function setupParticles() {
    particles = [];
    let numberOfParticles = Math.min(100, (canvas.width * canvas.height) / 14000);
    for (let i = 0; i < numberOfParticles; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    const maxDist = 80;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          let alpha = (1 - dist / maxDist) * 0.15;
          ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    drawConnections();
    requestAnimationFrame(animate);
  }

  setupParticles();
  animate();

  window.addEventListener("resize", setupParticles);
}

// --- Main Init Auth Page ---
function initAuthPage() {
  const savedUser = localStorage.getItem("codeverse_user");
  if (savedUser) {
    window.location.href = "index.html";
    return;
  }

  // Active tab setup
  if (authDOM.authTabLogin) {
    authDOM.authTabLogin.addEventListener("click", () => switchAuthTab("login"));
  }
  if (authDOM.authTabSignup) {
    authDOM.authTabSignup.addEventListener("click", () => switchAuthTab("signup"));
  }

  // Submit bindings
  if (authDOM.loginForm) {
    authDOM.loginForm.addEventListener("submit", handleLoginSubmit);
  }
  if (authDOM.signupForm) {
    authDOM.signupForm.addEventListener("submit", handleSignupSubmit);
  }

  // Password toggles binding
  if (authDOM.loginTogglePass) {
    authDOM.loginTogglePass.addEventListener("click", () => {
      togglePassword(authDOM.loginPassword, authDOM.loginTogglePass);
    });
  }
  if (authDOM.signupTogglePass) {
    authDOM.signupTogglePass.addEventListener("click", () => {
      togglePassword(authDOM.signupPassword, authDOM.signupTogglePass);
    });
  }

  // Mock social bindings
  if (authDOM.authSocialGithub) {
    authDOM.authSocialGithub.addEventListener("click", () => {
      const loggedUser = { name: "GitHub Coder", email: "github-coder@codeverse.me" };
      localStorage.setItem("codeverse_user", JSON.stringify(loggedUser));
      if (typeof showToast === 'function') showToast("Logged in via GitHub", "success");
      setTimeout(() => { window.location.href = "index.html"; }, 800);
    });
  }
  if (authDOM.authSocialGoogle) {
    authDOM.authSocialGoogle.addEventListener("click", () => {
      const loggedUser = { name: "Google Dev", email: "google-dev@codeverse.me" };
      localStorage.setItem("codeverse_user", JSON.stringify(loggedUser));
      if (typeof showToast === 'function') showToast("Logged in via Google", "success");
      setTimeout(() => { window.location.href = "index.html"; }, 800);
    });
  }

  // Background swirl particles setup
  initCanvasParticles();
}

document.addEventListener("DOMContentLoaded", initAuthPage);
