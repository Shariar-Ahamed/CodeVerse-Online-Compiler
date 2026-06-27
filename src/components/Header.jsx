import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ user, onLogout, toggleTheme, theme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setDropdownOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
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

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 w-full border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/45 z-30 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div
          id="brand-logo"
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fas fa-cubes text-white text-lg animate-pulse"></i>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent leading-none">
              CodeVerse
            </h1>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium tracking-wider uppercase mt-0.5">
              Online Compiler
            </p>
          </div>
        </div>

        {/* Navigation Links (Hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button onClick={() => handleNavClick('hero')} className="nav-link text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus:outline-none">
            Home
          </button>
          <button onClick={() => handleNavClick('languages')} className="nav-link text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus:outline-none">
            Languages
          </button>
          <button onClick={() => handleNavClick('features')} className="nav-link text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus:outline-none">
            Features
          </button>
          <button onClick={() => navigate('/about')} className="nav-link text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus:outline-none">
            About
          </button>
          <button onClick={() => navigate('/contact')} className="nav-link text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus:outline-none">
            Contact
          </button>
        </nav>

        {/* Quick Action Navigation Toolbar */}
        <div className="flex items-center gap-3">
          {/* Authentication Container */}
          <div id="auth-nav-container" className="flex items-center gap-2">
            {!user ? (
              <button
                id="nav-signin-btn"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10 active:scale-95 transition-all duration-200"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </button>
            ) : (
              <div id="nav-user-profile" className="flex items-center gap-2.5">
                {/* User Avatar Button (Goes directly to Profile) */}
                <button
                  id="nav-user-avatar-btn"
                  onClick={() => navigate('/profile')}
                  className="w-8 h-8 rounded-full border border-[var(--border-color)] text-white text-xs font-bold flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 font-sans overflow-hidden"
                  title="View Developer Profile"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick CTA to IDE (Hidden if already on editor) */}
          {location.pathname !== '/editor' && (
            <button
              onClick={() => navigate('/editor')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10 active:scale-95 transition-all duration-200"
            >
              <i className="fas fa-terminal"></i>
              <span>Launch IDE</span>
            </button>
          )}

          {/* Theme Toggle Switch */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200 focus:outline-none"
            title="Toggle Light/Dark Theme"
          >
            <i id="theme-icon" className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-sm`}></i>
          </button>

          {/* Direct Sign Out Button (Shown on the right of Theme Toggle) */}
          {user && (
            <button
              id="nav-signout-direct-btn"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              title="Sign Out"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Sign Out</span>
            </button>
          )}

          {/* Mobile Menu Trigger */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200 focus:outline-none"
          >
            <i className="fas fa-bars text-sm"></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel (Collapsible) */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-xl px-4 py-3 flex flex-col gap-3 text-sm font-medium animate-scale-up"
        >
          <button onClick={() => handleNavClick('hero')} className="mobile-nav-link text-left text-[var(--text-secondary)] py-1.5 block focus:outline-none">Home</button>
          <button onClick={() => handleNavClick('languages')} className="mobile-nav-link text-left text-[var(--text-secondary)] py-1.5 block focus:outline-none">Languages</button>
          <button onClick={() => handleNavClick('features')} className="mobile-nav-link text-left text-[var(--text-secondary)] py-1.5 block focus:outline-none">Features</button>
          <button onClick={() => { navigate('/about'); setMobileMenuOpen(false); }} className="mobile-nav-link text-left text-[var(--text-secondary)] py-1.5 block focus:outline-none">About</button>
          <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }} className="mobile-nav-link text-left text-[var(--text-secondary)] py-1.5 block focus:outline-none">Contact</button>
          
          {location.pathname !== '/editor' && (
            <button
              onClick={() => {
                navigate('/editor');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 mt-2 rounded-lg text-xs font-bold text-white bg-indigo-600"
            >
              <i className="fas fa-terminal"></i>
              <span>Launch IDE</span>
            </button>
          )}

          {/* Mobile Auth Container */}
          <div id="mobile-auth-container" className="border-t border-[var(--border-color)]/50 pt-2 flex flex-col gap-2">
            {!user ? (
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 transition-all duration-200"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </button>
            ) : (
              <div id="mobile-user-profile" className="flex flex-col gap-2 bg-[var(--bg-tertiary)]/20 p-3 rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center gap-2.5">
                  <div id="mobile-user-avatar" className="w-8 h-8 rounded-full border border-[var(--border-color)] text-white text-xs font-bold font-mono overflow-hidden flex items-center justify-center">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center">
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span id="mobile-user-name" className="text-xs font-bold text-[var(--text-primary)]">{user.name || 'User'}</span>
                    <span id="mobile-user-email" className="text-[10px] text-[var(--text-secondary)] font-mono">{user.email || ''}</span>
                  </div>
                </div>
                {location.pathname !== '/profile' && (
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-1.5 mt-1 rounded-lg text-xs font-bold text-slate-300 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 transition-all duration-200 text-center"
                  >
                    Developer Profile
                  </button>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-1.5 mt-1 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
