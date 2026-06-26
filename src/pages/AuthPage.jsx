import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthParticles from '../components/AuthParticles';

export default function AuthPage({ user, onLogin, showToast }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPass, setSignupConfirmPass] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    const name = loginEmail.split('@')[0];
    const loggedUser = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: loginEmail,
    };
    onLogin(loggedUser);
    showToast(`Welcome back, ${loggedUser.name}!`, 'success');
    setTimeout(() => navigate('/'), 800);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPass) return;

    if (signupPassword !== signupConfirmPass) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    const loggedUser = { name: signupName, email: signupEmail };
    onLogin(loggedUser);
    showToast(`Welcome to CodeVerse, ${signupName}!`, 'success');
    setTimeout(() => navigate('/'), 800);
  };

  const handleSocialLogin = (platform) => {
    const loggedUser = platform === 'github' 
      ? { name: 'GitHub Coder', email: 'github-coder@codeverse.me' }
      : { name: 'Google Dev', email: 'google-dev@codeverse.me' };
    
    onLogin(loggedUser);
    showToast(`Logged in via ${platform === 'github' ? 'GitHub' : 'Google'}`, 'success');
    setTimeout(() => navigate('/'), 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 sm:py-12 transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-x-hidden overflow-y-auto">
      {/* Particles Background */}
      <AuthParticles />

      {/* Ambient Blur Orbs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] z-0 pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] z-0 pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-all duration-200 mb-6 bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] px-3.5 py-2 rounded-xl backdrop-blur-md cursor-pointer hover:border-indigo-500/40 focus:outline-none"
        >
          <i className="fas fa-arrow-left text-[10px]"></i>
          <span>Back to Home</span>
        </button>

        {/* Glassmorphic Auth Card */}
        <div
          id="auth-card"
          className="glass-panel neon-glow-card float-slow w-full rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl p-5 sm:p-6 flex flex-col gap-4.5"
        >
          {/* Logo and Heading */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <i className="fas fa-cubes text-white text-xl animate-pulse"></i>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent leading-none">
                CodeVerse Compiler
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                Access your cloud-based compiler workbench
              </p>
            </div>
          </div>

          {/* Authentication Tabs with sliding Indicator */}
          <div className="relative flex border-b border-[var(--border-color)] text-sm font-semibold select-none pb-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`w-1/2 pb-2 text-center transition-all duration-300 cursor-pointer focus:outline-none z-10 ${
                activeTab === 'login' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`w-1/2 pb-2 text-center transition-all duration-300 cursor-pointer focus:outline-none z-10 ${
                activeTab === 'signup' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              Create Account
            </button>
            
            {/* Sliding indicator underline */}
            <div
              className="active-tab-indicator w-1/2"
              style={{
                left: activeTab === 'login' ? '0%' : '50%',
              }}
            ></div>
          </div>

          {/* Sliding Forms Layout */}
          <div className="relative overflow-hidden w-full">
            <div
              className="sliding-form-wrapper"
              style={{
                transform: activeTab === 'login' ? 'translateX(0%)' : 'translateX(-50%)',
              }}
            >
              {/* Login Panel (Sign In) */}
              <div className="w-1/2 flex flex-col gap-3 pr-3 pl-1">
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
                  {/* Email Field */}
                  <div className="flex flex-col gap-1.5 glow-input-focus text-left">
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <i className="fas fa-envelope absolute left-3.5 text-xs text-[var(--text-muted)]"></i>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none transition-all duration-200"
                        placeholder="developer@domain.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col gap-1.5 glow-input-focus text-left">
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <i className="fas fa-lock absolute left-3.5 text-xs text-[var(--text-muted)]"></i>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none transition-all duration-200"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 p-1.5 text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none"
                        title="Show/Hide Password"
                      >
                        <i className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2 mt-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/20 transition-all duration-200 cursor-pointer btn-premium-glow"
                  >
                    Sign In to Account
                  </button>
                </form>
              </div>

              {/* Signup Panel (Create Account) */}
              <div className="w-1/2 flex flex-col gap-3 pl-3 pr-1">
                <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3">
                  {/* Name Field */}
                  <div className="flex flex-col gap-1.5 glow-input-focus text-left">
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Name
                    </label>
                    <div className="relative flex items-center">
                      <i className="fas fa-user absolute left-3.5 text-xs text-[var(--text-muted)]"></i>
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none transition-all duration-200"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="flex flex-col gap-1.5 glow-input-focus text-left">
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <i className="fas fa-envelope absolute left-3.5 text-xs text-[var(--text-muted)]"></i>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none transition-all duration-200"
                        placeholder="developer@domain.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col gap-1.5 glow-input-focus text-left">
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <i className="fas fa-lock absolute left-3.5 text-xs text-[var(--text-muted)]"></i>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none transition-all duration-200"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 p-1.5 text-[var(--text-secondary)] hover:text-white transition-colors duration-200 focus:outline-none"
                        title="Show/Hide Password"
                      >
                        <i className={`fas ${showSignupPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="flex flex-col gap-1.5 glow-input-focus text-left">
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <i className="fas fa-lock-open absolute left-3.5 text-xs text-[var(--text-muted)]"></i>
                      <input
                        type="password"
                        required
                        value={signupConfirmPass}
                        onChange={(e) => setSignupConfirmPass(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none transition-all duration-200"
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/20 transition-all duration-200 cursor-pointer btn-premium-glow"
                  >
                    Create Account
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Social Separator */}
          <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-muted)] mt-1 select-none">
            <div className="h-[1px] bg-[var(--border-color)] flex-grow"></div>
            <span>OR CONTINUE WITH</span>
            <div className="h-[1px] bg-[var(--border-color)] flex-grow"></div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] text-slate-100 hover:text-white text-xs font-semibold active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
            >
              <i className="fab fa-github text-sm"></i>
              <span>GitHub</span>
            </button>
            <button
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] text-slate-100 hover:text-white text-xs font-semibold active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
            >
              <i className="fab fa-google text-sm"></i>
              <span>Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
