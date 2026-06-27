import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/80 pt-16 pb-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-4 text-left">
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
          <div className="flex flex-col gap-3 text-left">
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-2">
              Platform
            </h4>
            <a href="#hero" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200">
              Home
            </a>
            <a href="#languages" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200">
              Languages
            </a>
            <a href="#features" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200">
              Features
            </a>
            <a href="#about" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200">
              About
            </a>
            <a href="#contact" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200">
              Contact Us
            </a>
          </div>

          {/* Col 3: Languages */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-2">
              Popular Langs
            </h4>
            <a href="#languages" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200">
              HTML / CSS / JS
            </a>
            <a href="#languages" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200">
              C++ Compiler
            </a>
            <a href="#languages" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200">
              Python 3 Environment
            </a>
            <a href="#languages" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200">
              JavaScript Node Workspace
            </a>
            <a href="#languages" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors duration-200">
              Rust Cargo Compiler
            </a>
          </div>

          {/* Col 4: Contact info */}
          <div className="flex flex-col gap-3 text-left">
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
