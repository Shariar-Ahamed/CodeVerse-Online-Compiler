import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import EditorPage from './pages/EditorPage';
import ProfilePage from './pages/ProfilePage';
import Toast from './components/Toast';

function App() {
  // --- States ---
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("codeverse_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Error reading saved user session", e);
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("codeverse_theme") || "dark";
  });

  const [showMaintenance, setShowMaintenance] = useState(false);
  const [toast, setToast] = useState(null);

  // --- Theme Configuration on Mount ---
  useEffect(() => {
    // Sync theme with DOM document element class
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem("codeverse_theme", theme);
  }, [theme]);

  // Toggle Theme Switcher with Maintenance Modal
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      setShowMaintenance(true);
      showToast("Light Mode Active", "info");
    } else {
      setTheme('dark');
      showToast("Dracula Theme Active", "info");
    }
  };

  const handleCloseMaintenance = () => {
    setShowMaintenance(false);
    setTheme('dark');
    showToast("Reverted to Dracula Theme", "info");
  };

  // --- Auth Handlers ---
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("codeverse_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("codeverse_user");
    showToast("Signed out successfully", "info");
  };

  // --- Toast Trigger Helper ---
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-x-hidden transition-colors duration-300">
        {/* Shared Dynamic Header */}
        <Header
          user={user}
          onLogout={handleLogout}
          toggleTheme={toggleTheme}
          theme={theme}
        />

        {/* Dynamic Route Content */}
        <div className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage showToast={showToast} />} />
            <Route path="/login" element={<AuthPage user={user} onLogin={handleLogin} showToast={showToast} />} />
            <Route path="/editor" element={<EditorPage theme={theme} showToast={showToast} />} />
            <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} showToast={showToast} />} />
          </Routes>
        </div>

        {/* Shared Footer */}
        <Footer />

        {/* Theme Maintenance Alert Popup */}
        {showMaintenance && (
          <div id="maintenance-modal" className="modal-overlay fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 transition-all duration-300">
            <div className="w-full max-w-sm rounded-2xl border border-amber-500/25 bg-slate-900/95 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/50 p-6 text-center animate-fade-in-up flex flex-col items-center gap-4 relative">
              
              {/* Close Button X */}
              <button
                onClick={handleCloseMaintenance}
                className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none"
                title="Close and revert to Dark Mode"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-xl animate-pulse">
                <i className="fas fa-triangle-exclamation"></i>
              </div>
              
              <div>
                <h3 className="text-base font-bold text-white mb-2">Under Maintenance</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Light Mode is currently undergoing optimization maintenance. We recommend using our premium Dracula Dark Theme for best performance and code rendering!
                </p>
              </div>

              <button
                onClick={handleCloseMaintenance}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all duration-200 shadow-md shadow-amber-600/10 w-full mt-2"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification Container */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
