import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { LANGUAGES } from '../utils/languages';

export default function HistoryPage({ user, showToast }) {
  const navigate = useNavigate();
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [hasMoreRuns, setHasMoreRuns] = useState(false);
  const [expandedRunId, setExpandedRunId] = useState(null);

  // Filters State
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const isOwnProfile = !username || (user && (
    username.toLowerCase() === user.uid.toLowerCase() ||
    (user.username && username.toLowerCase() === user.username.toLowerCase())
  ));

  // Reset pagination limit when filter parameters change
  useEffect(() => {
    setDisplayLimit(10);
  }, [selectedLanguage, selectedStatus]);

  // Relative Time Helper
  const formatRunTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60000) return "Just now";
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        let targetUid = null;
        let isGuestMode = false;

        if (isOwnProfile) {
          if (user?.isGuest) {
            isGuestMode = true;
          } else if (user?.uid) {
            targetUid = user.uid;
          }
        } else {
          // Fetch uid by username query
          const usersCol = collection(db, "users");
          const q = query(usersCol, where("username", "==", username.toLowerCase()), limit(1));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            targetUid = querySnapshot.docs[0].id;
            setProfileUser(querySnapshot.docs[0].data());
          } else {
            // Try UID directly fallback
            const fallbackRef = doc(db, "users", username);
            const fallbackSnap = await getDoc(fallbackRef);
            if (fallbackSnap.exists()) {
              targetUid = fallbackSnap.id;
              setProfileUser(fallbackSnap.data());
            }
          }
        }

        // Fetch execution runs list
        let allRuns = [];
        if (isGuestMode) {
          const savedRuns = localStorage.getItem("codeverse_recent_runs");
          allRuns = savedRuns ? JSON.parse(savedRuns) : [];
        } else if (targetUid) {
          const runsRef = collection(db, "users", targetUid, "recent_runs");
          const qRuns = query(runsRef, orderBy("timestamp", "desc"));
          const runsSnap = await getDocs(qRuns);
          runsSnap.forEach(rDoc => {
            allRuns.push({ id: rDoc.id, ...rDoc.data() });
          });
        }

        // Client-side filtering
        let filtered = allRuns;
        if (selectedLanguage !== "all") {
          filtered = filtered.filter(r => r.language === selectedLanguage);
        }
        if (selectedStatus !== "all") {
          filtered = filtered.filter(r => {
            if (selectedStatus === "Success") return r.status === "Success";
            if (selectedStatus === "Sandbox") return r.status === "Sandbox";
            if (selectedStatus === "Timeout") return r.status === "Timeout";
            if (selectedStatus === "Error") return r.status !== "Success" && r.status !== "Sandbox" && r.status !== "Timeout";
            return true;
          });
        }

        // Pagination limit
        if (filtered.length > displayLimit) {
          setHasMoreRuns(true);
          setRuns(filtered.slice(0, displayLimit));
        } else {
          setHasMoreRuns(false);
          setRuns(filtered);
        }
      } catch (e) {
        console.error("Error loading execution history:", e);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [username, user, displayLimit, selectedLanguage, selectedStatus, isOwnProfile]);

  const toggleExpandRun = (runId) => {
    setExpandedRunId(prev => (prev === runId ? null : runId));
  };

  // Get dynamic colors for Language Badge
  const getLanguageDetails = (langKey) => {
    const ext = langKey ? langKey.toLowerCase() : "";
    if (ext === "html" || ext === "css" || ext === "javascript" || ext === "js") {
      return {
        icon: "JS",
        className: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
      };
    } else if (ext === "python" || ext === "py") {
      return {
        icon: "PY",
        className: "bg-sky-500/10 text-sky-400 border border-sky-500/20"
      };
    } else if (ext === "c") {
      return {
        icon: "C",
        className: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      };
    } else if (ext === "cpp") {
      return {
        icon: "C++",
        className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      };
    } else if (ext === "go") {
      return {
        icon: "GO",
        className: "bg-rose-500/10 text-rose-400 border border-rose-500/20"
      };
    } else {
      return {
        icon: ext.toUpperCase().substring(0, 3),
        className: "bg-slate-500/10 text-slate-400 border border-slate-500/20"
      };
    }
  };

  // Get dynamic colors for Status Badge
  const getStatusBadgeClass = (status) => {
    if (status === "Success") {
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    } else if (status === "Sandbox") {
      return "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
    } else if (status === "Timeout") {
      return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    } else {
      return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
    }
  };

  const getProfileTitle = () => {
    if (isOwnProfile) return "My Code Execution Logs";
    const displayName = profileUser?.name || username;
    return `${displayName}'s Execution Logs`;
  };

  // Distinct language keys that actually have runs
  const activeLanguagesFilter = ["all", "html", "cpp", "python", "javascript", "c", "go"];

  return (
    <main className="flex-grow bg-[#090d16] py-12 px-4 relative min-h-[calc(100vh-4rem)]">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none select-none z-0"></div>

      <div className="max-w-4xl mx-auto flex flex-col gap-6 relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col gap-3">
          <Link
            to={username ? `/profile/${username}` : '/profile'}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors w-max cursor-pointer"
          >
            <i className="fas fa-arrow-left text-[10px]"></i>
            <span>Back to Profile</span>
          </Link>
          <div className="flex items-center justify-between border-b border-[#232f48]/60 pb-4">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-3">
              <i className="fas fa-terminal text-indigo-400 text-base animate-pulse"></i>
              <span>{getProfileTitle()}</span>
            </h2>
            <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-widest bg-[#121926] px-2.5 py-1 rounded-lg border border-[#232f48]">
              SNAPSHOT SUMMARY
            </span>
          </div>
        </div>

        {/* Filter Section Tabs */}
        <div className="glass-panel p-4 rounded-xl border border-[var(--border-color)] flex flex-col gap-3.5">
          {/* Language filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 text-left">Filter by Workspace</span>
            <div className="flex flex-wrap gap-1.5">
              {activeLanguagesFilter.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer select-none active:scale-95 border ${
                    selectedLanguage === lang
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                      : "bg-[#101622]/40 text-slate-400 border-[#232f48]/55 hover:border-slate-500/30 hover:text-slate-300"
                  }`}
                >
                  {lang === "all" ? "All Languages" : (LANGUAGES[lang]?.name || lang.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#232f48]/30">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 text-left">Filter by Status</span>
            <div className="flex flex-wrap gap-1.5">
              {["all", "Success", "Sandbox", "Timeout", "Error"].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer select-none active:scale-95 border ${
                    selectedStatus === status
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                      : "bg-[#101622]/40 text-slate-400 border-[#232f48]/55 hover:border-slate-500/30 hover:text-slate-300"
                  }`}
                >
                  {status === "all" ? "All Statuses" : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Execution Logs List */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">
            <span>Runs Log Stream</span>
            <span className="font-mono text-[10px] text-slate-500 normal-case">{runs.length} logged runs shown</span>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <i className="fas fa-circle-notch fa-spin text-lg text-indigo-500"></i>
              <span className="text-xs text-slate-500">Loading compilation history logs...</span>
            </div>
          ) : runs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <i className="fas fa-folder-open text-xl text-slate-600"></i>
              <span className="text-xs italic">No execution history fits your selected filter settings.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 font-sans">
              {runs.map((run) => {
                const isExpanded = expandedRunId === run.id;
                const langInfo = getLanguageDetails(run.language);
                const statusClass = getStatusBadgeClass(run.status);
                const absoluteTime = run.timestamp ? new Date(run.timestamp).toLocaleString() : "";

                return (
                  <div
                    key={run.id || run.timestamp}
                    className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                      isExpanded 
                        ? 'border-indigo-500 bg-[#151c2d]/70 shadow-lg shadow-indigo-500/5' 
                        : 'border-[#232f48]/70 bg-[#121926]/40 hover:bg-[#151d2c]/50 hover:border-slate-700/60'
                    }`}
                  >
                    {/* Row Header Details */}
                    <div
                      onClick={() => toggleExpandRun(run.id)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden flex-grow">
                        <div className={`w-9 h-9 rounded-xl ${langInfo.className} flex items-center justify-center text-[10px] font-mono font-black shrink-0`}>
                          {langInfo.icon}
                        </div>
                        <div className="text-left overflow-hidden">
                          <h4 className="font-extrabold text-[var(--text-primary)] truncate text-xs sm:text-sm">{run.fileName}</h4>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono flex-wrap">
                            <span className="flex items-center gap-1">
                              <i className="far fa-clock text-[9px]"></i>
                              <span>{formatRunTime(run.timestamp)}</span>
                            </span>
                            <span className="hidden sm:inline text-slate-600">•</span>
                            <span className="hidden sm:inline flex items-center gap-1">
                              <i className="far fa-calendar-alt text-[9px]"></i>
                              <span>{absoluteTime}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Indicators */}
                      <div className="hidden md:flex items-center gap-6 font-mono text-[10px] text-slate-400 text-left shrink-0">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Time</p>
                          <p className="mt-0.5 font-semibold text-slate-300">{run.time || "0.00s"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Memory</p>
                          <p className="mt-0.5 font-semibold text-slate-300">{run.memory || "0.0 MB"}</p>
                        </div>
                      </div>

                      {/* Status and Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${statusClass}`}>
                          {run.status}
                        </span>
                        <div className={`w-6 h-6 rounded-lg bg-[#0e1420] border border-[#232f48] flex items-center justify-center text-slate-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-indigo-400 border-indigo-500/30' : ''
                        }`}>
                          <i className="fas fa-chevron-down text-[9px]"></i>
                        </div>
                      </div>
                    </div>

                    {/* Inline Expandable Output/Code Drawer */}
                    {isExpanded && (
                      <div className="px-4 pb-5 pt-2 border-t border-[#232f48]/50 bg-[#0d1320]/60 flex flex-col gap-4">
                        
                        {/* Mobile Performance Stats */}
                        <div className="flex md:hidden items-center justify-around py-2 rounded-lg bg-[#090d16]/80 border border-[#232f48]/50 font-mono text-[10px] text-slate-400 mt-1">
                          <div className="text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Time: </span>
                            <span className="font-semibold text-slate-300 ml-1">{run.time || "0.00s"}</span>
                          </div>
                          <div className="text-slate-600">|</div>
                          <div className="text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Memory: </span>
                            <span className="font-semibold text-slate-300 ml-1">{run.memory || "0.0 MB"}</span>
                          </div>
                        </div>

                        {/* Terminal Logs Box */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 text-left font-mono">Execution Log Terminal Output</span>
                          <pre className="bg-[#060910] border border-[#232f48] rounded-xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto select-text whitespace-pre-wrap max-h-60 overflow-y-auto text-left shadow-inner">
                            {run.message || "[No log output was printed]"}
                          </pre>
                        </div>

                        {/* Code Snapshot box */}
                        <div className="flex flex-col gap-1.5 mt-2">
                          <div className="bg-[#0b0f19] border border-[#232f48] rounded-xl overflow-hidden flex flex-col shadow-inner">
                            <div className="bg-[#0f1420]/80 border-b border-[#232f48] px-4 py-2 flex items-center justify-between">
                              <span className="text-[9px] uppercase font-extrabold text-slate-400 font-mono tracking-wider">Source Code Snapshot</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(run.code || "");
                                  showToast("Code copied to clipboard!", "success");
                                }}
                                className="px-2.5 py-1 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 select-none"
                              >
                                <i className="far fa-copy text-[10px]"></i>
                                <span>Copy Code</span>
                              </button>
                            </div>
                            <pre className="p-4 font-mono text-[11px] text-slate-300 select-text overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre text-left bg-[#070b13]">
                              {run.code || "// No source code snapshot was recorded for this execution."}
                            </pre>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Show More Pagination inside the History Page */}
          {hasMoreRuns && !loading && (
            <div className="pt-4 text-center border-t border-[var(--border-color)]/30">
              <button
                onClick={() => setDisplayLimit(prev => prev + 10)}
                className="px-6 py-2.5 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-2 mx-auto"
              >
                <span>Load More Execution Logs</span>
                <i className="fas fa-chevron-down text-[8px]"></i>
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
