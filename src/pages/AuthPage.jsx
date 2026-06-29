import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthParticles from '../components/AuthParticles';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  sendPasswordResetEmail,
  signInWithRedirect 
} from 'firebase/auth';
import { collection, doc, setDoc, getDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider, facebookProvider } from '../firebase';
import emailjs from '@emailjs/browser';


const getPasswordStrength = (password) => {
  if (!password) return { label: '', color: 'bg-transparent', width: '0%', textClass: 'hidden' };
  
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { label: 'Weak', color: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', width: '33%', textClass: 'text-red-400' };
  } else if (score <= 4) {
    return { label: 'Medium', color: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]', width: '66%', textClass: 'text-amber-400' };
  } else {
    return { label: 'Strong', color: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', width: '100%', textClass: 'text-emerald-400' };
  }
};

export default function AuthPage({ user, onLogin, showToast }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'

  // Redirect if already logged in (ignore guest mode)
  useEffect(() => {
    if (user && !user.isGuest) {
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

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpTimer, setOtpTimer] = useState(300);
  const [otpLoading, setOtpLoading] = useState(false);
  const [signupPayload, setSignupPayload] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // OTP Timer countdown effect
  useEffect(() => {
    let interval = null;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  // Helper to migrate guest notes to Cloud Firestore
  const migrateLocalNotesToFirestore = async (uid) => {
    try {
      const saved = localStorage.getItem("codeverse_notes");
      if (!saved) return;
      const localNotes = JSON.parse(saved);
      if (!Array.isArray(localNotes) || localNotes.length === 0) return;

      const userNotesRef = collection(db, "users", uid, "notes");
      const snapshot = await getDocs(userNotesRef);
      
      // Only migrate if user has no notes saved in cloud yet
      if (snapshot.empty) {
        for (const note of localNotes) {
          // Skip the default welcome note unless edited
          if (note.id === 'welcome' && note.content.includes("Welcome to your personal scratchpad!")) {
            continue;
          }
          const noteDocRef = doc(db, "users", uid, "notes", note.id);
          await setDoc(noteDocRef, {
            title: note.title || 'Untitled Note',
            content: note.content || '',
            updatedAt: note.updatedAt || new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error("Migration error:", err);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const name = userCredential.user.displayName || loginEmail.split('@')[0];
      
      showToast(`Welcome back, ${name}!`, 'success');
      await migrateLocalNotesToFirestore(userCredential.user.uid);
      navigate('/');
    } catch (err) {
      console.error(err);
      let errMsg = "Failed to login. Please check your credentials.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = "Invalid email or password.";
      } else if (err.code === 'auth/invalid-email') {
        errMsg = "Invalid email format.";
      }
      showToast(errMsg, 'error');
    }
  };

  const sendOtpEmail = async (email, name, otp) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    console.log("DEBUG - EmailJS Env Keys Loaded:", {
      serviceId: serviceId ? "LOADED" : "UNDEFINED",
      templateId: templateId ? "LOADED" : "UNDEFINED",
      publicKey: publicKey ? "LOADED" : "UNDEFINED"
    });

    if (!serviceId || !templateId || !publicKey || serviceId.includes("here") || templateId.includes("here") || publicKey.includes("here")) {
      console.warn("EmailJS keys are missing or placeholders. Using developer fallback alert for testing.");
      return false;
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: email,
          email: email,
          to_name: name,
          name: name,
          otp: otp,
        },
        publicKey
      );
      return true;
    } catch (error) {
      console.error("EmailJS error:", error);
      return false;
    }
  };

  const sendWelcomeEmail = async (email, name) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const welcomeTemplateId = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !welcomeTemplateId || !publicKey || welcomeTemplateId.includes("here")) {
      console.warn("Welcome email template not configured.");
      return;
    }

    try {
      await emailjs.send(
        serviceId,
        welcomeTemplateId,
        {
          to_email: email,
          email: email,
          to_name: name,
          name: name,
        },
        publicKey
      );
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPass) return;

    if (signupPassword !== signupConfirmPass) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    setOtpLoading(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // 1. Write OTP to Firestore under temp_otps/email
      const tempOtpRef = doc(db, "temp_otps", signupEmail.toLowerCase());
      await setDoc(tempOtpRef, {
        otp: otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes expiration
      });

      // 2. Send email via EmailJS
      const sent = await sendOtpEmail(signupEmail, signupName, otp);
      
      setSignupPayload({ name: signupName, email: signupEmail, password: signupPassword });
      setOtpInput('');
      setOtpTimer(300); // 5 minutes
      setVerificationSuccess(false);
      setShowOtpModal(true);

      if (sent) {
        showToast("Verification OTP sent to your email!", "success");
      } else {
        showToast(`⚠️ [Dev Mode] EmailJS not configured. For testing, your OTP code is: ${otp}`, "warning");
      }
    } catch (err) {
      console.error(err);
      showToast("Error starting verification process.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length !== 6) {
      showToast("Please enter a valid 6-digit OTP.", "error");
      return;
    }

    if (!signupPayload) return;

    setOtpLoading(true);
    try {
      // 1. Read OTP from Firestore
      const tempOtpRef = doc(db, "temp_otps", signupPayload.email.toLowerCase());
      const docSnap = await getDoc(tempOtpRef);

      if (!docSnap.exists()) {
        showToast("No verification record found. Please request a new code.", "error");
        setOtpLoading(false);
        return;
      }

      const data = docSnap.data();
      const storedOtp = data.otp;
      const expiresAt = data.expiresAt;

      // 2. Validate OTP and check if expired
      if (Date.now() > expiresAt) {
        showToast("The OTP has expired. Please request a new one.", "error");
        setOtpLoading(false);
        return;
      }

      if (otpInput.trim() !== storedOtp.trim()) {
        showToast("Invalid OTP code. Please try again.", "error");
        setOtpLoading(false);
        return;
      }

      // 3. OTP is correct! Trigger success tick animation
      setVerificationSuccess(true);
      setOtpLoading(false);

      // Delay creation slightly so user sees the animated green tick
      setTimeout(async () => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, signupPayload.email, signupPayload.password);
          await updateProfile(userCredential.user, { displayName: signupPayload.name });

          // Send welcome email in background
          sendWelcomeEmail(signupPayload.email, signupPayload.name);

          // 4. Delete temp OTP record from Firestore
          await deleteDoc(tempOtpRef);

          showToast(`Welcome to CodeVerse, ${signupPayload.name}!`, 'success');
          await migrateLocalNotesToFirestore(userCredential.user.uid);
          setShowOtpModal(false);
          setSignupPayload(null);
          setVerificationSuccess(false);
          navigate('/');
        } catch (authErr) {
          console.error(authErr);
          setVerificationSuccess(false);
          let errMsg = "Failed to create account after verification.";
          if (authErr.code === 'auth/email-already-in-use') {
            errMsg = "This email is already in use.";
          }
          showToast(errMsg, 'error');
        }
      }, 1800);
    } catch (err) {
      console.error(err);
      let errMsg = "Failed to verify OTP and create account.";
      if (err.code === 'auth/email-already-in-use') {
        errMsg = "This email is already in use.";
      } else if (err.code === 'auth/weak-password') {
        errMsg = "Password is too weak. Must be at least 6 characters.";
      }
      showToast(errMsg, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!signupPayload || otpTimer > 0) return;

    setOtpLoading(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const tempOtpRef = doc(db, "temp_otps", signupPayload.email.toLowerCase());
      await setDoc(tempOtpRef, {
        otp: newOtp,
        expiresAt: Date.now() + 5 * 60 * 1000
      });

      const sent = await sendOtpEmail(signupPayload.email, signupPayload.name, newOtp);
      setOtpInput('');
      setOtpTimer(300);

      if (sent) {
        showToast("A new verification OTP has been sent!", "success");
      } else {
        showToast(`⚠️ [Dev Mode] EmailJS not configured. New OTP code: ${newOtp}`, "warning");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to resend verification OTP.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSocialLogin = async (platform) => {
    let provider;
    if (platform === 'google') {
      provider = googleProvider;
    } else if (platform === 'github') {
      provider = githubProvider;
    } else if (platform === 'facebook') {
      provider = facebookProvider;
    } else {
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const name = result.user.displayName || result.user.email?.split('@')[0] || "Developer";
      
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
      showToast(`Logged in via ${platformName}!`, 'success');
      await migrateLocalNotesToFirestore(result.user.uid);
      navigate('/');
    } catch (err) {
      console.error(err);
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
      
      if (err.code === 'auth/popup-blocked') {
        showToast(`Popup blocked. Redirecting to ${platformName} login...`, 'info');
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          console.error(redirectErr);
          showToast(`Failed to redirect to ${platformName} login.`, 'error');
        }
      } else {
        showToast(`Failed to log in via ${platformName}.`, 'error');
      }
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      showToast(`Password reset link sent to ${forgotEmail}!`, 'success');
      setForgotEmail('');
      setActiveTab('login');
    } catch (err) {
      console.error(err);
      showToast("Failed to send reset link. Please check your email.", "error");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-x-hidden overflow-y-auto">
      {/* Particles Background */}
      <AuthParticles />

      {/* Ambient Blur Orbs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[130px] z-0 pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[130px] z-0 pointer-events-none"></div>

      {/* Main Split Grid Card */}
      <div
        id="auth-card"
        className="glass-panel neon-glow-card w-full max-w-5xl min-h-[600px] lg:min-h-[680px] grid grid-cols-1 lg:grid-cols-12 gap-0 z-10 rounded-[32px] border border-[var(--border-color)] overflow-hidden shadow-2xl relative"
      >
        
        {/* Left Side: Brand Visuals & Features (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-6 p-10 flex-col justify-between relative overflow-hidden border-r border-[var(--border-color)]/20 bg-gradient-to-br from-indigo-950/20 via-slate-900/10 to-cyan-950/10 select-none">
          
          {/* Logo Brand at top left */}
          <div className="flex items-center gap-3 cursor-pointer text-left" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/25">
              <i className="fas fa-cubes text-white text-base"></i>
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                CodeVerse
              </span>
              <span className="text-[10px] block text-[var(--text-secondary)] font-medium leading-none">Online Compiler</span>
            </div>
          </div>

          {/* Visual Showcase Center */}
          <div className="my-auto flex flex-col gap-6 relative z-10 text-left">
            <div className="space-y-3">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 uppercase tracking-wider inline-block">
                Developer Workbench
              </span>
              <h2 className="text-3xl font-black tracking-tight leading-tight text-white">
                Write Code. Compile Live.<br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  No Local Setup.
                </span>
              </h2>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Experience a fast, secure, and fully-featured cloud compilation platform with support for over 30+ languages, web sandboxes, and personalized activity stats.
              </p>
            </div>

            {/* Feature Checkmarks */}
            <div className="grid grid-cols-2 gap-3.5 mt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <i className="fas fa-check text-[10px]"></i>
                </div>
                <span className="text-xs font-semibold text-slate-300">30+ Languages</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6.5 h-6.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <i className="fas fa-bolt text-[10px]"></i>
                </div>
                <span className="text-xs font-semibold text-slate-300">Instant Execution</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6.5 h-6.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <i className="fas fa-code text-[10px]"></i>
                </div>
                <span className="text-xs font-semibold text-slate-300">Live Web Sandbox</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6.5 h-6.5 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <i className="fas fa-chart-line text-[10px]"></i>
                </div>
                <span className="text-xs font-semibold text-slate-300">Activity Analytics</span>
              </div>
            </div>

            {/* Glowing Code Block Mockup */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 font-mono text-[10px] text-slate-300 relative overflow-hidden backdrop-blur-md max-w-sm shadow-lg mt-1">
              <div className="absolute top-3 left-3 flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
              </div>
              <span className="absolute top-2.5 right-4 text-[9px] text-slate-500 select-none">workspace.py</span>
              <div className="mt-3.5 space-y-1">
                <p className="text-slate-500"><span className="text-pink-400">import</span> codeverse <span className="text-pink-400">as</span> cv</p>
                <p className="text-slate-500"><span className="text-pink-400">def</span> <span className="text-blue-400">compile_now</span>(user_id):</p>
                <p className="pl-4 text-slate-300">env = cv.connect(user_id)</p>
                <p className="pl-4 text-slate-300">print(<span className="text-green-300">f"Connecting to {"{env.name}"}..."</span>)</p>
                <p className="pl-4 text-indigo-400">env.run() <span className="text-slate-500"># Success!</span></p>
              </div>
            </div>
          </div>

          {/* Footer inside Left visual */}
          <div className="text-[9px] text-slate-500 text-left">
            &copy; {new Date().getFullYear()} CodeVerse. Built for developers worldwide.
          </div>
        </div>

        {/* Right Side: Auth Card Form */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center relative overflow-y-auto w-full min-h-[550px] lg:min-h-0">
          
          {/* Back Button */}
          <div className="absolute top-6 left-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-100 hover:text-white transition-all duration-200 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/50 px-3.5 py-1.5 rounded-lg backdrop-blur-md cursor-pointer hover:border-indigo-500/80 focus:outline-none shadow-md shadow-indigo-950/60 hover:shadow-indigo-500/20"
            >
              <i className="fas fa-arrow-left text-[9px] text-indigo-400"></i>
              <span>BACK HOME</span>
            </button>
          </div>

          <div className="w-full max-w-sm mx-auto flex flex-col gap-5 mt-14 lg:mt-10">
            
            {/* Logo/Icon on Mobile ONLY */}
            <div className="flex lg:hidden flex-col items-center text-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/25">
                <i className="fas fa-cubes text-white text-base animate-pulse"></i>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent leading-none">
                  CodeVerse Compiler
                </h1>
              </div>
            </div>

            {/* Header on Desktop (Just details) */}
            <div className="hidden lg:block text-center mb-1">
              <h1 className="text-xl font-black text-white">Welcome to CodeVerse</h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Access your compiler workbench</p>
            </div>

            {/* Authentication Tabs with sliding Indicator */}
            <div className="relative flex border-b border-[var(--border-color)] text-sm font-semibold select-none pb-1">
              <button
                onClick={() => setActiveTab('login')}
                className={`w-1/2 pb-2 text-center transition-all duration-300 cursor-pointer focus:outline-none z-10 ${
                  activeTab === 'login' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                Login
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
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="auth-label">
                        Email Address
                      </label>
                      <div className="auth-input-wrapper floating-enabled">
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="auth-input"
                          placeholder="yourmail@gmail.com"
                        />
                        <i className="fas fa-envelope auth-input-icon"></i>
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="auth-label">
                        Password
                      </label>
                      <div className="auth-input-wrapper floating-enabled">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="auth-input pr-10"
                          placeholder="••••••••••••"
                        />
                        <i className="fas fa-lock auth-input-icon"></i>
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 p-1.5 text-[var(--text-secondary)] hover:text-indigo-400 transition-colors duration-200 focus:outline-none"
                          title="Show/Hide Password"
                        >
                          <i className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                        </button>
                      </div>
                      
                      {/* Forgot Password Link */}
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('forgot')}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-200 focus:outline-none cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-2.5 mt-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/20 transition-all duration-200 cursor-pointer btn-premium-glow"
                    >
                      Login to Account
                    </button>
                  </form>
                </div>

                {/* Signup Panel (Create Account) */}
                <div className="w-1/2 flex flex-col gap-3 pl-3 pr-1">
                  <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3">
                    {/* Name Field */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="auth-label">
                        Name
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="text"
                          required
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="auth-input"
                          placeholder="Enter your name"
                        />
                        <i className="fas fa-user auth-input-icon"></i>
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="auth-label">
                        Email Address
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="email"
                          required
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="auth-input"
                          placeholder="yourmail@gmail.com"
                        />
                        <i className="fas fa-envelope auth-input-icon"></i>
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="auth-label">
                        Password
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="auth-input pr-10"
                          placeholder="••••••••••••"
                        />
                        <i className="fas fa-lock auth-input-icon"></i>
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 p-1.5 text-[var(--text-secondary)] hover:text-indigo-400 transition-colors duration-200 focus:outline-none"
                          title="Show/Hide Password"
                        >
                          <i className={`fas ${showSignupPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                        </button>
                      </div>
                      {/* Password Strength Indicator */}
                      {signupPassword && (
                        <div className="flex flex-col gap-1 mt-1 animate-fade-in-up">
                          <div className="flex justify-between items-center text-[10px] font-semibold">
                            <span className="text-[var(--text-secondary)]">Password Strength:</span>
                            <span className={`${getPasswordStrength(signupPassword).textClass} font-bold transition-all duration-300`}>
                              {getPasswordStrength(signupPassword).label}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ease-out ${getPasswordStrength(signupPassword).color}`}
                              style={{ width: getPasswordStrength(signupPassword).width }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="auth-label">
                        Confirm Password
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="password"
                          required
                          value={signupConfirmPass}
                          onChange={(e) => setSignupConfirmPass(e.target.value)}
                          className="auth-input"
                          placeholder="Re-enter password"
                        />
                        <i className="fas fa-lock-open auth-input-icon"></i>
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
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSocialLogin('github')}
                className="flex items-center justify-center gap-2 py-2 px-1 rounded-xl bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] text-slate-100 hover:text-white text-[11px] font-semibold active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none auth-social-btn auth-social-btn-github"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </button>
              <button
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-2 py-2 px-1 rounded-xl bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] text-slate-100 hover:text-white text-[11px] font-semibold active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none auth-social-btn auth-social-btn-google"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>
              <button
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center gap-2 py-2 px-1 rounded-xl bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] text-slate-100 hover:text-white text-[11px] font-semibold active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none auth-social-btn auth-social-btn-facebook"
              >
                <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            {/* Guest Entry Button */}
            <button
              onClick={() => {
                const guestUser = {
                  name: "Guest Developer",
                  email: "guest@codeverse.me",
                  isGuest: true
                };
                onLogin(guestUser);
                showToast("Entering Workspace as Guest", "info");
                navigate('/editor');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-100 hover:text-white bg-indigo-950/80 hover:bg-indigo-600/20 border border-indigo-500/50 hover:border-indigo-500/80 active:scale-95 transition-all duration-200 cursor-pointer text-center mt-2.5 shadow-md shadow-indigo-950/50"
            >
              <i className="fas fa-user-secret mr-1.5 text-indigo-400"></i>
              <span>Continue as Guest</span>
            </button>
          </div>

          {/* Forgot Password Overlay */}
          {activeTab === 'forgot' && (
            <div className="absolute inset-0 bg-[#172035] z-20 p-6 sm:p-10 flex flex-col justify-center gap-5 animate-scale-up">
              
              {/* Header */}
              <div className="text-center flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/25 mb-1 animate-pulse">
                  <i className="fas fa-key text-white text-base"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Reset Password</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-xs leading-relaxed mx-auto">
                    Enter your email address and we'll send you a recovery link to reset your password.
                  </p>
                </div>
              </div>

              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                {/* Email Input */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="auth-label">
                    Email Address
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="auth-input"
                      placeholder="yourmail@gmail.com"
                    />
                    <i className="fas fa-envelope auth-input-icon"></i>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 mt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/20 transition-all duration-200 cursor-pointer btn-premium-glow"
                  >
                    Send Reset Link
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="w-full py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-900 border border-slate-800 transition-all duration-200 cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* OTP Verification Modal Overlay */}
          {showOtpModal && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 p-6 sm:p-10 flex items-center justify-center animate-fade-in-up">
              <div className="glass-panel border border-[var(--border-color)] p-6 sm:p-8 rounded-2xl w-full max-w-sm flex flex-col gap-4 text-center shadow-2xl relative animate-scale-up">
                
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setSignupPayload(null);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-200 focus:outline-none"
                  title="Cancel Verification"
                >
                  <i className="fas fa-times"></i>
                </button>

                {verificationSuccess ? (
                  <div className="flex flex-col items-center justify-center py-6 animate-scale-up">
                    <style>{`
                      @keyframes checkmark-stroke {
                        100% { stroke-dashoffset: 0; }
                      }
                      @keyframes checkmark-scale {
                        0%, 100% { transform: none; }
                        50% { transform: scale3d(1.1, 1.1, 1); }
                      }
                      @keyframes checkmark-fill {
                        100% { box-shadow: inset 0px 0px 0px 30px rgba(16, 185, 129, 0.1); }
                      }
                      .checkmark__circle {
                        stroke-dasharray: 166;
                        stroke-dashoffset: 166;
                        stroke-width: 2;
                        stroke-miterlimit: 10;
                        stroke: #10b981;
                        fill: none;
                        animation: checkmark-stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                      }
                      .checkmark {
                        width: 64px;
                        height: 64px;
                        border-radius: 50%;
                        display: block;
                        stroke-width: 3;
                        stroke: #10b981;
                        stroke-miterlimit: 10;
                        margin: 10px auto 20px auto;
                        box-shadow: inset 0px 0px 0px #10b981;
                        animation: checkmark-fill .4s ease-in-out .4s forwards, checkmark-scale .3s ease-in-out .9s both;
                      }
                      .checkmark__check {
                        transform-origin: 50% 50%;
                        stroke-dasharray: 48;
                        stroke-dashoffset: 48;
                        animation: checkmark-stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
                      }
                    `}</style>
                    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                      <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                      <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>
                    <h3 className="text-base font-bold text-white mb-1">Email Verified!</h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Setting up your CodeVerse workspace...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg mx-auto mb-2">
                      <i className="fas fa-envelope-open-text animate-pulse"></i>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white">Verify Your Email</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                        We've sent a 6-digit verification code to <br />
                        <span className="text-slate-200 font-bold font-mono text-[11px]">{signupPayload?.email}</span>.
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtpSubmit} className="flex flex-col gap-4 mt-2">
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="auth-label">
                          6-Digit OTP Code
                        </label>
                        <div className="auth-input-wrapper">
                          <input
                            type="text"
                            required
                            maxLength={6}
                            pattern="\d{6}"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            className="auth-input text-center tracking-[1em] font-mono text-base font-bold pr-3 pl-8"
                            placeholder="000000"
                            disabled={otpLoading}
                          />
                          <i className="fas fa-key auth-input-icon"></i>
                        </div>
                      </div>

                      {/* Timer & Resend Link */}
                      <div className="flex flex-col items-center justify-center gap-2 mt-1 select-none">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
                          {otpTimer > 0 ? (
                            <>
                              <i className="far fa-clock text-indigo-400 animate-pulse text-sm"></i>
                              <span className="text-xs font-semibold text-slate-300">
                                Expires in: <span className="text-indigo-400 font-mono font-bold text-sm tracking-wider">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</span>
                              </span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-circle-exclamation text-rose-500 animate-bounce text-sm"></i>
                              <span className="text-xs font-bold text-rose-400 animate-pulse">Code expired!</span>
                            </>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          disabled={otpTimer > 0 || otpLoading}
                          onClick={handleResendOtp}
                          className={`text-xs font-extrabold transition-all duration-200 focus:outline-none flex items-center gap-1 ${
                            otpTimer > 0 
                              ? 'text-slate-600 cursor-not-allowed opacity-50' 
                              : 'text-indigo-400 hover:text-indigo-300 cursor-pointer hover:underline active:scale-95'
                          }`}
                        >
                          <i className="fas fa-rotate-right text-[10px]"></i>
                          <span>Resend Code</span>
                        </button>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={otpLoading}
                        className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/20 transition-all duration-200 cursor-pointer btn-premium-glow flex items-center justify-center gap-2"
                      >
                        {otpLoading ? (
                          <>
                            <i className="fas fa-circle-notch animate-spin"></i>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-shield-halved"></i>
                            <span>Verify & Create Account</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
