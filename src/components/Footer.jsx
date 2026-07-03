import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (sectionId) => {
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };
  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/95 pt-10 sm:pt-16 pb-8 transition-all duration-300 relative overflow-hidden">
      {/* High-Tech Wireframe Mesh Wave Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 select-none">
        <svg className="absolute bottom-0 left-0 w-full h-[320px]" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wave fills */}
          <path d="M0,160 C360,320 720,0 1080,160 C1260,240 1380,240 1440,160 L1440,320 L0,320 Z" fill="url(#footerGlow)" opacity="0.04" />
          
          {/* Wireframe waves curves */}
          <path d="M0,120 Q360,260 720,160 T1440,120" stroke="url(#footerLineGlow)" strokeWidth="1" opacity="0.5" />
          <path d="M0,140 Q360,300 720,200 T1440,140" stroke="url(#footerLineGlow2)" strokeWidth="0.8" opacity="0.4" />
          <path d="M0,160 Q360,340 720,240 T1440,160" stroke="url(#footerLineGlow)" strokeWidth="0.6" opacity="0.3" />
          <path d="M0,100 Q360,220 720,120 T1440,100" stroke="url(#footerLineGlow2)" strokeWidth="0.5" opacity="0.25" />
          <path d="M0,80 Q360,180 720,80 T1440,80" stroke="url(#footerLineGlow)" strokeWidth="0.4" opacity="0.2" />
          <path d="M0,180 Q360,380 720,280 T1440,180" stroke="url(#footerLineGlow2)" strokeWidth="0.3" opacity="0.15" />
          
          {/* Mesh vertical line dividers */}
          <path d="M80,0 L80,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M160,0 L160,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M240,0 L240,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M320,0 L320,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M400,0 L400,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M480,0 L480,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M560,0 L560,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M640,0 L640,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M720,0 L720,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M800,0 L800,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M880,0 L880,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M960,0 L960,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M1040,0 L1040,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M1120,0 L1120,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M1200,0 L1200,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M1280,0 L1280,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />
          <path d="M1360,0 L1360,320" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.5" />

          {/* Gradients */}
          <defs>
            <linearGradient id="footerGlow" x1="0" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="footerLineGlow" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
              <stop offset="30%" stopColor="#6366f1" stopOpacity="1" />
              <stop offset="70%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="footerLineGlow2" x1="1440" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="30%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 pb-12">
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-4 text-center md:text-left items-center md:items-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md">
                <i className="fas fa-cubes text-white text-sm"></i>
              </div>
              <span className="text-md font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                CodeVerse
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              An advanced online programming compiler and interactive web
              development playground built for developers worldwide.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://github.com/Shariar-Ahamed"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/50 bg-[var(--bg-tertiary)]/30 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
              >
                <i className="fab fa-github text-sm"></i>
              </a>
              <a
                href="https://x.com/ShariarAlways"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/50 bg-[var(--bg-tertiary)]/30 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
              >
                <i className="fab fa-twitter text-sm"></i>
              </a>
              <a
                href="https://www.shariarahamed.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/50 bg-[var(--bg-tertiary)]/30 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                title="Portfolio Website"
              >
                <i className="fas fa-globe text-sm"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="flex flex-col gap-3 text-center md:text-left items-center md:items-start">
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-2">
              Platform
            </h4>
            <button
              onClick={() => handleNavClick('hero')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none bg-transparent border-none p-0 cursor-pointer text-center md:text-left"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('languages')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none bg-transparent border-none p-0 cursor-pointer text-center md:text-left"
            >
              Languages
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none bg-transparent border-none p-0 cursor-pointer text-center md:text-left"
            >
              Features
            </button>
            <button
              onClick={() => navigate('/about')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none bg-transparent border-none p-0 cursor-pointer text-center md:text-left"
            >
              About
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none bg-transparent border-none p-0 cursor-pointer text-center md:text-left"
            >
              Contact Us
            </button>
          </div>

          {/* Col 3: Languages */}
          <div className="flex flex-col gap-3 text-center md:text-left items-center md:items-start">
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-2">
              Popular Langs
            </h4>
            <button
              onClick={() => handleNavClick('languages')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none bg-transparent border-none p-0 cursor-pointer text-center md:text-left"
            >
              HTML / CSS / JS
            </button>
            <button
              onClick={() => handleNavClick('languages')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none bg-transparent border-none p-0 cursor-pointer text-center md:text-left"
            >
              C++ Compiler
            </button>
            <button
              onClick={() => handleNavClick('languages')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none bg-transparent border-none p-0 cursor-pointer text-center md:text-left"
            >
              Python 3 Environment
            </button>
            <button
              onClick={() => handleNavClick('languages')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none bg-transparent border-none p-0 cursor-pointer text-center md:text-left"
            >
              JavaScript Node Workspace
            </button>
            <button
              onClick={() => handleNavClick('languages')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none bg-transparent border-none p-0 cursor-pointer text-center md:text-left"
            >
              Rust Cargo Compiler
            </button>
          </div>

          {/* Col 4: Contact info */}
          <div className="flex flex-col gap-3 text-center md:text-left items-center md:items-start">
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-2">
              Contact Info
            </h4>
            <a
              href="mailto:shariaralways@gmail.com"
              className="text-xs text-[var(--text-secondary)] hover:text-white flex items-center gap-2 transition-colors duration-200"
            >
              <i className="fas fa-envelope text-indigo-400"></i>
              <span>shariaralways@gmail.com</span>
            </a>
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-indigo-400"></i>
              <span>Dhaka, Bangladesh</span>
            </span>
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <i className="fas fa-briefcase text-indigo-400"></i>
              <span>Available for Opportunities</span>
            </span>
          </div>
        </div>

        {/* Copyright section */}
        <div className="border-t border-[var(--border-color)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[var(--text-muted)] font-mono">
          <div>
            &copy; 2026 CodeVerse IDE. Created for developers worldwide.
          </div>
          <div className="flex items-center gap-4">
            <span>
              Developed by{' '}
              <a
                href="https://www.shariarahamed.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-[var(--text-secondary)]"
              >
                Shariar Ahamed
              </a>
            </span>
            <span>
              <i className="fas fa-shield-alt text-indigo-400 mr-1"></i>
              Secure Sandbox Execution
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
