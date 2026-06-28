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
          setChallenges(INITIAL_CHALLENGES);
        } else {
          const list = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setChallenges(list);
        }

      } catch (err) {
        console.error("Error loading challenges data:", err);
        showToast("Error loading challenges database.", "error");
        // Fallback to static list for safety
        setChallenges(INITIAL_CHALLENGES);
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] text-white relative">
      <div className="max-w-6xl mx-auto mt-6 relative z-10">
        
        {/* Header Metadata Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-[var(--border-color)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Coding Challenges
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Solve logical programming algorithms, pass test cases, and climb the global ranking board.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-5 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">Your Score</span>
              <span className="text-xl font-black text-white">{userScore} <span className="text-xs font-medium text-indigo-300">pts</span></span>
            </div>
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-5 py-3 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-slate-800 border border-[var(--border-color)] font-bold text-xs text-slate-200 hover:text-white flex items-center gap-2 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <i className="fas fa-trophy text-amber-400"></i>
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
                  : 'bg-[var(--bg-tertiary)]/40 text-slate-400 hover:text-white border border-[var(--border-color)]/60'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Challenges Grid List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider animate-pulse">Loading Challenges...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-tertiary)]/20 rounded-3xl border border-[var(--border-color)]/50 p-8">
            <i className="fas fa-search text-3xl text-slate-500 mb-3 block"></i>
            <h3 className="font-bold text-white mb-1">No Challenges Found</h3>
            <p className="text-xs text-slate-400">Try switching your difficulty filter to locate problems.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const isSolved = solvedList.includes(item.id);
              let diffColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              if (item.difficulty === "Medium") diffColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
              if (item.difficulty === "Hard") diffColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";

              return (
                <div
                  key={item.id}
                  className="relative p-[1.5px] rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group flex flex-col justify-between min-h-[220px]"
                >
                  {/* Rotating Border Beams */}
                  <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] border-beam-indigo animate-border-spin opacity-20 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"></div>
                  
                  {/* Body Content */}
                  <div className="relative bg-[#0d1321]/95 p-6 rounded-2xl h-full flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-lg border ${diffColor}`}>
                          {item.difficulty}
                        </span>
                        
                        <span className="text-xs font-black text-indigo-400">
                          +{item.points} pts
                        </span>
                      </div>

                      <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-indigo-400 transition-colors duration-200 flex items-center gap-2">
                        {item.title}
                        {isSolved && (
                          <i className="fas fa-circle-check text-emerald-400 text-sm" title="Solved successfully"></i>
                        )}
                      </h3>
                      
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (!user || user.isGuest) {
                          showToast("Please login or create an account to start coding!", "error");
                          navigate('/login');
                        } else {
                          navigate(`/challenges/${item.id}`);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-[var(--bg-tertiary)] hover:bg-indigo-600 hover:text-white border border-[var(--border-color)] group-hover:border-indigo-500/30 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>{isSolved ? "Resolve Challenge" : "Solve Challenge"}</span>
                      <i className="fas fa-arrow-right text-[10px]"></i>
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
