import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function ContactPage({ showToast }) {
  const contactRef = useRef(null);
  const contactCanvasRef = useRef(null);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const parentEl = contactRef.current;
    const canvas = contactCanvasRef.current;
    if (!parentEl || !canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animFrameId = null;
    const colors = [
      "rgba(99, 102, 241, ",
      "rgba(168, 85, 247, ",
      "rgba(34, 211, 238, ",
      "rgba(8, 203, 0, ",
      "rgba(255, 121, 198, ",
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
        ctx.fillStyle = this.colorPrefix + this.alpha + ")";
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
      ctx.save();
      ctx.restore();

      for (let p of particles) p.draw();

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

      if (particles.length < 80) {
        for (let i = 0; i < 2; i++) {
          particles.push(new ConstellationParticle(x, y));
        }
      }
      if (!animFrameId) animate();
    };

    parentEl.addEventListener("mousemove", handleMove);
    window.addEventListener("resize", setupCanvas);
    setupCanvas();

    return () => {
      parentEl.removeEventListener("mousemove", handleMove);
      window.removeEventListener("resize", setupCanvas);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      setSubmitLoading(true);
      await addDoc(collection(db, "contacts"), {
        name: contactName.trim(),
        email: contactEmail.trim().toLowerCase(),
        message: contactMessage.trim(),
        createdAt: new Date().toISOString(),
      });

      setShowSuccessModal(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      console.error("Error sending contact message:", err);
      showToast("Failed to send message. Please try again.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center">
      {/* Background Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-600/5 blur-[120px] z-0 pointer-events-none"></div>

      <section
        id="contact"
        ref={contactRef}
        className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative flex flex-col justify-center min-h-[70vh] overflow-hidden"
      >
        <canvas
          ref={contactCanvasRef}
          id="contact-particles"
          className="absolute inset-0 pointer-events-none z-0"
        />

        <div className="max-w-5xl mx-auto relative z-10 w-full animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Contact details */}
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
                  Have feedback, suggestions, or API connection issues? Drop us
                  a message. Our compiler status monitors ensure logical sandbox
                  resources stay up 24/7.
                </p>
              </div>

              {/* Quick Info Cards */}
              <div className="flex flex-col gap-4">
                <a
                  href="mailto:shariaralways@gmail.com"
                  className="glass-panel p-4 rounded-xl border border-[var(--border-color)] flex items-center gap-4 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-base">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">
                      Direct Support
                    </h4>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      shariaralways@gmail.com
                    </p>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/shariarahamed/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-panel p-4 rounded-xl border border-[var(--border-color)] flex items-center gap-4 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-base">
                    <i className="fab fa-linkedin-in"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">
                      Professional Profile
                    </h4>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      linkedin.com/in/shariarahamed
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-2 px-1 text-xs text-[var(--text-secondary)] font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>All compiler sandboxes fully operational</span>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
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
                disabled={submitLoading}
                className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10 active:scale-95 transition-all duration-200 btn-premium-glow disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitLoading ? (
                  <>
                    <i className="fas fa-circle-notch animate-spin"></i>
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Premium Glassmorphic Success Confirmation Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/20 bg-[#0d1321]/90 shadow-2xl shadow-emerald-500/5 p-6 md:p-8 animate-scale-up text-center relative overflow-hidden glass-panel">
            {/* Ambient Background Glow Orbs */}
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

            {/* Glowing Emerald Checkmark Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#08CB00] text-3xl mx-auto mb-5 shadow-lg shadow-emerald-500/10 animate-bounce">
              <i className="fas fa-circle-check"></i>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-extrabold text-white mb-2.5 tracking-tight">
              Message Received!
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 px-1">
              Thank you for reaching out to{" "}
              <span className="text-indigo-400 font-bold">CodeVerse</span>. Your
              developer ticket has been logged successfully and our support crew
              will review it shortly!
            </p>

            {/* Premium Confirm Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 border border-white/10"
            >
              Great, Thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
