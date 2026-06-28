import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export default function LeaderboardPage({ user, showToast }) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const usersCol = collection(db, "users");
        
        // Query users sorted by score descending
        const q = query(usersCol, orderBy("score", "desc"), limit(50));
        const snapshot = await getDocs(q);
        
        const ranks = [];
        let rankIdx = 1;
        
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          // Skip guests or records with null scores
          if (data.score !== undefined && data.score >= 0) {
            ranks.push({
              uid: docSnap.id,
              name: data.name || "Developer",
              username: data.username || "",
              photoURL: data.photoURL || "",
              title: data.title || "Premium Developer",
              score: data.score || 0,
              solvedCount: Array.isArray(data.solvedChallenges) ? data.solvedChallenges.length : 0,
              isVerified: !!data.isVerified
            });
          }
        });

        // If no records have score (or empty DB), we sort what we have
        if (ranks.length === 0) {
          // Add default demo profile ranking data if Firestore is empty
          ranks.push(
            { uid: "demo1", name: "AlphaCoder", username: "alphacoder", title: "Principal Architect", score: 360, solvedCount: 5 },
            { uid: "demo2", name: "SyntaxNinja", username: "syntaxninja", title: "Full Stack Engineer", score: 260, solvedCount: 4 },
            { uid: "demo3", name: "ByteMaster", username: "bytemaster", title: "Systems Dev", score: 210, solvedCount: 3 }
          );
        }

        // Sort ranks dynamically to prevent Firestore indexing lag errors during first loads
        ranks.sort((a, b) => b.score - a.score);

        setLeaderboard(ranks);
      } catch (err) {
        console.error("Error loading rankings: ", err);
        showToast("Error loading global rankings leaderboard.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] text-white relative">
      <div className="max-w-4xl mx-auto mt-6 relative z-10">
        
        {/* Back and title bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)]">
          <div className="text-left">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <i className="fas fa-trophy text-amber-400"></i>
              <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-indigo-400 bg-clip-text text-transparent">
                Global Leaderboard
              </span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Real-time rankings of top developers executing compiler solutions on CodeVerse.
            </p>
          </div>

          <button
            onClick={() => navigate('/challenges')}
            className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-slate-800 border border-[var(--border-color)] text-xs font-bold text-slate-300 hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <i className="fas fa-arrow-left text-[10px]"></i>
            <span>Challenges</span>
          </button>
        </div>

        {/* Leaderboard Table Card */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
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
            <p className="text-xs text-amber-500 font-bold uppercase tracking-widest animate-pulse">Calculating rankings...</p>
          </div>
        ) : (
          <div className="relative p-[1.5px] rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 group">
            
            {/* Spinning decorative frame glow */}
            <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] border-beam-purple animate-border-spin opacity-10 pointer-events-none"></div>

            <div className="relative bg-[#0d1321]/95 rounded-3xl overflow-hidden border border-[var(--border-color)]/70">
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] bg-slate-950/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="py-4 px-6 text-center w-20">Rank</th>
                      <th className="py-4 px-6">Developer</th>
                      <th className="py-4 px-6 text-center w-36">Solved</th>
                      <th className="py-4 px-6 text-right w-36 pr-8">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaderboard.map((player, index) => {
                      const rankNum = index + 1;
                      const isCurrentUser = user && user.uid === player.uid;
                      
                      let rankBadge = null;
                      let rankRowBg = isCurrentUser ? "bg-indigo-500/5 hover:bg-indigo-500/10" : "hover:bg-white/5";

                      if (rankNum === 1) {
                        rankBadge = <i className="fas fa-trophy text-yellow-400 text-lg" title="First Place (Gold)"></i>;
                      } else if (rankNum === 2) {
                        rankBadge = <i className="fas fa-trophy text-slate-300 text-lg" title="Second Place (Silver)"></i>;
                      } else if (rankNum === 3) {
                        rankBadge = <i className="fas fa-trophy text-amber-600 text-lg" title="Third Place (Bronze)"></i>;
                      } else {
                        rankBadge = <span className="font-extrabold text-sm text-slate-400">{rankNum}</span>;
                      }

                      return (
                        <tr
                          key={player.uid}
                          className={`transition-colors duration-200 text-xs ${rankRowBg}`}
                        >
                          {/* Rank column */}
                          <td className="py-4 px-6 text-center select-none">
                            <div className="flex items-center justify-center">
                              {rankBadge}
                            </div>
                          </td>

                          {/* Profile Details column */}
                          <td className="py-4 px-6">
                            <div 
                              onClick={() => navigate(`/profile/${player.username || player.uid}`)}
                              className="flex items-center gap-3 cursor-pointer group/dev hover:scale-[1.03] origin-left transition-all duration-200"
                            >
                              {player.photoURL ? (
                                <img
                                  src={player.photoURL}
                                  alt={player.name}
                                  className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover/dev:border-indigo-400 transition-colors"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white uppercase text-xs border border-white/10 shadow-inner group-hover/dev:border-indigo-400 transition-colors">
                                  {player.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className={`font-bold flex items-center gap-1.5 group-hover/dev:text-indigo-300 transition-colors ${isCurrentUser ? "text-indigo-300 text-sm" : "text-white"}`}>
                                  <span>{player.name}</span>
                                  {player.isVerified && (
                                    <span className="text-xs" style={{ color: '#08CB00' }} title="Verified Creator">
                                      <i className="fas fa-circle-check animate-pulse"></i>
                                    </span>
                                  )}
                                  {player.username && (
                                    <span className="text-slate-400 font-mono font-semibold text-[11px] ml-1.5 select-all">@{player.username}</span>
                                  )}
                                  {isCurrentUser && (
                                    <span className="ml-1.5 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                      You
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium group-hover/dev:text-slate-300 transition-colors">{player.title}</span>
                              </div>
                            </div>
                          </td>

                          {/* Solved challenge count column */}
                          <td className="py-4 px-6 text-center font-bold text-slate-300">
                            {player.solvedCount} <span className="text-[10px] font-normal text-slate-500">problems</span>
                          </td>

                          {/* Score column */}
                          <td className="py-4 px-6 text-right pr-8">
                            <span className="font-black text-white text-sm tracking-wide">
                              {player.score}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-400 ml-1">pts</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
