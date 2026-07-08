import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_CHALLENGES } from '../utils/challenges';

export default function ChallengesPage({ user, showToast }) {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  
  // User profile specific progress metrics
  const [userScore, setUserScore] = useState(0);
  const [solvedList, setSolvedList] = useState([]);

  useEffect(() => {
    const loadChallengesAndProgress = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch user progress if authenticated
        if (user && !user.isGuest) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserScore(data.score || 0);
            setSolvedList(Array.isArray(data.solvedChallenges) ? data.solvedChallenges : []);
          }
        }

        // 2. Fetch challenges list
        const challengesCol = collection(db, "challenges");
        const querySnapshot = await getDocs(challengesCol);
        
        if (querySnapshot.empty) {
          // Database is empty. Lazy seed initial challenges
          console.log("No challenges found in Firestore. Seeding defaults...");
          try {
            for (const item of INITIAL_CHALLENGES) {
              await setDoc(doc(db, "challenges", item.id), item);
            }
          } catch (writeErr) {
            console.warn("Unable to auto-seed challenges database (permission restricted). Loaded locally.", writeErr);
          }
          const sortedInitial = [...INITIAL_CHALLENGES].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
          setChallenges(sortedInitial);
        } else {
          const list = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          // Sort by order number ascending
          list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
          setChallenges(list);
        }

      } catch (err) {
        console.error("Error loading challenges data:", err);
        showToast("Error loading challenges database.", "error");
        // Fallback to static list for safety
        const sortedInitial = [...INITIAL_CHALLENGES].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        setChallenges(sortedInitial);
      } finally {
        setLoading(false);
      }
    };

    loadChallengesAndProgress();
  }, [user]);

  // Difficulty filter handling
  const filtered = challenges.filter(c => 
    filterDifficulty === 'All' ? true : c.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
  );

  return (
    <div className="min-h-screen py-5 sm:py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] text-[var(--text-primary)] relative">
      <div className="max-w-6xl mx-auto mt-2 sm:mt-6 relative z-10">
        
        {/* Header Metadata Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-[var(--border-color)]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Coding Challenges
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Solve logical programming algorithms, pass test cases, and climb the global ranking board.
            </p>
          </div>

          <div className="flex items-stretch gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center flex flex-col justify-center">
              <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-wider leading-none mb-1">Your Score</span>
              <span className="text-lg font-black text-[var(--text-primary)] leading-none">{userScore} <span className="text-[10px] font-medium text-indigo-300">pts</span></span>
            </div>
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex-1 md:flex-initial justify-center px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)]/75 hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-bold text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <i className="fas fa-trophy text-amber-400 text-xs"></i>
              <span>Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                filterDifficulty === diff
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-[var(--bg-tertiary)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/70 border border-[var(--border-color)]/60'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Challenges Grid List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
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
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider animate-pulse">Loading Challenges...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-tertiary)]/20 rounded-3xl border border-[var(--border-color)]/50 p-8">
            <i className="fas fa-search text-3xl text-slate-500 mb-3 block"></i>
            <h3 className="font-bold text-[var(--text-primary)] mb-1">No Challenges Found</h3>
            <p className="text-xs text-[var(--text-secondary)]">Try switching your difficulty filter to locate problems.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filtered.map((item) => {
              const isSolved = solvedList.includes(item.id);
              let diffColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              if (item.difficulty === "Medium") diffColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
              if (item.difficulty === "Hard") diffColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!user || user.isGuest) {
                      showToast("Please login or create an account to start coding!", "error");
                      navigate('/login');
                    } else {
                      navigate(`/challenges/${item.id}`);
                    }
                  }}
                  className="w-full bg-[var(--bg-secondary)] glass-panel border border-[var(--border-color)] border-l-4 border-l-transparent rounded-xl p-5 hover:border-indigo-500/30 hover:border-l-indigo-500/90 hover:bg-[var(--bg-tertiary)]/30 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(99,102,241,0.08)] transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-5 text-left cursor-pointer select-none"
                >
                  <div className="flex-grow space-y-1.5 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-extrabold text-[var(--text-primary)] text-base tracking-tight flex items-center gap-2">
                        <span className="text-[var(--text-secondary)] font-mono font-bold">#{item.order || 0}.</span>
                        <span>{item.title}</span>
                        {isSolved && (
                          <i className="fas fa-circle-check text-emerald-400 text-sm" title="Solved successfully"></i>
                        )}
                      </h3>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${diffColor}`}>
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-normal leading-relaxed line-clamp-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Reward</span>
                      <span className="text-xs font-black text-indigo-400">+{item.points} pts</span>
                    </div>

                    <button
                      className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-indigo-600 hover:text-white border border-[var(--border-color)] active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <span>{isSolved ? "Resolve" : "Solve"}</span>
                      <i className="fas fa-play text-[9px]"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
