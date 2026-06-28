import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';

export default function ProfilePage({ user, onLogout, showToast }) {
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
    }
  }, [user, isOwnProfile, navigate]);

  // Handle Logout
  const handleLogoutClick = () => {
    onLogout();
    showToast("Signed out successfully", "info");
    navigate('/');
  };

  // State Management for Profile Data & Editing
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
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
    website: ''
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

  // Fetch Custom Profile Metadata from Firestore on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
              website: data.socials?.website || ''
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
              website: ''
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
              website: data.socials?.website || ''
            });
          } else {
            // Try fallback fetch by doc ID (in case it is a UID instead of a username)
            const fallbackRef = doc(db, "users", username);
            const fallbackSnap = await getDoc(fallbackRef);
            if (fallbackSnap.exists()) {
              const data = fallbackSnap.data();
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
                website: data.socials?.website || ''
              });
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
                website: ''
              });
            }
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
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

      // 1. Update Firebase Auth display profile (name and photo URL)
      if (auth.currentUser) {
        const updatePayload = {};
        if (inputs.name !== user.name) updatePayload.displayName = inputs.name;
        if (inputs.photoURL !== user.photoURL) updatePayload.photoURL = inputs.photoURL;

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
        user.username = cleanedUsername;
        localStorage.setItem("codeverse_user", JSON.stringify(user));
      }

      // 3. Update Local state to render immediately
      setProfileData({
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
      });

      showToast("Profile updated successfully", "success");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      showToast("Failed to save changes. Please try again.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  if (isOwnProfile && !user) return null;

  // Determinstic opacity list for activity contributions log
  const gridOpacities = [
    "bg-indigo-900/10 border-slate-800",
    "bg-indigo-600/30 border-indigo-500/20",
    "bg-indigo-600/60 border-indigo-500/30",
    "bg-indigo-500 border-indigo-400/40",
    "bg-cyan-400 border-cyan-300/40"
  ];
  
  const contributionGrid = Array.from({ length: 112 }).map((_, i) => {
    const key = (i * 7 + 13) % gridOpacities.length;
    const count = (i * 3 + 2) % 9;
    return {
      className: gridOpacities[key],
      title: `Activity: ${count} compilations`
    };
  });

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
          <button
            onClick={() => navigate('/editor')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-600/15 cursor-pointer relative z-20"
          >
            <i className="fas fa-terminal"></i>
            <span>Launch Code Editor</span>
          </button>
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
                <h3 id="profile-name" className="font-bold text-lg text-[var(--text-primary)] truncate">{profileData.name || 'Developer'}</h3>
                {profileData.username && (
                  <p className="text-xs text-indigo-400 font-mono font-bold">@{profileData.username}</p>
                )}
                {isOwnProfile && <p id="profile-email" className="text-[10px] text-[var(--text-muted)] font-mono truncate mt-0.5">{profileData.email || ''}</p>}
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
                  <span className="block text-lg font-bold text-[var(--text-primary)] font-mono">148</span>
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
                  <button
                    onClick={handleLogoutClick}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 transition-all duration-200 cursor-pointer"
                  >
                    <i className="fas fa-sign-out-alt mr-1.5"></i>
                    <span>Sign Out Account</span>
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
              {/* Item 1 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[var(--text-primary)]">JavaScript / TypeScript</span>
                  <span className="text-[var(--text-secondary)] font-mono">45%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-indigo-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[var(--text-primary)]">C++</span>
                  <span className="text-[var(--text-secondary)] font-mono">30%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[var(--text-primary)]">Python</span>
                  <span className="text-[var(--text-secondary)] font-mono">15%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[var(--text-primary)]">Others (Go, Rust, Erlang, C)</span>
                  <span className="text-[var(--text-secondary)] font-mono">10%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Grid */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-5 overflow-x-auto">
            <div className="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Compiler Activity Logs</h4>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Last 12 Weeks</span>
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
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <div className="flex items-center gap-1 ml-auto">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded bg-indigo-900/10 border border-slate-800"></div>
                  <div className="w-2.5 h-2.5 rounded bg-indigo-600/30 border border-indigo-500/20"></div>
                  <div className="w-2.5 h-2.5 rounded bg-indigo-600/60 border border-indigo-500/30"></div>
                  <div className="w-2.5 h-2.5 rounded bg-indigo-500 border border-indigo-400/40"></div>
                  <div className="w-2.5 h-2.5 rounded bg-cyan-400 border border-cyan-300/40"></div>
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
