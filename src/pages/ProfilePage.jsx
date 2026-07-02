import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';

export default function ProfilePage({ user, onLogout, onUserUpdate, showToast }) {
  const navigate = useNavigate();
  const { username } = useParams();
  const isOwnProfile = !username || 
    (user && (
      username.toLowerCase() === user.uid.toLowerCase() || 
      (user.username && username.toLowerCase() === user.username.toLowerCase())
    ));

  // Auth Guard: Redirect to login if user is not signed in and trying to view own profile
  useEffect(() => {
    if (!user && isOwnProfile) {
      navigate('/login');
    } else if (user && !username) {
      if (user.username) {
        navigate(`/profile/${user.username}`, { replace: true });
      }
    }
  }, [user, isOwnProfile, username, navigate]);

  // Handle Logout
  const handleLogoutClick = () => {
    onLogout();
    showToast("Signed out successfully", "info");
    navigate('/');
  };

  // State Management for Profile Data & Editing
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: 'Developer',
    username: '',
    email: '',
    title: 'Premium Developer',
    bio: 'Coding enthusiast. Building CodeVerse Workspace compiler platform.',
    skills: ['JavaScript', 'React', 'C++'],
    photoURL: '',
    github: '',
    linkedin: '',
    website: '',
    isVerified: false,
    lastSeen: '',
    activityLogs: {},
    languageStats: {}
  });

  const [inputs, setInputs] = useState({
    name: '',
    username: '',
    title: '',
    bio: '',
    skills: '',
    photoURL: '',
    github: '',
    linkedin: '',
    website: ''
  });

  const [timeTick, setTimeTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Offline";
    const lastSeenDate = new Date(lastSeen);
    const diffMs = Date.now() - lastSeenDate.getTime();
    
    if (diffMs < 300000) {
      return "Active Now";
    }
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `Active ${diffMins}m ago`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `Active ${diffHours}h ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `Active ${diffDays}d ago`;
  };

  // Fetch Custom Profile Metadata from Firestore on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (isOwnProfile) {
          if (!user?.uid) return;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Auto-repair missing username/name in database
            if (!data.username || !data.name) {
              const baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
              const finalUsername = data.username || `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
              const finalName = data.name || user.name || baseUsername;
              
              await setDoc(docRef, {
                name: finalName,
                username: finalUsername,
                email: user.email.toLowerCase()
              }, { merge: true });
              
              data.name = finalName;
              data.username = finalUsername;
              
              user.username = finalUsername;
              localStorage.setItem("codeverse_user", JSON.stringify(user));
            }

            setProfileData({
              name: data.name || user.name || 'Developer',
              username: data.username || '',
              email: data.email || user.email || '',
              title: data.title || 'Premium Developer',
              bio: data.bio || '',
              skills: Array.isArray(data.skills) ? data.skills : ['JavaScript', 'React', 'C++'],
              photoURL: data.photoURL || user.photoURL || '',
              github: data.socials?.github || '',
              linkedin: data.socials?.linkedin || '',
              website: data.socials?.website || '',
              isVerified: !!data.isVerified,
              lastSeen: data.lastSeen || '',
              activityLogs: data.activityLogs || {},
              languageStats: data.languageStats || {}
            });
          } else {
            // Document doesn't exist, set from auth state
            const baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
            const finalUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
            
            await setDoc(docRef, {
              name: user.name || baseUsername,
              email: user.email.toLowerCase(),
              username: finalUsername,
              role: 'user',
              score: 0,
              solvedChallenges: [],
              createdAt: new Date().toISOString()
            });

            user.username = finalUsername;
            localStorage.setItem("codeverse_user", JSON.stringify(user));

            setProfileData({
              name: user.name || baseUsername,
              username: finalUsername,
              email: user.email,
              title: 'Premium Developer',
              bio: '',
              skills: ['JavaScript', 'React', 'C++'],
              photoURL: user.photoURL || '',
              github: '',
              linkedin: '',
              website: '',
              isVerified: false,
              lastSeen: new Date().toISOString(),
              activityLogs: {}
            });
          }
        } else {
          // Fetch by querying username (case-insensitive conversion to lowercase)
          const targetUsername = username.toLowerCase();
          const usersCol = collection(db, "users");
          const q = query(usersCol, where("username", "==", targetUsername), limit(1));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            const isProfileAdmin = data.role === 'admin' || 
                                   (data.email && data.email.toLowerCase() === 'shahriar.diu64@gmail.com') ||
                                   (data.username && data.username.toLowerCase() === 'admin') ||
                                   targetUsername === 'admin';
            
            if (isProfileAdmin) {
              setProfileData({
                name: 'User Not Found',
                username: targetUsername,
                email: '',
                title: 'Unknown',
                bio: 'This profile does not exist on CodeVerse.',
                skills: [],
                photoURL: '',
                github: '',
                linkedin: '',
                website: '',
                isVerified: false,
                lastSeen: '',
                activityLogs: {}
              });
            } else {
              setProfileData({
                name: data.name || 'Developer',
                username: data.username || '',
                email: data.email || '',
                title: data.title || 'Premium Developer',
                bio: data.bio || '',
                skills: Array.isArray(data.skills) ? data.skills : ['JavaScript', 'React', 'C++'],
                photoURL: data.photoURL || '',
                github: data.socials?.github || '',
                linkedin: data.socials?.linkedin || '',
                website: data.socials?.website || '',
                isVerified: !!data.isVerified,
                lastSeen: data.lastSeen || '',
                activityLogs: data.activityLogs || {},
                languageStats: data.languageStats || {}
              });
            }
          } else {
            // Try fallback fetch by doc ID (in case it is a UID instead of a username)
            const fallbackRef = doc(db, "users", username);
            const fallbackSnap = await getDoc(fallbackRef);
            if (fallbackSnap.exists()) {
              const data = fallbackSnap.data();
              const isProfileAdmin = data.role === 'admin' || 
                                     (data.email && data.email.toLowerCase() === 'shahriar.diu64@gmail.com') ||
                                     (data.username && data.username.toLowerCase() === 'admin') ||
                                     username.toLowerCase() === 'admin';
              
              if (isProfileAdmin) {
                setProfileData({
                  name: 'User Not Found',
                  username: username,
                  email: '',
                  title: 'Unknown',
                  bio: 'This profile does not exist on CodeVerse.',
                  skills: [],
                  photoURL: '',
                  github: '',
                  linkedin: '',
                  website: '',
                  isVerified: false,
                  lastSeen: '',
                  activityLogs: {}
                });
              } else {
                setProfileData({
                  name: data.name || 'Developer',
                  username: data.username || '',
                  email: data.email || '',
                  title: data.title || 'Premium Developer',
                  bio: data.bio || '',
                  skills: Array.isArray(data.skills) ? data.skills : ['JavaScript', 'React', 'C++'],
                  photoURL: data.photoURL || '',
                  github: data.socials?.github || '',
                  linkedin: data.socials?.linkedin || '',
                  website: data.socials?.website || '',
                  isVerified: !!data.isVerified,
                  lastSeen: data.lastSeen || '',
                  activityLogs: data.activityLogs || {},
                  languageStats: data.languageStats || {}
                });
              }
            } else {
              // Profile not found
              setProfileData({
                name: 'User Not Found',
                username: targetUsername,
                email: '',
                title: 'Unknown',
                bio: 'This profile does not exist on CodeVerse.',
                skills: [],
                photoURL: '',
                github: '',
                linkedin: '',
                website: '',
                isVerified: false,
                lastSeen: '',
                activityLogs: {}
              });
            }
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, isOwnProfile, user]);

  // Handle local image upload selection and canvas compression
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 160, 160);
        
        // Export compressed JPEG Base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setInputs(prev => ({ ...prev, photoURL: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Sync state variables for Edit Form
  const handleEditClick = () => {
    setInputs({
      name: profileData.name,
      username: profileData.username || '',
      title: profileData.title,
      bio: profileData.bio,
      skills: profileData.skills.join(', '),
      photoURL: profileData.photoURL,
      github: profileData.github,
      linkedin: profileData.linkedin,
      website: profileData.website
    });
    setIsEditing(true);
  };

  // Submit and Save to Firebase Auth + Firestore
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!inputs.name.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }
    
    // Validate username input
    const cleanedUsername = inputs.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanedUsername.length < 3) {
      showToast("Username must be at least 3 characters and alphanumeric/underscores only.", "error");
      return;
    }

    setSaveLoading(true);
    try {
      // Check username uniqueness if it changed
      if (cleanedUsername !== profileData.username) {
        const usersCol = collection(db, "users");
        const q = query(usersCol, where("username", "==", cleanedUsername));
        const querySnapshot = await getDocs(q);
        
        let isTaken = false;
        querySnapshot.forEach(docSnap => {
          if (docSnap.id !== user.uid) {
            isTaken = true;
          }
        });

        if (isTaken) {
          showToast("This username is already taken. Please choose another one!", "error");
          setSaveLoading(false);
          return;
        }
      }

      const skillsArray = inputs.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // 1. Update Firebase Auth display profile (name only, avoiding Base64 photoURL due to 2048 char limit)
      if (auth.currentUser) {
        const updatePayload = {};
        if (inputs.name !== user.name) updatePayload.displayName = inputs.name;
        
        // Only update photoURL in Auth if it's a standard URL (not a massive Base64 Data URL)
        if (inputs.photoURL !== user.photoURL && inputs.photoURL && !inputs.photoURL.startsWith('data:image/')) {
          updatePayload.photoURL = inputs.photoURL;
        }

        if (Object.keys(updatePayload).length > 0) {
          await updateProfile(auth.currentUser, updatePayload);
        }
      }

      // 2. Update Firestore user document metadata
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        name: inputs.name,
        username: cleanedUsername,
        email: user.email,
        title: inputs.title,
        bio: inputs.bio,
        skills: skillsArray,
        photoURL: inputs.photoURL,
        socials: {
          github: inputs.github,
          linkedin: inputs.linkedin,
          website: inputs.website
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Update Local user context username if we are editing our own profile
      if (user) {
        const updated = { ...user, username: cleanedUsername, name: inputs.name, photoURL: inputs.photoURL };
        if (onUserUpdate) {
          onUserUpdate(updated);
        } else {
          user.username = cleanedUsername;
          user.name = inputs.name;
          user.photoURL = inputs.photoURL;
          localStorage.setItem("codeverse_user", JSON.stringify(user));
        }
      }

      // 3. Update Local state to render immediately
      setProfileData(prev => ({
        ...prev,
        name: inputs.name,
        username: cleanedUsername,
        email: user.email,
        title: inputs.title,
        bio: inputs.bio,
        skills: skillsArray,
        photoURL: inputs.photoURL,
        github: inputs.github,
        linkedin: inputs.linkedin,
        website: inputs.website
      }));

      showToast("Profile updated successfully", "success");
      setIsEditing(false);
      window.location.href = `/#/profile/${cleanedUsername}`;
      window.location.reload();
    } catch (err) {
      console.error("Error saving profile:", err);
      showToast("Failed to save changes. Please try again.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  if (isOwnProfile && !user) return null;

  if (loading) {
    return (
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center gap-4 animate-fade-in text-white min-h-[60vh]">
        <div className="relative flex items-center justify-center scale-75 mb-2">
          <div className="absolute w-28 h-28 rounded-full bg-purple-500/10 blur-2xl animate-pulse pointer-events-none z-0"></div>
          <div className="tetra-container relative z-10">
            <div className="tetra-3d" style={{ animationDuration: '6s' }}>
              <div className="tetra-face tetra-face-1"></div>
              <div className="tetra-face tetra-face-2"></div>
              <div className="tetra-face tetra-face-3"></div>
              <div className="tetra-face tetra-face-bottom"></div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider animate-pulse">Syncing profile metadata...</p>
      </main>
    );
  }

  // Dynamic contribution grid map matching the last 112 days (16 weeks)
  const contributionGrid = Array.from({ length: 112 }).map((_, i) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (111 - i));
    
    const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    const count = (profileData.activityLogs && profileData.activityLogs[dateKey]) || 0;
    
    // Assign color class based on count intensity
    let colorClass = "bg-slate-900/40 border-slate-800"; // 0 compilations
    if (count > 0 && count <= 2) {
      colorClass = "bg-emerald-900/30 border-emerald-800/20"; // 1-2
    } else if (count >= 3 && count <= 5) {
      colorClass = "bg-emerald-700/50 border-emerald-600/30"; // 3-5
    } else if (count >= 6 && count <= 9) {
      colorClass = "bg-emerald-500 border-emerald-400/40"; // 6-9
    } else if (count >= 10) {
      colorClass = "bg-green-400 border-green-300/40"; // 10+
    }
    
    // Formatting date string for title tooltip: e.g. "Jun 30, 2026: 5 compilations"
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    return {
      className: colorClass,
      title: `${formattedDate}: ${count} compilation${count === 1 ? '' : 's'}`
    };
  });

  // Calculate dynamic month labels covering the last 112 days (approx 4 months)
  const getMonthLabels = () => {
    const labels = [];
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(now.getDate() - (3 - i) * 30);
      labels.push(d.toLocaleString('en-US', { month: 'short' }));
    }
    return labels;
  };
  const monthLabels = getMonthLabels();

  // Calculate language execution statistics from database
  const getLanguageStats = () => {
    const stats = profileData.languageStats || {};
    
    // Grouping counts
    let jsTsCount = (stats['javascript'] || 0) + (stats['typescript'] || 0) + (stats['html'] || 0);
    let cppCount = (stats['cpp'] || 0) + (stats['c'] || 0);
    let pythonCount = (stats['python'] || 0);
    
    // Others
    let othersCount = 0;
    const groupedKeys = ['javascript', 'typescript', 'html', 'cpp', 'c', 'python'];
    Object.keys(stats).forEach(key => {
      if (!groupedKeys.includes(key)) {
        othersCount += (stats[key] || 0);
      }
    });

    const total = jsTsCount + cppCount + pythonCount + othersCount;

    if (total === 0) {
      // Return 0% if no execution data has been recorded yet for this profile
      return [
        { name: 'JavaScript / TypeScript / HTML', percent: 0, colorFrom: 'from-yellow-500', colorTo: 'to-indigo-500' },
        { name: 'C / C++', percent: 0, colorFrom: 'from-blue-500', colorTo: 'to-indigo-500' },
        { name: 'Python', percent: 0, colorFrom: 'from-emerald-500', colorTo: 'to-indigo-500' },
        { name: 'Others (Go, Rust, Java, C#)', percent: 0, colorFrom: 'from-cyan-500', colorTo: 'to-indigo-500' }
      ];
    }

    return [
      { name: 'JavaScript / TypeScript / HTML', percent: Math.round((jsTsCount / total) * 100), colorFrom: 'from-yellow-500', colorTo: 'to-indigo-500' },
      { name: 'C / C++', percent: Math.round((cppCount / total) * 100), colorFrom: 'from-blue-500', colorTo: 'to-indigo-500' },
      { name: 'Python', percent: Math.round((pythonCount / total) * 100), colorFrom: 'from-emerald-500', colorTo: 'to-indigo-500' },
      { name: 'Others (Go, Rust, Java, C#)', percent: Math.round((othersCount / total) * 100), colorFrom: 'from-cyan-500', colorTo: 'to-indigo-500' }
    ];
  };

  return (
    <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 animate-fade-in-up">
      {/* Background Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-600/5 blur-[120px] z-0 pointer-events-none"></div>

      {/* Header Info Block */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 relative z-10">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            {isOwnProfile ? "Developer Dashboard" : `${profileData.name}'s Profile`}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {isOwnProfile 
              ? "Monitor compilation metrics, account details, and workspace activities."
              : `View compilation stats and profile information of ${profileData.name}.`}
          </p>
        </div>
        {isOwnProfile && (
          <div className="flex items-center gap-3">
            {user && user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 shadow-md active:scale-95 transition-all duration-200 cursor-pointer relative z-20"
              >
                <i className="fas fa-crown text-amber-400"></i>
                <span>Admin Panel</span>
              </button>
            )}
            <button
              onClick={() => navigate('/editor')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-600/15 cursor-pointer relative z-20"
            >
              <i className="fas fa-terminal"></i>
              <span>Launch Code Editor</span>
            </button>
          </div>
        )}
      </div>

      {/* Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative z-10">
        
        {/* Left Column: User Card (Display Mode or Edit Mode) */}
        <div className="flex flex-col gap-6">
          {isEditing ? (
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/25 bg-slate-900/60 flex flex-col gap-4 relative overflow-hidden animate-fade-in">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-indigo-500/5 blur-xl"></div>
              
              <h3 className="font-bold text-base text-white border-b border-[var(--border-color)] pb-2 mb-2 flex items-center gap-2">
                <i className="fas fa-user-pen text-indigo-400"></i>
                <span>Edit Profile Details</span>
              </h3>

              {/* Avatar Upload Preview */}
              <div className="flex flex-col items-center gap-2 mb-3 relative group">
                <div className="w-18 h-18 rounded-full border border-[var(--border-color)] text-white text-xs font-bold flex items-center justify-center shadow-md relative overflow-hidden bg-slate-800">
                  {inputs.photoURL ? (
                    <img src={inputs.photoURL} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-xl">
                      {(inputs.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                  {/* File selection cover overlay */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-white text-[10px] gap-1 select-none">
                    <i className="fas fa-camera text-sm animate-pulse"></i>
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium">Click photo to upload</span>
              </div>

              <form onSubmit={handleSaveSubmit} className="flex flex-col gap-3 text-left">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Name</label>
                  <input
                    type="text"
                    required
                    value={inputs.name}
                    onChange={(e) => setInputs(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/55 transition-all duration-200"
                  />
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Username (Unique)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs text-slate-500 font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={inputs.username}
                      onChange={(e) => setInputs(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))}
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl pl-7 pr-3 py-2 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/55 transition-all duration-200 font-mono"
                      placeholder="username"
                    />
                  </div>
                </div>

                {/* Professional Title */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Professional Title</label>
                  <input
                    type="text"
                    value={inputs.title}
                    onChange={(e) => setInputs(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/55 transition-all duration-200"
                    placeholder="e.g. Full Stack Developer"
                  />
                </div>

                {/* Short Bio */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Bio</label>
                  <textarea
                    value={inputs.bio}
                    onChange={(e) => setInputs(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    maxLength={150}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/55 transition-all duration-200 resize-none"
                    placeholder="Tell us about yourself (max 150 chars)..."
                  />
                </div>

                {/* Skills (Comma Separated) */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={inputs.skills}
                    onChange={(e) => setInputs(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/55 transition-all duration-200"
                    placeholder="React, C++, Python, CSS"
                  />
                </div>

                {/* Social Links */}
                <div className="flex flex-col gap-2.5 mt-1 border-t border-[var(--border-color)]/30 pt-3">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Social Links</label>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-slate-400"><i className="fab fa-github"></i></span>
                    <input
                      type="url"
                      value={inputs.github}
                      onChange={(e) => setInputs(prev => ({ ...prev, github: e.target.value }))}
                      className="flex-grow bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/55 transition-all duration-200"
                      placeholder="GitHub profile URL"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-slate-400"><i className="fab fa-linkedin"></i></span>
                    <input
                      type="url"
                      value={inputs.linkedin}
                      onChange={(e) => setInputs(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="flex-grow bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/55 transition-all duration-200"
                      placeholder="LinkedIn profile URL"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-slate-400"><i className="fas fa-globe"></i></span>
                    <input
                      type="url"
                      value={inputs.website}
                      onChange={(e) => setInputs(prev => ({ ...prev, website: e.target.value }))}
                      className="flex-grow bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/55 transition-all duration-200"
                      placeholder="Personal website URL"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={saveLoading}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {saveLoading ? (
                      <>
                        <i className="fas fa-circle-notch animate-spin"></i>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-floppy-disk"></i>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col items-center text-center gap-5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl"></div>
              
              {/* Large Avatar */}
              <div
                id="profile-avatar-large"
                className="w-20 h-20 rounded-full border-2 border-indigo-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/20 font-sans select-none overflow-hidden bg-slate-800"
              >
                {profileData.photoURL ? (
                  <img src={profileData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center">
                    {(profileData.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* User Text Details */}
              <div className="flex flex-col gap-0.5 w-full">
                <h3 id="profile-name" className="font-bold text-lg text-[var(--text-primary)] truncate flex items-center justify-center gap-1.5">
                  <span>{profileData.name || 'Developer'}</span>
                  {profileData.isVerified && (
                    <span className="text-sm" style={{ color: '#1D9BF0' }} title="Verified Creator">
                      <i className="fas fa-circle-check"></i>
                    </span>
                  )}
                </h3>
                {profileData.username && (
                  <p className="text-xs text-indigo-400 font-mono font-bold">@{profileData.username}</p>
                )}
                {/* Active Presence Badge */}
                <div className="flex items-center justify-center gap-1.5 mt-1.5 select-none">
                  {profileData.lastSeen && (Date.now() - new Date(profileData.lastSeen).getTime() < 300000) ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Active Now</span>
                    </>
                  ) : (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                      <span className="text-[10px] text-slate-400 font-semibold">{formatLastSeen(profileData.lastSeen)}</span>
                    </>
                  )}
                </div>
                {isOwnProfile && <p id="profile-email" className="text-[10px] text-[var(--text-muted)] font-mono truncate mt-1">{profileData.email || ''}</p>}
                <span className="inline-block mx-auto mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {profileData.title || 'Premium Developer'}
                </span>
              </div>

              {/* Short Bio */}
              {profileData.bio && (
                <p className="text-xs text-[var(--text-secondary)] italic max-w-[240px] leading-relaxed border-t border-[var(--border-color)]/30 pt-3 w-full">
                  "{profileData.bio}"
                </p>
              )}

              {/* Social Links Row */}
              {(profileData.github || profileData.linkedin || profileData.website) && (
                <div className="flex items-center justify-center gap-3">
                  {profileData.github && (
                    <a
                      href={profileData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)]/50 hover:bg-slate-800 border border-[var(--border-color)]/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 text-xs"
                      title="GitHub Profile"
                    >
                      <i className="fab fa-github"></i>
                    </a>
                  )}
                  {profileData.linkedin && (
                    <a
                      href={profileData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)]/50 hover:bg-slate-800 border border-[var(--border-color)]/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 text-xs"
                      title="LinkedIn Profile"
                    >
                      <i className="fab fa-linkedin"></i>
                    </a>
                  )}
                  {profileData.website && (
                    <a
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)]/50 hover:bg-slate-800 border border-[var(--border-color)]/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 text-xs"
                      title="Personal Website"
                    >
                      <i className="fas fa-globe"></i>
                    </a>
                  )}
                </div>
              )}

              {/* Stats Mini Row */}
              <div className="grid grid-cols-2 divide-x divide-[var(--border-color)] border-y border-[var(--border-color)]/60 w-full py-3 mt-1 text-center">
                <div>
                  <span className="block text-lg font-bold text-[var(--text-primary)] font-mono">
                    {Object.values(profileData.activityLogs || {}).reduce((sum, val) => sum + (Number(val) || 0), 0)}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">Total Runs</span>
                </div>
                <div>
                  <span className="block text-lg font-bold text-emerald-400 font-mono">92.4%</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">Success Rate</span>
                </div>
              </div>

              {/* Action buttons */}
              {isOwnProfile ? (
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={handleEditClick}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="fas fa-user-pen"></i>
                    <span>Edit Profile</span>
                  </button>
                </div>
              ) : (
                <div className="w-full text-slate-500 text-[10px] uppercase font-bold tracking-wider py-2 border-t border-[var(--border-color)]/30 mt-1">
                  <i className="fas fa-globe mr-1.5 text-indigo-400 animate-pulse"></i>
                  <span>Public Profile View</span>
                </div>
              )}
            </div>
          )}

          {/* Skills & Technologies Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Skills & Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                >
                  {skill}
                </span>
              ))}
              {profileData.skills.length === 0 && (
                <span className="text-xs text-[var(--text-muted)] italic">No skills listed yet.</span>
              )}
            </div>
          </div>

          {/* Badges Achievements Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Achievements</h4>
            <div className="flex flex-wrap gap-2.5">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Compiled 100+ code blocks successfully">
                <i className="fas fa-trophy text-[10px]"></i>
                <span>Code Guru</span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" title="Completed Frontend Lab previews">
                <i className="fas fa-laptop-code text-[10px]"></i>
                <span>UI Crafter</span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" title="Used Judge0 APIs configuration setup">
                <i className="fas fa-bolt text-[10px]"></i>
                <span>Fast Runner</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Stats, Chart and Activities */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Language Progress Meters Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Language Preferences</h4>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">By Executions</span>
            </div>

            <div className="flex flex-col gap-4">
              {getLanguageStats().map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 animate-fade-in">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[var(--text-primary)]">{item.name}</span>
                    <span className="text-[var(--text-secondary)] font-mono">{item.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${item.colorFrom} ${item.colorTo} rounded-full`} style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Grid */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-5 overflow-x-auto">
            <div className="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Compiler Activity Logs</h4>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Last 16 Weeks</span>
            </div>

            <div className="flex flex-col gap-2 min-w-[500px]">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
                {contributionGrid.map((cell, index) => (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 rounded border ${cell.className}`}
                    title={cell.title}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-[var(--text-muted)] pt-1 select-none">
                <div className="flex items-center gap-6">
                  {monthLabels.map((lbl, idx) => (
                    <span key={idx}>{lbl}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded bg-slate-900/40 border border-slate-800"></div>
                  <div className="w-2.5 h-2.5 rounded bg-emerald-900/30 border border-emerald-800/20"></div>
                  <div className="w-2.5 h-2.5 rounded bg-emerald-700/50 border border-emerald-600/30"></div>
                  <div className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-400/40"></div>
                  <div className="w-2.5 h-2.5 rounded bg-green-400 border border-green-300/40"></div>
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Runs Feed Logs */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Recent Compilation Runs</h4>
            <div className="flex flex-col divide-y divide-[var(--border-color)]/60 text-xs font-sans">
              
              {/* Log 1 */}
              <div className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 text-[10px] font-mono font-bold">C++</div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">cpp_main.cpp</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Code compiled and ran successfully</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Success</span>
                  <span className="block text-[9px] text-[var(--text-muted)] font-mono mt-1">2 mins ago</span>
                </div>
              </div>

              {/* Log 2 */}
              <div className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20 text-[10px] font-mono font-bold">JS</div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">index.html (Web Sandbox)</p>
                    <p className="text-[10px] text-[var(--text-muted)]">HTML Visual workbench rendered</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Sandbox</span>
                  <span className="block text-[9px] text-[var(--text-muted)] font-mono mt-1">1 hour ago</span>
                </div>
              </div>

              {/* Log 3 */}
              <div className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 text-[10px] font-mono font-bold">GO</div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">main.go</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Failed at line 13: newline in character literal</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Error</span>
                  <span className="block text-[9px] text-[var(--text-muted)] font-mono mt-1">3 hours ago</span>
                </div>
              </div>
              
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
