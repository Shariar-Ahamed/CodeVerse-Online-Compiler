import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import TwinklingText from "../components/TwinklingText";

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
      {/* Local custom premium floating animations */}
      <style>{`
        @keyframes float-main {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes float-bubble-slow {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(0.9); opacity: 0.6; }
          50% { transform: translateY(-12px) translateX(6px) scale(1.1); opacity: 0.95; }
        }
        @keyframes float-bubble-fast {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.5; }
          50% { transform: translateY(10px) translateX(-8px) scale(0.85); opacity: 0.8; }
        }
        @keyframes twinkle {
          0%, 100% { transform: scale(0.6) rotate(0deg); opacity: 0.3; filter: drop-shadow(0 0 1px rgba(253, 224, 71, 0.2)); }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; filter: drop-shadow(0 0 4px rgba(253, 224, 71, 0.8)); }
        }
        @keyframes twinkle-slow {
          0%, 100% { transform: scale(0.5) rotate(0deg); opacity: 0.2; }
          50% { transform: scale(1) rotate(-180deg); opacity: 0.9; filter: drop-shadow(0 0 3px rgba(165, 180, 252, 0.7)); }
        }
        .animate-float-main {
          animation: float-main 6s ease-in-out infinite;
        }
        .animate-bubble-slow {
          animation: float-bubble-slow 5s ease-in-out infinite;
        }
        .animate-bubble-fast {
          animation: float-bubble-fast 4s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 2.5s ease-in-out infinite;
        }
        .animate-twinkle-slow {
          animation: twinkle-slow 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* Background Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-600/5 blur-[120px] z-0 pointer-events-none"></div>

      <section
        id="contact"
        ref={contactRef}
        className="w-full pt-6 pb-6 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)] relative flex flex-col justify-center overflow-hidden"
      >
        <canvas
          ref={contactCanvasRef}
          id="contact-particles"
          className="absolute inset-0 pointer-events-none z-0"
        />

        <div className="w-full max-w-5xl mx-auto relative z-10 w-full animate-fade-in-up bg-[#0d1321]/95 border border-[var(--border-color)]/70 md:border-none md:bg-transparent rounded-3xl md:rounded-none pt-6 pb-12 px-6 md:pt-12 md:pb-20 md:px-16 overflow-visible relative shadow-[0_20px_50px_rgba(99,102,241,0.12)] md:shadow-none">
          {/* Desktop Custom SVG Background with custom cutouts & tabs */}
          <div className="absolute inset-0 -z-10 pointer-events-none hidden md:block">
            <svg
              className="w-full h-full filter drop-shadow-[0_25px_45px_rgba(99,102,241,0.22)]"
              viewBox="0 0 1000 620"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 140,40 
                   L 860,40 
                   A 40,40 0 0 1 900,80 
                   A 25,25 0 0 1 900,130
                   L 900,420
                   A 20,20 0 0 0 900,460
                   A 25,25 0 0 1 900,510
                   L 900,530
                   A 40,40 0 0 1 860,570
                   L 140,570
                   A 40,40 0 0 1 100,530
                   L 100,310
                   A 20,20 0 0 0 100,270
                   A 25,25 0 0 1 100,220
                   A 20,20 0 0 0 100,180
                   L 100,140
                   A 20,20 0 0 0 100,100
                   L 100,80
                   A 40,40 0 0 1 140,40
                   Z"
                fill="#0d1321"
                fillOpacity="0.95"
                stroke="rgba(99, 102, 241, 0.35)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* Centered Header Section for the Entire Card */}
          <div className="text-center mb-10 relative z-10 md:px-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2.5 font-sans">
              Connect with{' '}
              <TwinklingText className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                CodeVerse
              </TwinklingText>
            </h2>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
              Have queries about our sandbox runtime compiler, custom coding challenges, leaderboard rankings, or developer ticket support? Send us a message and our dev support crew will get back to you shortly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Illustration, Contact Details, Socials */}
            <div className="flex flex-col gap-3 text-center items-center relative z-10 pl-4 md:pl-28 lg:pl-36 pr-4 md:pr-8">
              {/* Animated Vector Illustration using PNG */}
              <div className="relative w-64 h-64 flex items-center justify-center select-none mx-auto mb-0">
                {/* Outer spinning decorative elements */}
                <div className="absolute w-48 h-48 rounded-full border border-dashed border-indigo-500/20 animate-spin-slow z-0"></div>
                <div className="absolute w-56 h-56 rounded-full border border-dotted border-purple-500/15 animate-spin-reverse-slow z-0"></div>

                {/* Ambient background glow aura */}
                <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-cyan-500/20 blur-2xl animate-pulse z-0 pointer-events-none"></div>

                {/* Floating Bubbles/Dots/Crosses around the PNG to merge it into the animation */}
                {/* Bubble 1 (Cyan) */}
                <div className="absolute top-4 left-6 w-3 h-3 rounded-full bg-cyan-400/40 border border-cyan-300/30 blur-[0.5px] animate-bubble-slow z-10"></div>
                {/* Bubble 2 (Pink) */}
                <div className="absolute bottom-22 right-6 w-4 h-4 rounded-full bg-pink-500/35 border border-pink-400/30 blur-[0.5px] animate-bubble-fast z-10"></div>
                {/* Bubble 3 (Purple) */}
                <div className="absolute top-8 right-8 w-2.5 h-2.5 rounded-full bg-purple-400/40 border border-purple-300/30 animate-bubble-slow [animation-delay:1s] z-10"></div>
                {/* Bubble 4 (Yellow) */}
                <div className="absolute bottom-26 left-8 w-3 h-3 rounded-full bg-yellow-400/30 border border-yellow-300/20 animate-bubble-fast [animation-delay:1.5s] z-10"></div>
                {/* Cross 1 (Indigo/White) */}
                <span className="absolute top-2 right-16 text-[10px] text-slate-400/60 animate-bubble-slow [animation-delay:2s] z-10">
                  <i className="fas fa-plus"></i>
                </span>
                {/* Star 1 (Yellow) */}
                <span className="absolute bottom-16 left-16 text-[10px] text-yellow-300/50 animate-bubble-fast [animation-delay:0.5s] z-10">
                  <i className="fas fa-star"></i>
                </span>

                {/* Main Mail Illustration Image with Float Animation */}
                <img
                  src="/contact-img.png"
                  alt="Contact Illustration"
                  className="w-52 h-52 object-contain z-10 animate-float-main drop-shadow-[0_12px_28px_rgba(99,102,241,0.25)]"
                />
              </div>

              {/* Unified Contact Info & Socials Container */}
              <div className="flex flex-col gap-4 items-center w-full mt-[-28px]">
                {/* Contact Details */}
                <div className="flex flex-col gap-2 text-center w-full max-w-sm mx-auto">
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-indigo-400 text-sm shrink-0">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <p className="text-[12px] text-slate-300 leading-relaxed">
                      Dhaka, Bangladesh
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <div className="text-cyan-400 text-sm shrink-0">
                      <i className="fas fa-phone-alt"></i>
                    </div>
                    <p className="text-[12px] text-slate-300 leading-relaxed">
                      +8801320916624
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <div className="text-purple-400 text-sm shrink-0">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <a
                      href="mailto:shariaralways@gmail.com"
                      className="text-[12px] text-slate-300 hover:text-indigo-400 leading-relaxed transition-colors duration-150"
                    >
                      shariaralways@gmail.com
                    </a>
                  </div>
                </div>

                {/* Social icons */}
                <div className="flex items-center justify-center gap-4 mt-1">
                  <a
                    href="https://www.facebook.com/Shahriar.TheBrownCat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-90 shadow-sm"
                  >
                    <i className="fab fa-facebook-f text-sm"></i>
                  </a>
                  <a
                    href="https://x.com/ShariarAlways"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-90 shadow-sm"
                  >
                    <i className="fab fa-twitter text-sm"></i>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/shariarahamed/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-90 shadow-sm"
                  >
                    <i className="fab fa-linkedin-in text-sm"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="flex flex-col gap-6 text-left relative z-10 pr-4 md:pr-20 lg:pr-24 pl-4 md:pl-8">
              <form
                onSubmit={handleContactSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-[12px] font-semibold text-indigo-200/80 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-6 py-3 rounded-full text-xs bg-[#121826]/75 border border-slate-700/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-200"
                    placeholder="Write your name"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-indigo-200/80 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-6 py-3 rounded-full text-xs bg-[#121826]/75 border border-slate-700/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-200"
                    placeholder="abc@yourdomain.com"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-indigo-200/80 mb-2">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-6 py-3.5 rounded-2xl text-xs bg-[#121826]/75 border border-slate-700/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-200 resize-none"
                    placeholder="Type something if you want..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-40 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-wider text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 active:scale-95 transition-all duration-300 shadow-[0_4px_15px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_22px_rgba(99,102,241,0.55)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {submitLoading ? (
                    <>
                      <i className="fas fa-circle-notch animate-spin text-xs"></i>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>
              </form>
            </div>
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
