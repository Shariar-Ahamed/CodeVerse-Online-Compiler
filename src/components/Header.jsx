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
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
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
          <button onClick={() => navigate('/challenges')} className="nav-link text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus:outline-none">
            Challenges
          </button>
          <button onClick={() => navigate('/about')} className="nav-link text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus:outline-none">
            About
          </button>
          <button onClick={() => navigate('/contact')} className="nav-link text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus:outline-none">
            Contact
          </button>
          <button onClick={() => navigate('/leaderboard')} className="nav-link text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus:outline-none">
            Leaderboard
          </button>
          {user && user.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="nav-link text-indigo-400 hover:text-indigo-300 font-extrabold transition-colors duration-200 focus:outline-none flex items-center gap-1">
              <i className="fas fa-crown text-[10px] text-amber-400"></i>
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Quick Action Navigation Toolbar */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Switch */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200 focus:outline-none"
            title="Toggle Light/Dark Theme"
          >
            <i id="theme-icon" className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-sm`}></i>
          </button>

          {/* Authentication Container */}
          <div id="auth-nav-container" className="flex items-center gap-2">
            {!user ? (
              <button
                id="nav-signin-btn"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 shadow-md shadow-indigo-500/5 active:scale-95 transition-all duration-200"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </button>
            ) : (
              <div id="nav-user-profile" className={`${mobileMenuOpen ? 'hidden md:flex' : 'flex'} items-center gap-2 relative`}>
                {/* User Name */}
                <span className="hidden md:inline text-xs font-bold text-slate-300 max-w-[100px] truncate">
                  {user.name}
                </span>

                {/* User Avatar Button (Toggles Dropdown) */}
                <button
                  id="nav-user-avatar-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(prev => !prev);
                  }}
                  className="w-8 h-8 rounded-full border border-[var(--border-color)] text-white text-xs font-bold flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 font-sans overflow-hidden"
                  title="View Profile Actions"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-sm">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-44 rounded-xl border border-[var(--border-color)] bg-[#0f1420] shadow-2xl p-1.5 flex flex-col gap-1 z-50 animate-scale-up">
                    {/* Account Info summary */}
                    <div className="px-2.5 py-1.5 border-b border-[var(--border-color)]/30 mb-1 flex flex-col text-left">
                      <span className="text-[10px] font-bold text-slate-400 truncate">{user.name}</span>
                      <span className="text-[8px] font-mono text-slate-500 truncate mt-0.5">{user.email}</span>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(`/profile/${user.username || ''}`);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-150 cursor-pointer flex items-center gap-2"
                    >
                      <i className="far fa-user text-[10px] text-indigo-400 w-4 text-center"></i>
                      <span>My account</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        if (user.role === 'admin') {
                          navigate('/admin');
                        } else {
                          navigate('/editor');
                        }
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-150 cursor-pointer flex items-center gap-2"
                    >
                      <i className="fas fa-sliders text-[10px] text-cyan-400 w-4 text-center"></i>
                      <span>{user.role === 'admin' ? 'Admin Panel' : 'API Console'}</span>
                    </button>

                    <div className="h-[1px] bg-[var(--border-color)]/30 my-0.5" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150 cursor-pointer flex items-center gap-2"
                    >
                      <i className="fas fa-sign-out-alt text-[10px] text-rose-400 w-4 text-center"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger with animatable 3 lines */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200 focus:outline-none flex flex-col justify-center items-center gap-1 w-9 h-9"
          >
            <span className={`block w-4 h-[2px] bg-slate-300 transition-all duration-300 ease-in-out transform ${
              mobileMenuOpen ? "rotate-45 translate-y-[6px]" : ""
            }`}></span>
            <span className={`block w-4 h-[2px] bg-slate-300 transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? "opacity-0 scale-x-0" : ""
            }`}></span>
            <span className={`block w-4 h-[2px] bg-slate-300 transition-all duration-300 ease-in-out transform ${
              mobileMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""
            }`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel (Collapsible) with opening and closing transition */}
      <div
        id="mobile-nav"
        className={`md:hidden border-t border-[var(--border-color)] mobile-nav-custom-bg backdrop-blur-xl px-5 flex flex-col gap-3.5 text-sm font-medium overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? "max-h-[850px] opacity-100 py-4" 
            : "max-h-0 opacity-0 py-0 border-t-transparent pointer-events-none"
        }`}
      >
          <button onClick={() => handleNavClick('hero')} className="mobile-nav-link text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 block focus:outline-none flex items-center gap-3 transition-colors duration-200">
            <i className="fas fa-home text-indigo-400 w-5 text-center"></i>
            <span>Home</span>
          </button>
          <button onClick={() => handleNavClick('languages')} className="mobile-nav-link text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 block focus:outline-none flex items-center gap-3 transition-colors duration-200">
            <i className="fas fa-code text-cyan-400 w-5 text-center"></i>
            <span>Languages</span>
          </button>
          <button onClick={() => handleNavClick('features')} className="mobile-nav-link text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 block focus:outline-none flex items-center gap-3 transition-colors duration-200">
            <i className="fas fa-cubes text-purple-400 w-5 text-center"></i>
            <span>Features</span>
          </button>
          <button onClick={() => { navigate('/challenges'); setMobileMenuOpen(false); }} className="mobile-nav-link text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 block focus:outline-none flex items-center gap-3 transition-colors duration-200">
            <i className="fas fa-trophy text-amber-400 w-5 text-center"></i>
            <span>Challenges</span>
          </button>
          <button onClick={() => { navigate('/about'); setMobileMenuOpen(false); }} className="mobile-nav-link text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 block focus:outline-none flex items-center gap-3 transition-colors duration-200">
            <i className="fas fa-info-circle text-emerald-400 w-5 text-center"></i>
            <span>About</span>
          </button>
          <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }} className="mobile-nav-link text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 block focus:outline-none flex items-center gap-3 transition-colors duration-200">
            <i className="fas fa-envelope text-rose-400 w-5 text-center"></i>
            <span>Contact</span>
          </button>
          <button onClick={() => { navigate('/leaderboard'); setMobileMenuOpen(false); }} className="mobile-nav-link text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 block focus:outline-none flex items-center gap-3 transition-colors duration-200">
            <i className="fas fa-award text-violet-400 w-5 text-center"></i>
            <span>Leaderboard</span>
          </button>
          {user && user.role === 'admin' && (
            <button onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} className="mobile-nav-link text-left text-indigo-400 font-extrabold py-2 block focus:outline-none flex items-center gap-3 transition-colors duration-200">
              <i className="fas fa-crown text-amber-400 w-5 text-center animate-pulse"></i>
              <span>Admin Panel</span>
            </button>
          )}
          


          {/* Mobile Auth Container */}
          <div id="mobile-auth-container" className="border-t border-[var(--border-color)]/50 pt-3 flex flex-col gap-2.5">
            {!user ? (
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 active:scale-95 transition-all duration-200"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </button>
            ) : (
              <div id="mobile-user-profile" className="flex flex-col gap-2.5 bg-[var(--bg-tertiary)]/20 p-3 rounded-xl border border-[var(--border-color)]">
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
                  <div className="flex flex-col text-left">
                    <span id="mobile-user-name" className="text-xs font-bold text-[var(--text-primary)]">{user.name || 'User'}</span>
                    <span id="mobile-user-email" className="text-[10px] text-[var(--text-secondary)] font-mono">{user.email || ''}</span>
                  </div>
                </div>
                {!location.pathname.startsWith('/profile') && (
                  <button
                    onClick={() => {
                      navigate(`/profile/${user.username || ''}`);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-1.5 mt-1 rounded-lg text-xs font-bold text-slate-300 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 transition-all duration-200 text-center"
                  >
                    Developer Profile
                  </button>
                )}
              </div>
            )}
            
            {/* Mobile Sign Out Option at the bottom */}
            {user && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 active:scale-95 transition-all duration-200"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Sign Out</span>
              </button>
            )}
          </div>
      </div>
    </header>
  );
}
