import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, orderBy, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { LANGUAGES } from '../utils/languages';

import { INITIAL_CHALLENGES } from '../utils/challenges';

const DEFAULT_API_URL = "https://ce.judge0.com";

// Language options supported for algorithmic challenges
const SUPPORTED_LANGS = [
  { key: 'c', name: 'C', id: 50, defaultStarter: 'c' },
  { key: 'cpp', name: 'C++', id: 54, defaultStarter: 'cpp' },
  { key: 'python', name: 'Python 3', id: 71, defaultStarter: 'python' },
  { key: 'javascript', name: 'JavaScript (Node)', id: 63, defaultStarter: 'javascript' },
  { key: 'java', name: 'Java', id: 62, defaultStarter: 'java' },
  { key: 'go', name: 'Go', id: 60, defaultStarter: 'go' },
  { key: 'rust', name: 'Rust', id: 73, defaultStarter: 'rust' },
  { key: 'csharp', name: 'C#', id: 51, defaultStarter: 'csharp' },
  { key: 'php', name: 'PHP', id: 68, defaultStarter: 'php' },
  { key: 'typescript', name: 'TypeScript', id: 74, defaultStarter: 'typescript' },
  { key: 'bash', name: 'Bash', id: 46, defaultStarter: 'shell' }
];

export default function ChallengeWorkspacePage({ user, theme, showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description'); // description | testcases | history
  
  // Compiler state variables
  const [selectedLang, setSelectedLang] = useState('c');
  const [editorCode, setEditorCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResults, setTestResults] = useState([]); // tracks stdout, stderr, compile log, status
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [useCustomStdin, setUseCustomStdin] = useState(false);
  const [customStdin, setCustomStdin] = useState('');
  
  // Custom compiler endpoint configurations
  const [apiEndpoint] = useState(() => localStorage.getItem("codeverse_api_url") || DEFAULT_API_URL);
  const [apiKey] = useState(() => localStorage.getItem("codeverse_api_key") || "");

  // Base64 helpers matching EditorPage
  const encodeBase64 = (str) => {
    try {
      return btoa(unescape(encodeURIComponent(str || "")));
    } catch (e) {
      console.error("Base64 encoding error:", e);
      return "";
    }
  };

  const decodeBase64 = (str) => {
    try {
      return decodeURIComponent(escape(atob(str || "")));
    } catch (e) {
      console.error("Base64 decoding error:", e);
      return str || "";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    
    return `${day}/${month}/${year}, ${timeStr}`;
  };

  const getStarterComment = (lang) => {
    const langObj = SUPPORTED_LANGS.find(l => l.key === lang);
    const langName = langObj ? langObj.name : lang;
    const ext = LANGUAGES[lang]?.extension || "txt";
    const commentChar = (ext === "py" || ext === "sh" || ext === "rb" || ext === "pl") ? "#" : "//";
    return `${commentChar} Environment: ${langName}\n${commentChar} Write your code here and submit...\n\n`;
  };

  // 1. Load Challenge metadata and user submissions on mount
  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        setLoading(true);
        if (!user || user.isGuest) {
          showToast("Please login to access the challenges workspace.", "error");
          navigate('/login');
          return;
        }

        const challengeDoc = await getDoc(doc(db, "challenges", id));
        if (challengeDoc.exists()) {
          const data = challengeDoc.data();
          setChallenge(data);
          
          // Display 2 lines of helpful comments in the editor
          setEditorCode(getStarterComment(selectedLang));
        } else {
          // Fallback to local INITIAL_CHALLENGES if document not found in DB
          const fallback = INITIAL_CHALLENGES.find(c => c.id === id);
          if (fallback) {
            setChallenge(fallback);
            setEditorCode(getStarterComment(selectedLang));
          } else {
            showToast("Challenge not found.", "error");
            navigate('/challenges');
          }
        }

        // Fetch submission history for this user
        fetchSubmissionsHistory();

      } catch (err) {
        console.error("Error loading challenge:", err);
        // Fallback to local INITIAL_CHALLENGES
        const fallback = INITIAL_CHALLENGES.find(c => c.id === id);
        if (fallback) {
          setChallenge(fallback);
          setEditorCode(getStarterComment(selectedLang));
        } else {
          showToast("Error loading workspace data.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeData();
  }, [id, user]);

  // Fetch past submissions from Firestore (Index-free client-side sorting)
  const fetchSubmissionsHistory = async () => {
    try {
      if (!user) return;
      const subCol = collection(db, "submissions");
      const q = query(
        subCol,
        where("userId", "==", user.uid),
        where("challengeId", "==", id)
      );
      const snapshot = await getDocs(q);
      const historyList = [];
      snapshot.forEach(doc => {
        historyList.push({ id: doc.id, ...doc.data() });
      });
      // Sort client-side by submittedAt desc (prevents Firestore index lag/missing index errors)
      historyList.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      setSubmissionHistory(historyList);
    } catch (err) {
      console.error("Error fetching history: ", err);
    }
  };

  // 2. Adjust default editor templates on language switch
  const handleLangChange = (e) => {
    const nextLang = e.target.value;
    setSelectedLang(nextLang);
    if (challenge) {
      const comment = getStarterComment(nextLang);
      setEditorCode(comment);
      if (editorRef.current) {
        editorRef.current.setValue(comment);
      }
    }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  // 3. RUN CODE: Compiles code against only the first (public) test case or custom input
  const handleRunCode = async () => {
    if (isExecuting || !challenge) return;
    
    const codeToCompile = editorRef.current ? editorRef.current.getValue() : editorCode;
    if (!codeToCompile.trim()) {
      showToast("Please enter some code first!", "error");
      return;
    }

    setIsExecuting(true);
    setActiveTab('testcases');
    
    if (user && !user.isGuest) {
      const d = new Date();
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const userRef = doc(db, "users", user.uid);
      setDoc(userRef, {
        activityLogs: {
          [dateKey]: increment(1)
        }
      }, { merge: true }).catch(err => {
        console.error("Error logging activity: ", err);
      });
    }
    
    const runLabel = useCustomStdin ? "Custom Test Case" : "Sample Test Case";
    setTestResults([{ label: runLabel, status: "Compiling...", isRunning: true }]);

    try {
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };

      if (apiEndpoint.includes("rapidapi.com")) {
        headers["X-RapidAPI-Host"] = apiEndpoint.replace("https://", "").split("/")[0];
        headers["X-RapidAPI-Key"] = apiKey;
      }

      // Execute on first test case or custom stdin
      const sampleCase = useCustomStdin 
        ? { input: customStdin, output: "" } 
        : (challenge.testCases[0] || { input: "", output: "" });
        
      const langConfig = SUPPORTED_LANGS.find(l => l.key === selectedLang);

      const response = await fetch(`${apiEndpoint}/submissions?base64_encoded=true&wait=false`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          source_code: encodeBase64(codeToCompile),
          language_id: langConfig.id,
          stdin: encodeBase64(sampleCase.input),
          redirect_stderr_to_stdout: true
        })
      });

      if (!response.ok) {
        throw new Error(`Submit connection error. Status: ${response.status}`);
      }

      const { token } = await response.json();
      pollRunToken(token, headers, sampleCase, useCustomStdin);

    } catch (err) {
      console.error(err);
      const runLabel = useCustomStdin ? "Custom Test Case" : "Sample Test Case";
      showToast("Run failed. Please check compiler settings.", "error");
      setTestResults([{ label: runLabel, status: "Error", output: err.message, isError: true }]);
      setIsExecuting(false);
    }
  };

  const pollRunToken = (token, headers, sampleCase, isCustomRun) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${apiEndpoint}/submissions/${token}?base64_encoded=true`, {
          method: "GET",
          headers: headers
        });

        if (!response.ok) throw new Error(`Polling error: ${response.status}`);

        const result = await response.json();
        const statusId = result.status?.id;

        if (statusId > 2) {
          clearInterval(pollInterval);
          setIsExecuting(false);

          const stdout = result.stdout ? decodeBase64(result.stdout).trim() : "";
          const stderr = result.stderr ? decodeBase64(result.stderr).trim() : "";
          const compileOutput = result.compile_output ? decodeBase64(result.compile_output).trim() : "";

          const isAccepted = isCustomRun 
            ? statusId === 3 
            : (statusId === 3 && stdout === sampleCase.output.trim());
            
          const runLabel = isCustomRun ? "Custom Test Case" : "Sample Test Case";

          setTestResults([{
            label: runLabel,
            status: isAccepted ? "Accepted" : statusId === 3 ? "Wrong Answer" : result.status?.description || "Runtime Error",
            input: sampleCase.input,
            expected: isCustomRun ? null : sampleCase.output,
            output: stdout || compileOutput || stderr || "[No output printed]",
            isSuccess: isAccepted,
            isError: !isAccepted
          }]);
        }
      } catch (err) {
        clearInterval(pollInterval);
        setIsExecuting(false);
        const runLabel = isCustomRun ? "Custom Test Case" : "Sample Test Case";
        setTestResults([{ label: runLabel, status: "Polling Error", output: err.message, isError: true }]);
      }
    }, 1500);
  };

  // 4. SUBMIT CODE: Runs batch compilation against ALL test cases (visible and hidden)
  const handleSubmitCode = async () => {
    if (isExecuting || !challenge) return;

    const codeToCompile = editorRef.current ? editorRef.current.getValue() : editorCode;
    if (!codeToCompile.trim()) {
      showToast("Please enter some code first!", "error");
      return;
    }

    setIsExecuting(true);
    setActiveTab('testcases');

    if (user && !user.isGuest) {
      const d = new Date();
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const userRef = doc(db, "users", user.uid);
      setDoc(userRef, {
        activityLogs: {
          [dateKey]: increment(1)
        }
      }, { merge: true }).catch(err => {
        console.error("Error logging activity: ", err);
      });
    }

    // Setup initial pending states for all test cases
    const initialStates = challenge.testCases.map((tc, idx) => ({
      label: tc.isHidden ? `Hidden Test Case ${idx}` : `Public Test Case ${idx + 1}`,
      status: "Queued...",
      isRunning: true
    }));
    setTestResults(initialStates);

    try {
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };

      if (apiEndpoint.includes("rapidapi.com")) {
        headers["X-RapidAPI-Host"] = apiEndpoint.replace("https://", "").split("/")[0];
        headers["X-RapidAPI-Key"] = apiKey;
      }

      const langConfig = SUPPORTED_LANGS.find(l => l.key === selectedLang);

      // Map each challenge test case into a Judge0 batch submission payload
      const submissionsPayload = challenge.testCases.map(tc => ({
        source_code: encodeBase64(codeToCompile),
        language_id: langConfig.id,
        stdin: encodeBase64(tc.input),
        redirect_stderr_to_stdout: true
      }));

      const response = await fetch(`${apiEndpoint}/submissions/batch?base64_encoded=true&wait=false`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ submissions: submissionsPayload })
      });

      if (!response.ok) {
        throw new Error(`Batch submission failed. Status: ${response.status}`);
      }

      const responseList = await response.json();
      const tokens = responseList.map(item => item.token);

      pollBatchTokens(tokens, headers, codeToCompile);

    } catch (err) {
      console.error(err);
      showToast("Submission failed. Connection error.", "error");
      setTestResults(challenge.testCases.map((tc, idx) => ({
        label: tc.isHidden ? `Hidden Test Case ${idx}` : `Public Test Case ${idx + 1}`,
        status: "Error",
        output: err.message,
        isError: true
      })));
      setIsExecuting(false);
    }
  };

  const pollBatchTokens = (tokens, headers, codeToCompile) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${apiEndpoint}/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=true`, {
          method: "GET",
          headers: headers
        });

        if (!response.ok) throw new Error(`Polling status error: ${response.status}`);

        const data = await response.json();
        const submissionsResults = data.submissions || [];

        // Check if all test cases have finished executing (status ID > 2)
        const allFinished = submissionsResults.every(res => res.status?.id > 2);

        if (allFinished) {
          clearInterval(pollInterval);
          setIsExecuting(false);

          let allPassed = true;
          const processedResults = submissionsResults.map((result, idx) => {
            const expectedOutput = challenge.testCases[idx].output.trim();
            const stdout = result.stdout ? decodeBase64(result.stdout).trim() : "";
            const stderr = result.stderr ? decodeBase64(result.stderr).trim() : "";
            const compileOutput = result.compile_output ? decodeBase64(result.compile_output).trim() : "";

            const isPassed = result.status?.id === 3 && stdout === expectedOutput;
            if (!isPassed) allPassed = false;

            return {
              label: challenge.testCases[idx].isHidden ? `Hidden Test Case ${idx}` : `Public Test Case ${idx + 1}`,
              status: isPassed ? "Accepted" : result.status?.id === 3 ? "Wrong Answer" : result.status?.description || "Error",
              input: challenge.testCases[idx].isHidden ? "[Hidden]" : challenge.testCases[idx].input,
              expected: challenge.testCases[idx].isHidden ? "[Hidden]" : expectedOutput,
              output: challenge.testCases[idx].isHidden && !isPassed ? "[Hidden Output due to mismatch]" : stdout || compileOutput || stderr || "[No output printed]",
              isSuccess: isPassed,
              isError: !isPassed
            };
          });

          setTestResults(processedResults);

          const finalStatus = allPassed ? "Accepted" : "Wrong Answer";

          // 5. Update user score and solved status in Firestore if all test cases passed
          if (allPassed && user && !user.isGuest) {
            updateUserPoints();
          }

          // 6. Record submission in database
          if (user && !user.isGuest) {
            await addDoc(collection(db, "submissions"), {
              userId: user.uid,
              challengeId: id,
              languageId: selectedLang,
              code: codeToCompile,
              status: finalStatus,
              submittedAt: new Date().toISOString()
            });
            fetchSubmissionsHistory();
          }

          if (allPassed) {
            showToast(`Congratulations! You passed all test cases! +${challenge.points} pts`, "success");
          } else {
            showToast("Wrong Answer. Some test cases failed.", "error");
          }
        }

      } catch (err) {
        clearInterval(pollInterval);
        setIsExecuting(false);
        showToast("Error polling batch execution status.", "error");
      }
    }, 1500);
  };

  const updateUserPoints = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let solved = [];
      let currentScore = 0;

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        solved = Array.isArray(data.solvedChallenges) ? data.solvedChallenges : [];
        currentScore = data.score || 0;
      }

      if (!solved.includes(id)) {
        const updatedSolved = [...solved, id];
        const updatedScore = currentScore + challenge.points;

        await setDoc(userDocRef, {
          score: updatedScore,
          solvedChallenges: updatedSolved
        }, { merge: true });

        showToast(`Challenge Solved! +${challenge.points} Points added to your profile.`, "success");
      }
    } catch (err) {
      console.error("Error updating user scores:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] text-white">
        <div className="relative flex items-center justify-center scale-100 mb-4">
          <div className="absolute w-32 h-32 rounded-full bg-purple-500/10 blur-2xl animate-pulse pointer-events-none z-0"></div>
          <div className="tetra-container relative z-10">
            <div className="tetra-3d" style={{ animationDuration: '6s' }}>
              <div className="tetra-face tetra-face-1"></div>
              <div className="tetra-face tetra-face-2"></div>
              <div className="tetra-face tetra-face-3"></div>
              <div className="tetra-face tetra-face-bottom"></div>
            </div>
          </div>
        </div>
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Configuring Sandbox Workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col lg:flex-row h-[880px] text-white bg-[var(--bg-primary)] overflow-hidden relative">
      {/* Background Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-600/5 blur-[120px] z-0 pointer-events-none"></div>

      {/* LEFT COLUMN: Problem Details / Output console (40% width) */}
      <div className="w-full lg:w-[42%] flex flex-col h-full bg-transparent p-4 lg:p-6 lg:pr-3 z-10">
        
        <div className="flex-grow flex flex-col border border-[var(--border-color)] rounded-2xl glass-panel overflow-hidden shadow-2xl transition-all duration-300 ide-neon-border bg-[#0d1321]/30 h-full">
          
          {/* Workspace Tab headers */}
          <div className="flex border-b border-[var(--border-color)] bg-[#0d1321]/50 shrink-0">
            {['description', 'testcases', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'testcases' ? 'Test Cases' : tab}
              </button>
            ))}
          </div>

          {/* Tab contents (Scrollable body) */}
          <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
            
            {/* TAB 1: DESCRIPTION */}
            {activeTab === 'description' && challenge && (
              <div className="text-left space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="text-xl font-black text-white tracking-tight">{challenge.title}</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {challenge.difficulty}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-400">+{challenge.points} pts</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 leading-relaxed text-xs text-slate-300">
                  {challenge.description}
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <i className="fas fa-terminal text-[10px]"></i>
                    <span>Example Walkthrough</span>
                  </h4>
                  {challenge.testCases.filter(t => !t.isHidden).map((tc, idx) => (
                    <div key={idx} className="bg-slate-900/30 rounded-2xl border border-white/5 p-5 text-xs font-mono space-y-4 mb-4 shadow-inner">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <i className="fas fa-arrow-right text-[9px] text-indigo-400"></i>
                          <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">Input</span>
                        </div>
                        <pre className="bg-[#0b0f19]/60 border border-slate-800/45 border-l-2 border-l-indigo-500/50 p-3 rounded-xl text-slate-300 overflow-x-auto font-mono text-[11px] leading-relaxed">
                          {tc.input}
                        </pre>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <i className="fas fa-check text-[9px] text-emerald-400"></i>
                          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">Expected Output</span>
                        </div>
                        <pre className="bg-[#0b0f19]/60 border border-slate-800/45 border-l-2 border-l-emerald-500/50 p-3 rounded-xl text-slate-300 overflow-x-auto font-mono text-[11px] leading-relaxed">
                          {tc.output}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TEST CASES RUN CONSOLE */}
            {activeTab === 'testcases' && (
              <div className="text-left space-y-4">
                

                <h3 className="text-sm font-bold text-white mb-2">Test Suite Results</h3>
                {testResults.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950/30 border border-dashed border-[var(--border-color)] rounded-xl text-xs text-slate-400">
                    <i className="fas fa-play text-lg text-slate-500 mb-2 block"></i>
                    Write code and click 'Run Code' or 'Submit' to evaluate outputs.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testResults.map((res, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-xl p-4 bg-slate-950/30 text-xs transition-all duration-300 ${
                          res.isSuccess
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : res.isError
                            ? 'border-rose-500/30 bg-rose-500/5'
                            : 'border-[var(--border-color)] animate-pulse'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-3 border-b border-white/5 pb-2">
                          <span className="font-bold text-slate-200">{res.label}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            res.isSuccess
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : res.isError
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-indigo-500/20 text-indigo-400 animate-pulse'
                          }`}>
                            {res.status}
                          </span>
                        </div>
                        
                        {res.input && (
                          <div className="mb-2 font-mono text-[11px]">
                            <span className="text-slate-500">Input: </span>
                            <span className="text-slate-300 bg-black/40 px-1.5 py-0.5 rounded">{res.input}</span>
                          </div>
                        )}
                        
                        {res.expected && (
                          <div className="mb-2 font-mono text-[11px]">
                            <span className="text-slate-500">Expected: </span>
                            <span className="text-slate-300 bg-black/40 px-1.5 py-0.5 rounded">{res.expected}</span>
                          </div>
                        )}

                        {res.output && (
                          <div className="mt-2">
                            <span className="text-[10px] text-slate-500 font-bold block mb-1">Stdout Output:</span>
                            <pre className="bg-black/30 p-2.5 rounded text-slate-300 overflow-x-auto font-mono text-[11px] max-h-36 scrollbar-thin">
                              {res.output}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PAST SUBMISSIONS HISTORY */}
            {activeTab === 'history' && (
              <div className="text-left space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">Submission Logs</h3>
                {submissionHistory.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950/30 border border-dashed border-[var(--border-color)] rounded-xl text-xs text-slate-400">
                    <i className="fas fa-history text-lg text-slate-500 mb-2 block"></i>
                    No submission history found for this challenge.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissionHistory.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-xl border border-[var(--border-color)] bg-slate-950/20 flex items-center justify-between text-xs gap-4 hover:border-indigo-500/30 transition-all duration-200"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                              sub.status === "Accepted"
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {sub.status}
                            </span>
                            <span className="font-bold text-slate-300 uppercase">{sub.languageId}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {formatDate(sub.submittedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setEditorCode(sub.code);
                            if (editorRef.current) {
                              editorRef.current.setValue(sub.code);
                            }
                            showToast("Loaded code template from history log.", "info");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-slate-800 text-[10px] font-bold border border-[var(--border-color)] active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                          Load Code
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Code Editor & Exec Controls (60% width) */}
      <div className="flex-grow flex flex-col h-full bg-transparent p-4 lg:p-6 gap-6 z-10">
        
        <div className="flex-grow flex flex-col border border-[var(--border-color)] rounded-2xl glass-panel overflow-hidden shadow-2xl transition-all duration-300 ide-neon-border bg-[#0d1321]/30 h-full">
          
          {/* Editor Settings bar */}
          <div className="flex items-center justify-between px-6 py-2 border-b border-[var(--border-color)] bg-[#0d1321]/50 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">Environment:</span>
              <select
                value={selectedLang}
                onChange={handleLangChange}
                className="bg-[var(--bg-tertiary)] text-xs font-bold text-white px-3 py-1.5 rounded-lg border border-[var(--border-color)] focus:outline-none focus:border-indigo-500/50 cursor-pointer"
              >
                {SUPPORTED_LANGS.map(lang => (
                  <option key={lang.key} value={lang.key}>{lang.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/challenges')}
                className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <i className="fas fa-arrow-left text-[10px]"></i>
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
              </div>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-grow relative bg-[#070a13] min-h-[300px]">
            <div className="absolute inset-0 w-full h-full">
              <Editor
                language={SUPPORTED_LANGS.find(l => l.key === selectedLang)?.defaultStarter}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={editorCode}
                onMount={handleEditorMount}
                options={{
                  fontSize: 14,
                  fontFamily: 'Fira Code, JetBrains Mono, monospace',
                  fontLigatures: true,
                  automaticLayout: true,
                  minimap: { enabled: true },
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible',
                    useShadows: false,
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8
                  },
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: true,
                  padding: { top: 12, bottom: 12 }
                }}
              />
            </div>
          </div>

          {/* Editor Status bar */}
          <div className="h-8 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/20 flex items-center justify-between px-6 text-[10px] text-[var(--text-muted)] font-mono shrink-0 select-none">
            <div>Status: Ready to edit</div>
            <div>Shortcut: Ctrl + Enter to run</div>
          </div>

          {/* Custom Input Console Drawer */}
          <div className="border-t border-[var(--border-color)] bg-[#0c101b]/95 px-6 py-3 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useCustomStdin}
                  onChange={(e) => setUseCustomStdin(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Run code with custom test input (stdin)</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Use for scanf / cin / input()</span>
            </div>
            
            {useCustomStdin && (
              <textarea
                value={customStdin}
                onChange={(e) => setCustomStdin(e.target.value)}
                className="w-full h-20 p-3 bg-[#0b0f19]/70 text-slate-200 rounded-xl border border-slate-800/80 border-l-2 border-l-indigo-500/50 focus:outline-none focus:border-indigo-500/70 font-mono text-[11px] placeholder:italic placeholder:text-slate-600 resize-none transition-all duration-200 shadow-inner"
                placeholder="Enter custom inputs here (e.g. 5 or custom arrays, one per line)..."
              />
            )}
          </div>

          {/* Footer controls panel */}
          <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[#0d1321]/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isExecuting ? 'bg-indigo-500 animate-ping' : 'bg-slate-500'}`}></div>
              <span className="text-xs font-bold text-slate-400">
                {isExecuting ? "Executing code packages..." : "Sandbox system idle."}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleRunCode}
                disabled={isExecuting}
                className="flex-grow sm:flex-grow-0 px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-tertiary)] hover:bg-slate-800 text-slate-300 hover:text-white border border-[var(--border-color)] disabled:opacity-50 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-play text-[10px]"></i>
                <span>Run Code</span>
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isExecuting}
                className="flex-grow sm:flex-grow-0 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-paper-plane text-[10px]"></i>
                <span>Submit Solution</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
