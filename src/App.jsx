import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import EditorPage from './pages/EditorPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Toast from './components/Toast';
import ChallengesPage from './pages/ChallengesPage';
import ChallengeWorkspacePage from './pages/ChallengeWorkspacePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';


function AppContent() {
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

  const [authChecking, setAuthChecking] = useState(true);
  const [redirectChecking, setRedirectChecking] = useState(true);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("codeverse_theme") || "dark";
  });

  const [showMaintenance, setShowMaintenance] = useState(false);
  const [toast, setToast] = useState(null);
  const location = useLocation();

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

  // --- Scroll to Top on Page Navigation ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  // --- Handle Firebase redirect login result on app mount ---
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const name = result.user.displayName || result.user.email?.split('@')[0] || "Developer";
          showToast(`Welcome back, ${name}!`, 'success');
          
          // Migrate local notes to Firestore if needed
          try {
            const saved = localStorage.getItem("codeverse_notes");
            if (saved) {
              const localNotes = JSON.parse(saved);
              if (Array.isArray(localNotes) && localNotes.length > 0) {
                const userNotesRef = collection(db, "users", result.user.uid, "notes");
                const snapshot = await getDocs(userNotesRef);
                if (snapshot.empty) {
                  for (const note of localNotes) {
                    if (note.id === 'welcome' && note.content.includes("Welcome to your personal scratchpad!")) continue;
                    await setDoc(doc(db, "users", result.user.uid, "notes", note.id), {
                      title: note.title || 'Untitled Note',
                      content: note.content || '',
                      updatedAt: note.updatedAt || new Date().toISOString()
                    });
                  }
                }
              }
            }
          } catch (migrateErr) {
            console.error("Redirect notes migration error:", migrateErr);
          }
        }
      })
      .catch((err) => {
        console.error("Redirect sign-in error:", err);
        if (err.code && err.code !== 'auth/redirect-cancelled') {
          showToast(`Redirect Sign-In failed: ${err.message || err.code}`, 'error');
        }
      })
      .finally(() => {
        setRedirectChecking(false);
      });
  }, []);

  // --- Firebase Auth state observer ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Authenticated Firebase User
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          isGuest: false,
          role: 'user',
          username: ''
        };

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          const isAdminEmail = firebaseUser.email && (
            firebaseUser.email.toLowerCase() === 'shahriar.diu64@gmail.com' ||
            firebaseUser.email.toLowerCase().includes('admin')
          );

          if (docSnap.exists()) {
            const data = docSnap.data();
            userData.role = isAdminEmail ? 'admin' : (data.role || 'user');
            userData.username = data.username || '';
          } else {
            // Document doesn't exist, create it!
            const baseUsername = firebaseUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
            const finalUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
            const assignedRole = isAdminEmail ? 'admin' : 'user';
            
            await setDoc(userDocRef, {
              name: firebaseUser.displayName || baseUsername,
              email: firebaseUser.email.toLowerCase(),
              username: finalUsername,
              role: assignedRole,
              score: 0,
              solvedChallenges: [],
              createdAt: new Date().toISOString()
            });
            userData.role = assignedRole;
            userData.username = finalUsername;
          }
        } catch (e) {
          console.error("Error loading user role from Firestore:", e);
        }

        setUser(userData);
        localStorage.setItem("codeverse_user", JSON.stringify(userData));
      } else {
        // No Firebase user, check if we have a local guest session
        const savedUser = localStorage.getItem("codeverse_user");
        let localUser = null;
        try {
          localUser = savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
          console.error(e);
        }

        if (localUser && localUser.isGuest) {
          setUser(localUser);
        } else {
          setUser(null);
          localStorage.removeItem("codeverse_user");
        }
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Active Presence Heartbeat Effect ---
  useEffect(() => {
    if (!user || user.isGuest || !user.uid) return;

    const updateUserPresence = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          lastSeen: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Failed to update user presence heartbeat:", err);
      }
    };

    updateUserPresence();

    // Heartbeat every 2 minutes (120000ms)
    const interval = setInterval(updateUserPresence, 120000);

    return () => clearInterval(interval);
  }, [user]);

  const isInitializing = authChecking || redirectChecking;

  // Show loading indicator during initial auth state recovery
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f19] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center scale-110 mb-4">
            {/* Background glowing aura */}
            <div className="absolute w-36 h-36 rounded-full bg-purple-500/10 blur-3xl animate-pulse pointer-events-none z-0"></div>
            <div className="absolute w-24 h-24 rounded-full bg-pink-500/10 blur-2xl animate-pulse pointer-events-none z-0"></div>

            <div className="tetra-container relative z-10">
              <div className="tetra-3d" style={{ animationDuration: '6s' }}>
                <div className="tetra-face tetra-face-1"></div>
                <div className="tetra-face tetra-face-2"></div>
                <div className="tetra-face tetra-face-3"></div>
                <div className="tetra-face tetra-face-bottom"></div>
              </div>
            </div>
          </div>
          <div className="text-xs font-bold text-indigo-400/80 tracking-widest uppercase animate-pulse">
            Initializing CodeVerse...
          </div>
        </div>
      </div>
    );
  }

  // --- Auth Handlers ---
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("codeverse_user", JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("codeverse_user");
      showToast("Signed out successfully", "info");
    } catch (error) {
      console.error("Sign out error:", error);
      showToast("Error signing out", "error");
    }
  };

  // --- Toast Trigger Helper ---
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const isAuthPage = location.pathname === '/login';
  const showFooter = !isAuthPage && location.pathname !== '/editor' && !location.pathname.startsWith('/challenges/');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-x-hidden transition-colors duration-300">
      {/* Shared Dynamic Header */}
      {!isAuthPage && (
        <Header
          user={user}
          onLogout={handleLogout}
          toggleTheme={toggleTheme}
          theme={theme}
        />
      )}

      {/* Dynamic Route Content */}
      <div className={`flex-grow flex flex-col ${isAuthPage ? '' : 'pt-16'}`}>
        <Routes>
          <Route path="/" element={<LandingPage showToast={showToast} />} />
          <Route path="/login" element={<AuthPage user={user} onLogin={handleLogin} showToast={showToast} />} />
          <Route path="/editor" element={<EditorPage user={user} theme={theme} showToast={showToast} />} />
          <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} onUserUpdate={handleLogin} showToast={showToast} />} />
          <Route path="/profile/:username" element={<ProfilePage user={user} onLogout={handleLogout} onUserUpdate={handleLogin} showToast={showToast} />} />
          <Route path="/challenges" element={<ChallengesPage user={user} showToast={showToast} />} />
          <Route path="/challenges/:id" element={<ChallengeWorkspacePage user={user} theme={theme} showToast={showToast} />} />
          <Route path="/leaderboard" element={<LeaderboardPage user={user} showToast={showToast} />} />
          <Route 
            path="/admin" 
            element={
              user && user.role === 'admin' ? (
                <AdminPage user={user} showToast={showToast} />
              ) : (
                <div className="flex-grow flex items-center justify-center min-h-[60vh] text-white p-6">
                  <div className="text-center p-8 bg-[#0d1321]/40 border border-red-500/20 rounded-2xl max-w-sm mx-auto ide-neon-border shadow-2xl backdrop-blur-md animate-fade-in-up">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 text-xl mx-auto mb-4 animate-bounce">
                      <i className="fas fa-shield-halved"></i>
                    </div>
                    <h2 className="text-lg font-black text-white mb-2">Access Denied</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      You do not have administrative privileges to access this area. If you believe this is an error, contact technical support.
                    </p>
                  </div>
                </div>
              )
            } 
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage showToast={showToast} />} />
        </Routes>
      </div>

      {/* Shared Footer */}
      {showFooter && <Footer />}

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
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
