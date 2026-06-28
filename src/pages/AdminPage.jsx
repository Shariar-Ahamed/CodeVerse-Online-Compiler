import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_CHALLENGES } from '../utils/challenges';

export default function AdminPage({ user, showToast }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState(null); // null means creating new
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [points, setPoints] = useState(50);
  const [testCases, setTestCases] = useState([{ input: '', output: '', isHidden: false }]);

  // Load challenges on mount
  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const challengesCol = collection(db, "challenges");
      const snapshot = await getDocs(challengesCol);
      
      if (snapshot.empty) {
        // Fallback/Seed standard
        setChallenges(INITIAL_CHALLENGES);
      } else {
        const list = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setChallenges(list);
      }
    } catch (err) {
      console.error("Error loading challenges in admin: ", err);
      showToast("Error loading challenges database", "error");
      setChallenges(INITIAL_CHALLENGES);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for creating new challenge
  const handleCreateNew = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDifficulty('Easy');
    setPoints(50);
    setTestCases([{ input: '', output: '', isHidden: false }]);
    setIsFormOpen(true);
  };

  // Open modal for editing existing challenge
  const handleEdit = (challenge) => {
    setEditingId(challenge.id);
    setTitle(challenge.title || '');
    setDescription(challenge.description || '');
    setDifficulty(challenge.difficulty || 'Easy');
    setPoints(challenge.points || 50);
    
    // Check if test cases exist, format if they don't
    const cases = Array.isArray(challenge.testCases) && challenge.testCases.length > 0 
      ? challenge.testCases.map(tc => ({
          input: tc.input || '',
          output: tc.output || '',
          isHidden: !!tc.isHidden
        }))
      : [{ input: '', output: '', isHidden: false }];
      
    setTestCases(cases);
    setIsFormOpen(true);
  };

  // Delete challenge from Firestore
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this challenge? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "challenges", id));
      showToast("Challenge deleted successfully", "success");
      fetchChallenges();
    } catch (err) {
      console.error("Error deleting challenge: ", err);
      showToast("Failed to delete challenge", "error");
    }
  };

  // Add a new blank testcase field row
  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', output: '', isHidden: false }]);
  };

  // Remove a testcase field row
  const handleRemoveTestCase = (idx) => {
    if (testCases.length === 1) {
      showToast("You must provide at least one test case!", "warning");
      return;
    }
    const updated = testCases.filter((_, i) => i !== idx);
    setTestCases(updated);
  };

  // Handle single testcase field edits
  const handleTestCaseChange = (idx, field, value) => {
    const updated = testCases.map((tc, i) => {
      if (i === idx) {
        return { ...tc, [field]: value };
      }
      return tc;
    });
    setTestCases(updated);
  };

  // Submit and save challenge
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast("Please fill in Title and Description!", "error");
      return;
    }

    // Verify all test cases contain input & output
    const isValidTestcases = testCases.every(tc => tc.output.trim() !== "");
    if (!isValidTestcases) {
      showToast("All test cases must contain expected outputs!", "error");
      return;
    }

    // Create unique document id
    const docId = editingId || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    const challengeData = {
      id: docId,
      title: title.trim(),
      description: description.trim(),
      difficulty: difficulty,
      points: Number(points),
      testCases: testCases.map(tc => ({
        input: tc.input.trim(),
        output: tc.output.trim(),
        isHidden: tc.isHidden
      })),
      starterCode: {
        python: "# Python 3 Starter Code\n# Write your code here\n",
        cpp: "// C++ Starter Code\n// Write your code here\n",
        javascript: "// Node.js Starter Code\n// Write your code here\n",
        java: "// Java Starter Code\n// Write your code here\n"
      }
    };

    try {
      await setDoc(doc(db, "challenges", docId), challengeData);
      showToast(editingId ? "Challenge updated successfully!" : "New challenge created successfully!", "success");
      setIsFormOpen(false);
      fetchChallenges();
    } catch (err) {
      console.error("Error saving challenge: ", err);
      showToast("Failed to save challenge to Firestore.", "error");
    }
  };

  // Difficulty counts
  const easyCount = challenges.filter(c => c.difficulty === 'Easy').length;
  const mediumCount = challenges.filter(c => c.difficulty === 'Medium').length;
  const hardCount = challenges.filter(c => c.difficulty === 'Hard').length;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] text-white relative">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-600/5 blur-[120px] z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto mt-6 relative z-10">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-[var(--border-color)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
              <i className="fas fa-crown text-indigo-400 text-2xl"></i>
              <span>Admin Challenge Manager</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Add, edit, or delete algorithmic problems and configure test cases dynamically in Firestore.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg shadow-indigo-600/25 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Add New Challenge</span>
          </button>
        </div>

        {/* Dashboard Statistics summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0d1321]/30 glass-panel border border-[var(--border-color)] rounded-xl p-5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider mb-1">Total Problems</span>
            <span className="text-2xl font-black text-white">{challenges.length}</span>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider mb-1">Easy</span>
            <span className="text-2xl font-black text-emerald-300">{easyCount}</span>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider mb-1">Medium</span>
            <span className="text-2xl font-black text-amber-300">{mediumCount}</span>
          </div>
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-5 text-center">
            <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider mb-1">Hard</span>
            <span className="text-2xl font-black text-rose-300">{hardCount}</span>
          </div>
        </div>

        {/* Challenges table view */}
        <div className="bg-[#0d1321]/20 border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl glass-panel">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider animate-pulse">Loading Challenges list...</p>
            </div>
          ) : challenges.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs italic">
              No challenges loaded. Click Add New Challenge to populate.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[#0d1321]/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">ID / Slug</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4">Points</th>
                    <th className="px-6 py-4">Test Cases</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/30 text-xs">
                  {challenges.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{c.title}</td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{c.id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          c.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {c.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-400">+{c.points} pts</td>
                      <td className="px-6 py-4 font-semibold text-slate-300">
                        {Array.isArray(c.testCases) ? c.testCases.length : 0} Cases
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-indigo-500/40 bg-[var(--bg-tertiary)]/50 hover:bg-indigo-500/10 text-slate-300 hover:text-indigo-400 active:scale-95 transition-all cursor-pointer"
                            title="Edit Challenge"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-rose-500/40 bg-[var(--bg-tertiary)]/50 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 active:scale-95 transition-all cursor-pointer"
                            title="Delete Challenge"
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Challenge Form Modal Overlay */}
      {isFormOpen && (
        <div className="modal-overlay fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-[var(--border-color)] bg-[#0c101b] shadow-2xl p-6 md:p-8 animate-fade-in-up my-8 max-h-[85vh] flex flex-col justify-between overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-6 shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fas fa-circle-info text-indigo-400"></i>
                <span>{editingId ? "Edit Coding Challenge" : "Create New Coding Challenge"}</span>
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800 text-left">
              
              {/* Row 1: Title & Points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Challenge Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. FizzBuzz, Prime Number Check"
                    className="px-4 py-2.5 rounded-xl bg-[#090d16]/70 border border-slate-800/80 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/70 font-medium text-xs transition-all shadow-inner"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty & Score Reward</label>
                  <div className="flex gap-2">
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-[#090d16]/70 border border-slate-800/80 text-white focus:outline-none focus:border-indigo-500/70 font-semibold text-xs transition-all w-full select-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                      min="1"
                      className="px-3 py-2.5 w-24 rounded-xl bg-[#090d16]/70 border border-slate-800/80 text-white focus:outline-none focus:border-indigo-500/70 font-bold text-xs transition-all text-center"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problem Description (Instructions)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the problem description, constraints, and standard inputs..."
                  className="w-full h-32 p-3 bg-[#090d16]/70 border border-slate-800/80 text-slate-300 focus:outline-none focus:border-indigo-500/70 rounded-xl font-sans text-xs leading-relaxed resize-none transition-all shadow-inner"
                  required
                />
              </div>

              {/* Testcases header */}
              <div className="border-t border-[var(--border-color)]/65 pt-5 mb-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Test Suite Cases</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Define inputs and expected outputs to run compiler diagnostics.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="px-4 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold text-[10px] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Add Testcase Row</span>
                  </button>
                </div>

                {/* Testcases list layout */}
                <div className="space-y-4">
                  {testCases.map((tc, idx) => (
                    <div key={idx} className="bg-slate-900/20 rounded-2xl border border-white/5 p-4 space-y-3 relative shadow-inner">
                      {/* Title row with delete action */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Test Case #{idx + 1}
                        </span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={tc.isHidden}
                              onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                            <span>Hidden Case? (for Submit evaluation)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="text-rose-400 hover:text-rose-300 text-[10px] font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
                          >
                            <i className="fas fa-trash-can"></i>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Inputs & outputs split */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Standard Input (stdin)</span>
                          <textarea
                            value={tc.input}
                            onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                            placeholder="e.g. 5"
                            className="w-full h-16 p-2 bg-[#090d16]/80 border border-slate-800/80 text-slate-300 font-mono text-[10px] focus:outline-none focus:border-indigo-500/70 rounded-lg resize-none transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Expected Output (stdout)</span>
                          <textarea
                            value={tc.output}
                            onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)}
                            placeholder="e.g. 1 2 Fizz 4 Buzz"
                            className="w-full h-16 p-2 bg-[#090d16]/80 border border-slate-800/80 text-slate-300 font-mono text-[10px] focus:outline-none focus:border-indigo-500/70 rounded-lg resize-none transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal controls actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-color)] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] hover:bg-slate-800 font-bold text-xs text-slate-300 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg shadow-indigo-600/25 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  {editingId ? "Update Challenge" : "Create Challenge"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
