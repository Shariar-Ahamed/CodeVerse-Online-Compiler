import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage({ user, onLogout, showToast }) {
  const navigate = useNavigate();

  // Auth Guard: Redirect to login if user is not signed in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle Logout
  const handleLogoutClick = () => {
    onLogout();
    showToast("Signed out successfully", "info");
    navigate('/');
  };

  if (!user) return null;

  // Determinstic opacity list for activity contributions log
  const gridOpacities = [
    "bg-indigo-900/10 border-slate-800",
    "bg-indigo-600/30 border-indigo-500/20",
    "bg-indigo-600/60 border-indigo-500/30",
    "bg-indigo-500 border-indigo-400/40",
    "bg-cyan-400 border-cyan-300/40"
  ];
  
  const contributionGrid = Array.from({ length: 112 }).map((_, i) => {
    // Generate a pseudo-random stable index based on a mathematical pattern
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
            Developer Dashboard
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Monitor compilation metrics, account details, and workspace activities.
          </p>
        </div>
        <button
          onClick={() => navigate('/editor')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-600/15 cursor-pointer relative z-20"
        >
          <i className="fas fa-terminal"></i>
          <span>Launch Code Editor</span>
        </button>
      </div>

      {/* Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative z-10">
        
        {/* Left Column: User Card */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] flex flex-col items-center text-center gap-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl"></div>
            
            {/* Large Avatar */}
            <div
              id="profile-avatar-large"
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 border-2 border-indigo-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/20 font-sans select-none"
            >
              <span id="profile-avatar-initial">{(user.name || 'U').charAt(0).toUpperCase()}</span>
            </div>

            {/* User Text Details */}
            <div className="flex flex-col gap-1">
              <h3 id="profile-name" className="font-bold text-lg text-[var(--text-primary)]">{user.name || 'Developer'}</h3>
              <p id="profile-email" className="text-xs text-[var(--text-muted)] font-mono">{user.email || 'user@codeverse.com'}</p>
              <span className="inline-block mx-auto mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Premium Developer
              </span>
            </div>

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
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleLogoutClick}
                className="w-full py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 transition-all duration-200 cursor-pointer"
              >
                <i className="fas fa-sign-out-alt mr-1.5"></i>
                <span>Sign Out Account</span>
              </button>
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
