import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { LANGUAGES, DEFAULT_WEB_CSS, DEFAULT_WEB_JS } from '../utils/languages';
import { doc, collection, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import AIPanel from '../components/AIPanel';

const DEFAULT_API_URL = "https://ce.judge0.com";

export default function EditorPage({ user, theme, showToast }) {
  // --- States ---
  const [searchParams] = useSearchParams();
  const queryLang = searchParams.get('lang');
  
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem("codeverse_lang");
    return (saved && LANGUAGES[saved]) ? saved : "html";
  });
  
  useEffect(() => {
    if (queryLang && LANGUAGES[queryLang]) {
      setCurrentLanguage(queryLang);
    }
  }, [queryLang]);

  const [activeWebTab, setActiveWebTab] = useState(() => localStorage.getItem("codeverse_web_active_tab") || "html");
  
  // HTML Playground files states
  const [htmlCode, setHtmlCode] = useState(() => localStorage.getItem("codeverse_code_html") || LANGUAGES.html.defaultCode);
  const [cssCode, setCssCode] = useState(() => localStorage.getItem("codeverse_web_css") || DEFAULT_WEB_CSS);
  const [jsCode, setJsCode] = useState(() => localStorage.getItem("codeverse_web_js") || DEFAULT_WEB_JS);
  
  // Backend compiler code state
  const [code, setCode] = useState(() => {
    if (currentLanguage === "html" || currentLanguage === "text") return "";
    return localStorage.getItem(`codeverse_code_${currentLanguage}`) || LANGUAGES[currentLanguage]?.defaultCode || "";
  });

  const [stdin, setStdin] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('CodeVerse Online Terminal.\nWrite code and click \'Run Code\' to execute.\n');
  const [statusBadge, setStatusBadge] = useState({
    text: 'Idle',
    className: 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
  });
  const [timeIndicator, setTimeIndicator] = useState('-');
  const [memoryIndicator, setMemoryIndicator] = useState('-');
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPromptContext, setAiPromptContext] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState(() => localStorage.getItem("codeverse_api_url") || DEFAULT_API_URL);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("codeverse_api_key") || "");
  
  // Web Lab Logs state
  const [webLogs, setWebLogs] = useState([]);

  // --- Text Notes Workspace States & Handlers ---
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("codeverse_notes");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading saved notes", e);
    }
    return [
      {
        id: 'welcome',
        title: 'Welcome to CodeVerse Notes!',
        content: 'Welcome to your personal scratchpad!\n\nHere you can:\n1. Keep notes side-by-side with your programming environment.\n2. Create multiple notes using the "+" button on the sidebar.\n3. Search notes by title.\n4. Download note content as a .txt file.\n5. Auto-save is active - everything you write is instantly stored in your browser\'s local storage.',
        updatedAt: new Date().toISOString()
      }
    ];
  });

  // --- Firestore Realtime Sync for Notes ---
  useEffect(() => {
    if (!user || user.isGuest) {
      // Guest mode or not logged in: Load notes from localStorage
      try {
        const saved = localStorage.getItem("codeverse_notes");
        if (saved) {
          setNotes(JSON.parse(saved));
        } else {
          setNotes([
            {
              id: 'welcome',
              title: 'Welcome to CodeVerse Notes!',
              content: 'Welcome to your personal scratchpad!\n\nHere you can:\n1. Keep notes side-by-side with your programming environment.\n2. Create multiple notes using the "+" button on the sidebar.\n3. Search notes by title.\n4. Download note content as a .txt file.\n5. Auto-save is active - everything you write is instantly stored in your browser\'s local storage.',
              updatedAt: new Date().toISOString()
            }
          ]);
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    // Authenticated Firebase User: Subscribe to Firestore notes collection
    const userNotesRef = collection(db, "users", user.uid, "notes");
    const unsubscribe = onSnapshot(userNotesRef, (snapshot) => {
      const dbNotes = [];
      snapshot.forEach((docSnap) => {
        dbNotes.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Sort by updatedAt descending
      dbNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      if (dbNotes.length === 0) {
        // Create a default welcome note in cloud if they have no notes yet
        const defaultNote = {
          title: 'Welcome to CodeVerse Cloud Notes!',
          content: 'This is your secure cloud scratchpad. Your notes are saved to your account in real-time!',
          updatedAt: new Date().toISOString()
        };
        const defaultDocRef = doc(db, "users", user.uid, "notes", "welcome_cloud");
        setDoc(defaultDocRef, defaultNote);
      } else {
        setNotes(dbNotes);
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // --- Firestore Cloud Code Load ---
  useEffect(() => {
    if (!user || user.isGuest) return;

    const loadCloudCodes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "code_workspaces"));
        querySnapshot.forEach((docSnap) => {
          const langId = docSnap.id;
          const data = docSnap.data();
          if (langId === "html") {
            if (data.htmlCode) {
              setHtmlCode(data.htmlCode);
              localStorage.setItem("codeverse_code_html", data.htmlCode);
            }
            if (data.cssCode) {
              setCssCode(data.cssCode);
              localStorage.setItem("codeverse_web_css", data.cssCode);
            }
            if (data.jsCode) {
              setJsCode(data.jsCode);
              localStorage.setItem("codeverse_web_js", data.jsCode);
            }
          } else {
            if (data.code) {
              localStorage.setItem(`codeverse_code_${langId}`, data.code);
              if (currentLanguage === langId) {
                setCode(data.code);
              }
            }
          }
        });
      } catch (e) {
        console.error("Error loading codes from Firestore:", e);
      }
    };

    loadCloudCodes();
  }, [user]);

  const [activeNoteId, setActiveNoteId] = useState(() => {
    const saved = localStorage.getItem("codeverse_active_note_id");
    return saved || 'welcome';
  });

  const [noteSearchQuery, setNoteSearchQuery] = useState('');

  // Sync notes and activeNoteId with localStorage (ONLY for guest users!)
  useEffect(() => {
    if (!user || user.isGuest) {
      localStorage.setItem("codeverse_notes", JSON.stringify(notes));
    }
  }, [notes, user]);

  useEffect(() => {
    localStorage.setItem("codeverse_active_note_id", activeNoteId);
  }, [activeNoteId]);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  // Helper to save current workspace code to cloud database
  const saveCodeToFirestore = async (lang, data) => {
    if (!user || user.isGuest) return;
    try {
      const docRef = doc(db, "users", user.uid, "code_workspaces", lang);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Error saving code to Firestore:", e);
    }
  };

  const handleCreateNote = async () => {
    if (!user || user.isGuest) {
      if (notes.length >= 3) {
        showToast("Guest accounts are limited to 3 notes. Login to unlock unlimited notes!", "warning");
        return;
      }
      const newNote = {
        id: Date.now().toString(),
        title: 'Untitled Note',
        content: '',
        updatedAt: new Date().toISOString()
      };
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      showToast("New note created", "success");
    } else {
      const noteId = Date.now().toString();
      const newNote = {
        title: 'Untitled Note',
        content: '',
        updatedAt: new Date().toISOString()
      };
      try {
        const noteDocRef = doc(db, "users", user.uid, "notes", noteId);
        await setDoc(noteDocRef, newNote);
        setActiveNoteId(noteId);
        showToast("New cloud note created", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to create note on cloud.", "error");
      }
    }
  };

  const handleDeleteNote = async (id, e) => {
    if (e) e.stopPropagation();
    
    if (!user || user.isGuest) {
      const remaining = notes.filter(n => n.id !== id);
      setNotes(remaining);
      if (activeNoteId === id) {
        if (remaining.length > 0) {
          setActiveNoteId(remaining[0].id);
        } else {
          setActiveNoteId('');
        }
      }
      showToast("Note deleted", "info");
    } else {
      try {
        const noteDocRef = doc(db, "users", user.uid, "notes", id);
        await deleteDoc(noteDocRef);
        
        const remaining = notes.filter(n => n.id !== id);
        if (activeNoteId === id) {
          if (remaining.length > 0) {
            setActiveNoteId(remaining[0].id);
          } else {
            setActiveNoteId('');
          }
        }
        showToast("Cloud note deleted", "info");
      } catch (err) {
        console.error(err);
        showToast("Failed to delete note from cloud.", "error");
      }
    }
  };

  const handleUpdateNote = async (field, value) => {
    if (!activeNote) return;

    if (!user || user.isGuest) {
      setNotes(prev => prev.map(n => {
        if (n.id === activeNote.id) {
          return {
            ...n,
            [field]: value,
            updatedAt: new Date().toISOString()
          };
        }
        return n;
      }));
    } else {
      // Optimistic UI: Update state locally instantly for zero delay
      setNotes(prev => prev.map(n => {
        if (n.id === activeNote.id) {
          return {
            ...n,
            [field]: value,
            updatedAt: new Date().toISOString()
          };
        }
        return n;
      }));

      // Write asynchronously to Firestore
      try {
        const noteDocRef = doc(db, "users", user.uid, "notes", activeNote.id);
        await setDoc(noteDocRef, {
          title: field === 'title' ? value : activeNote.title,
          content: field === 'content' ? value : activeNote.content,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Firestore update error:", err);
      }
    }
  };

  const handleDownloadNote = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeNote.title || 'Untitled'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Downloaded note successfully", "success");
  };

  const handleCopyNote = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content).then(() => {
      showToast("Note content copied to clipboard", "success");
    }).catch(err => {
      console.error(err);
      showToast("Failed to copy note", "error");
    });
  };

  // Refs
  const editorRef = useRef(null);
  const previewFrameRef = useRef(null);

  // Sync settings inputs in state
  const [settingsUrlInput, setSettingsUrlInput] = useState(apiEndpoint);
  const [settingsKeyInput, setSettingsKeyInput] = useState(apiKey);

  // Effect to sync options when global theme changes
  useEffect(() => {
    if (editorRef.current) {
      const monaco = window.monaco;
      if (monaco) {
        monaco.editor.setTheme(theme === 'light' ? 'vs' : 'dracula');
      }
    }
  }, [theme]);

  // Listen to messages from Web Lab Preview Iframe
  useEffect(() => {
    const handleIframeMessage = (e) => {
      if (e.data && e.data.source === "codeverse-preview") {
        setWebLogs((prev) => [...prev, { type: e.data.type, args: e.data.args }]);
      }
    };
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, []);

  // Sync current language settings on load/change
  useEffect(() => {
    localStorage.setItem("codeverse_lang", currentLanguage);
    if (currentLanguage !== "html" && currentLanguage !== "text") {
      const savedCode = localStorage.getItem(`codeverse_code_${currentLanguage}`) || LANGUAGES[currentLanguage]?.defaultCode || "";
      setCode(savedCode);
    }
  }, [currentLanguage]);

  // Define Dracula theme and cache editor reference
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme('dracula', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'f8f8f2' },
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'identifier', foreground: 'f8f8f2' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'operator', foreground: 'ff79c6' },
        { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
        { token: 'class', foreground: '50fa7b' },
        { token: 'function', foreground: '50fa7b' },
        { token: 'variable', foreground: 'f8f8f2' },
        { token: 'variable.predefined', foreground: '8be9fd' },
        { token: 'constant', foreground: 'bd93f9' },
        { token: 'regexp', foreground: 'ffb86c' },
        { token: 'annotation', foreground: 'ffb86c' }
      ],
      colors: {
        'editor.background': '#282a36',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#44475a',
        'editorCursor.foreground': '#08CB00',
        'editor.selectionBackground': '#44475a',
        'editor.inactiveSelectionBackground': '#44475a44',
        'editor.lineHighlightBorder': '#282a36'
      }
    });

    monaco.editor.setTheme(theme === 'light' ? 'vs' : 'dracula');

    // Add listener for Ctrl+Enter hotkey to run code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCode();
    });

    // Add listener for Ctrl+S hotkey to save code to Firestore
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const editorVal = editor.getValue();
      if (!user || user.isGuest) {
        showToast("Logged in users can save workspaces to the cloud! Login to use this feature.", "info");
      } else {
        if (currentLanguage === "html") {
          if (activeWebTab === "html") {
            saveCodeToFirestore("html", { htmlCode: editorVal });
          } else if (activeWebTab === "css") {
            saveCodeToFirestore("html", { cssCode: editorVal });
          } else {
            saveCodeToFirestore("html", { jsCode: editorVal });
          }
        } else if (currentLanguage !== "text") {
          saveCodeToFirestore(currentLanguage, { code: editorVal });
        }
        showToast("Workspace code saved to cloud", "success");
      }
    });
  };

  const handleLanguageChange = (e) => {
    const nextLang = e.target.value;
    handleLanguageSwitch(nextLang);
  };

  const handleLanguageSwitch = (nextLang) => {
    if (!LANGUAGES[nextLang]) return;

    // Cache current edits
    if (currentLanguage !== "html" && currentLanguage !== "text") {
      localStorage.setItem(`codeverse_code_${currentLanguage}`, code);
    } else if (currentLanguage === "html") {
      localStorage.setItem("codeverse_code_html", htmlCode);
      localStorage.setItem("codeverse_web_css", cssCode);
      localStorage.setItem("codeverse_web_js", jsCode);
    }

    setCurrentLanguage(nextLang);

    if (nextLang !== "html" && nextLang !== "text") {
      const nextCode = localStorage.getItem(`codeverse_code_${nextLang}`) || LANGUAGES[nextLang].defaultCode;
      setCode(nextCode);
    }

    showToast(`Language switched to ${LANGUAGES[nextLang].name}`);
  };

  // Switch tabs inside Web Lab
  const switchWebTab = (tab) => {
    setActiveWebTab(tab);
    localStorage.setItem("codeverse_web_active_tab", tab);
  };

  // Safe UTF-8 Base64 Encoding and Decoding Helpers
  const encodeBase64 = (str) => {
    try {
      return btoa(unescape(encodeURIComponent(str || "")));
    } catch (e) {
      console.error("Base64 encoding error: ", e);
      return "";
    }
  };

  const decodeBase64 = (str) => {
    try {
      return decodeURIComponent(escape(atob(str || "")));
    } catch (e) {
      console.error("Base64 decoding error: ", e);
      return str || "";
    }
  };

  // Run Code logic
  const runCode = async () => {
    if (currentLanguage === "html") {
      renderWebLabPreview();
      return;
    }

    if (isExecuting) return;

    const codeToCompile = editorRef.current ? editorRef.current.getValue() : code;
    if (!codeToCompile.trim()) {
      showToast("Please enter some code first!", "error");
      return;
    }

    if (user && !user.isGuest) {
      saveCodeToFirestore(currentLanguage, { code: codeToCompile });
    }

    setIsExecuting(true);
    setConsoleOutput('Running compilation processes...\n');
    setStatusBadge({
      text: 'Compiling...',
      className: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
    });
    setTimeIndicator('-');
    setMemoryIndicator('-');

    try {
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };

      if (apiEndpoint.includes("rapidapi.com")) {
        headers["X-RapidAPI-Host"] = apiEndpoint.replace("https://", "").split("/")[0];
        headers["X-RapidAPI-Key"] = apiKey;
      }

      const response = await fetch(`${apiEndpoint}/submissions?base64_encoded=true&wait=false`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          source_code: encodeBase64(codeToCompile),
          language_id: LANGUAGES[currentLanguage].id,
          stdin: encodeBase64(stdin),
          redirect_stderr_to_stdout: true
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to connect. HTTP Status: ${response.status}`);
      }

      const { token } = await response.json();
      pollSubmission(token, headers);

    } catch (error) {
      console.error("Submission error: ", error);
      setConsoleOutput(`[Connection Error]\n${error.message}\n\n💡 Tip: Please check your Internet Connection or Settings Modal config.`);
      setStatusBadge({
        text: 'Error',
        className: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
      });
      setIsExecuting(false);
    }
  };

  const pollSubmission = async (token, headers) => {
    const maxAttempts = 15;
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        setConsoleOutput(`[Timeout Error]\nExecution exceeded standard queue wait times. Please try again.`);
        setStatusBadge({
          text: 'Timeout',
          className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        });
        setIsExecuting(false);
        return;
      }

      try {
        const response = await fetch(`${apiEndpoint}/submissions/${token}?base64_encoded=true`, {
          method: "GET",
          headers: headers
        });

        if (!response.ok) {
          throw new Error(`Polling status error: ${response.status}`);
        }

        const result = await response.json();
        const statusId = result.status?.id;

        if (statusId > 2) {
          clearInterval(pollInterval);
          displayExecutionResult(result);
          setIsExecuting(false);
        }

      } catch (error) {
        clearInterval(pollInterval);
        setConsoleOutput(`[Polling Error]\n${error.message}`);
        setStatusBadge({
          text: 'Error',
          className: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
        });
        setIsExecuting(false);
      }
    }, 1500);
  };

  const displayExecutionResult = (result) => {
    const stdout = result.stdout ? decodeBase64(result.stdout) : "";
    const stderr = result.stderr ? decodeBase64(result.stderr) : "";
    const compileOutput = result.compile_output ? decodeBase64(result.compile_output) : "";
    const status = result.status || {};

    setStatusBadge({
      text: status.description || "Success",
      className: status.id === 3
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    });
    
    setTimeIndicator(result.time ? `${result.time}s` : "0.00s");
    setMemoryIndicator(result.memory ? `${(result.memory / 1024).toFixed(2)} MB` : "0.0 MB");

    if (status.id === 3) {
      if (stdout.trim() === "") {
        setConsoleOutput('[Execution finished. No standard output was printed]');
      } else {
        setConsoleOutput(stdout);
      }
    } else {
      let errorLog = "";
      if (compileOutput) errorLog += compileOutput;
      if (stderr) errorLog += (errorLog ? "\n" : "") + stderr;
      if (stdout) errorLog += (errorLog ? "\n" : "") + stdout;

      if (!errorLog) {
        errorLog = `Execution terminated with Status Code ${status.id} (${status.description}).`;
      }
      setConsoleOutput(`Error: ${status.description}\n\n${errorLog}`);
    }
  };

  const renderWebLabPreview = () => {
    const htmlVal = htmlCode;
    const cssVal = cssCode;
    const jsVal = jsCode;

    if (user && !user.isGuest) {
      saveCodeToFirestore("html", { htmlCode: htmlVal, cssCode: cssVal, jsCode: jsVal });
    }

    // Inject log interceptor code in iframe preview
    const iframeLoggerScript = `
      <script>
        (function() {
          const _log = console.log;
          const _error = console.error;
          const _warn = console.warn;
          
          function sendLog(type, args) {
            window.parent.postMessage({
              source: 'codeverse-preview',
              type: type,
              args: Array.from(args)
            }, '*');
          }
          
          console.log = function() {
            sendLog('info', arguments);
            _log.apply(console, arguments);
          };
          console.error = function() {
            sendLog('error', arguments);
            _error.apply(console, arguments);
          };
          console.warn = function() {
            sendLog('warn', arguments);
            _warn.apply(console, arguments);
          };
          
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({
              source: 'codeverse-preview',
              type: 'error',
              args: [message + ' (Line ' + lineno + ')']
            }, '*');
            return false;
          };
        })();
      </script>
    `;

    const fullDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssVal}</style>
          ${iframeLoggerScript}
        </head>
        <body>
          ${htmlVal}
          <script>${jsVal}</script>
        </body>
      </html>
    `;

    const iframe = previewFrameRef.current;
    if (iframe) {
      const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
      frameDoc.open();
      frameDoc.write(fullDocument);
      frameDoc.close();
    }

    setWebLogs([]);
    showToast("Web Sandbox preview updated", "success");
  };

  // --- Toolbar Handlers ---
  const clearConsole = () => {
    if (currentLanguage === "html") {
      setWebLogs([]);
      showToast("Web console cleared", "info");
      return;
    }

    setConsoleOutput('Console cleared. Ready to compile.\n');
    setStatusBadge({
      text: 'Idle',
      className: 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
    });
    setTimeIndicator('-');
    setMemoryIndicator('-');
    showToast("Console cleared", "info");
  };

  const copyCodeToClipboard = () => {
    const editorVal = editorRef.current ? editorRef.current.getValue() : (currentLanguage === "html" ? (activeWebTab === "html" ? htmlCode : activeWebTab === "css" ? cssCode : jsCode) : code);
    if (!editorVal.trim()) {
      showToast("Editor is empty!", "error");
      return;
    }

    navigator.clipboard.writeText(editorVal).then(() => {
      showToast("Code copied to clipboard", "success");
    }).catch(err => {
      console.error("Clipboard copy error: ", err);
      showToast("Failed to copy code", "error");
    });
  };

  const downloadCodeFile = () => {
    const editorVal = editorRef.current ? editorRef.current.getValue() : (currentLanguage === "html" ? (activeWebTab === "html" ? htmlCode : activeWebTab === "css" ? cssCode : jsCode) : code);
    if (!editorVal.trim()) {
      showToast("Nothing to download!", "error");
      return;
    }

    let fileName = `codeverse_main.${LANGUAGES[currentLanguage].extension}`;
    if (currentLanguage === "html") {
      if (activeWebTab === "html") fileName = "index.html";
      if (activeWebTab === "css") fileName = "style.css";
      if (activeWebTab === "js") fileName = "script.js";
    }

    const blob = new Blob([editorVal], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${fileName}`, "success");
  };

  // Settings
  const openSettingsModal = () => {
    setSettingsUrlInput(apiEndpoint);
    setSettingsKeyInput(apiKey);
    setShowSettings(true);
  };

  const saveSettings = () => {
    const newUrl = settingsUrlInput.trim() || DEFAULT_API_URL;
    const newKey = settingsKeyInput.trim();

    setApiEndpoint(newUrl);
    setApiKey(newKey);

    localStorage.setItem("codeverse_api_url", newUrl);
    localStorage.setItem("codeverse_api_key", newKey);

    setShowSettings(false);
    showToast("Settings updated successfully", "success");
  };

  const handleAIDebug = () => {
    const codeToDebug = currentLanguage === "html" ? (activeWebTab === "html" ? htmlCode : activeWebTab === "css" ? cssCode : jsCode) : code;
    const promptText = `I got a "${statusBadge.text}" error in my ${LANGUAGES[currentLanguage]?.name || currentLanguage} compiler. 

Here is my code:
\`\`\`${currentLanguage}
${codeToDebug}
\`\`\`

Here is the terminal error message:
\`\`\`
${consoleOutput}
\`\`\`

Explain why this error occurred and how to fix it.`;
    
    setAiPromptContext(promptText);
    setShowAIPanel(true);
  };

  return (
    <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 animate-fade-in-up">
      {/* Background Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-600/5 blur-[120px] z-0 pointer-events-none"></div>

      {/* ==================== COMPILER CONTROLS PANEL ==================== */}
      <div className="glass-panel p-4 rounded-2xl border border-[var(--border-color)] flex flex-wrap items-center gap-2.5 sm:gap-3 transition-all duration-300 relative z-10">
        {/* Selection of Language with Dynamic Icon badge */}
        <label htmlFor="language-select" className="text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap">Language:</label>
        <div className="relative">
          <select
            id="language-select"
            value={currentLanguage}
            onChange={handleLanguageChange}
            className="appearance-none pl-3 pr-10 py-2 rounded-xl text-sm font-medium bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 max-w-[180px] sm:max-w-none"
          >
            <option value="html">HTML/CSS/JS (Web Lab)</option>
            {Object.keys(LANGUAGES)
              .filter(lang => lang !== 'html')
              .map((langKey) => (
                <option key={langKey} value={langKey}>
                  {LANGUAGES[langKey].name}
                </option>
              ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--text-secondary)]">
            <i className="fas fa-chevron-down text-[10px]"></i>
          </div>
        </div>
        <span
          id="lang-badge"
          className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap flex-shrink-0 ${LANGUAGES[currentLanguage]?.badgeClass}`}
        >
          {LANGUAGES[currentLanguage]?.name}
        </span>

        {/* Clear Button */}
        <button
          onClick={currentLanguage === "text" ? () => handleUpdateNote('content', '') : clearConsole}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200 lg:ml-auto"
        >
          <i className="fas fa-eraser"></i>
          <span>{currentLanguage === "text" ? "Clear Note" : "Clear"}</span>
        </button>

        {/* Copy Button */}
        <button
          onClick={currentLanguage === "text" ? handleCopyNote : copyCodeToClipboard}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
        >
          <i className="fas fa-copy"></i>
          <span>{currentLanguage === "text" ? "Copy Note" : "Copy"}</span>
        </button>

        {/* Download Button */}
        <button
          onClick={currentLanguage === "text" ? handleDownloadNote : downloadCodeFile}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
        >
          <i className="fas fa-download"></i>
          <span>{currentLanguage === "text" ? "Download Note" : "Download"}</span>
        </button>

        {currentLanguage !== "text" && (
          <>
            {/* Settings Modal Button */}
            <button
              onClick={openSettingsModal}
              className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
              title="API Credentials Configuration"
            >
              <i className="fas fa-sliders text-sm"></i>
            </button>

            {/* AI Code Assistant Toggle Button */}
            <button
              onClick={() => setShowAIPanel(prev => !prev)}
              className={`p-2 rounded-lg border text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                showAIPanel
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/10'
                  : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-emerald-400 hover:border-emerald-500/30 bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)]'
              }`}
              title="AI Code Assistant"
            >
              <i className="fas fa-brain text-sm text-emerald-400 animate-pulse"></i>
            </button>

            {/* Execute / Run Code Trigger Button */}
            <button
              onClick={runCode}
              disabled={isExecuting}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all duration-200 btn-premium-glow ${isExecuting ? 'opacity-75' : ''}`}
            >
              {isExecuting ? (
                <>
                  <div className="spinner"></div>
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-play text-xs"></i>
                  <span>Run Code</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
      <div className="flex flex-col lg:flex-row items-stretch flex-grow gap-6 w-full relative z-10 min-h-[500px]">
        <div className="flex-grow flex flex-col min-w-0">
          {currentLanguage === "text" ? (
            <div className="flex-grow flex flex-col md:flex-row border border-[var(--border-color)] rounded-2xl glass-panel overflow-hidden shadow-xl transition-all duration-300 ide-neon-border h-full">
          {/* Notes Sidebar */}
          <div className="w-full md:w-80 border-r border-[var(--border-color)] bg-[var(--bg-tertiary)]/20 flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/30">
              <div className="flex items-center gap-2">
                <i className="fas fa-file-alt text-indigo-400"></i>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Notes</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  {notes.length}
                </span>
                {!user && (
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 uppercase tracking-wider" title="Login to save notes to cloud">
                    Guest Mode
                  </span>
                )}
              </div>
              <button
                onClick={handleCreateNote}
                className="w-6 h-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white flex items-center justify-center transition-all duration-200"
                title="Create a new note"
              >
                <i className="fas fa-plus text-xs"></i>
              </button>
            </div>
            {/* Search Bar */}
            <div className="p-3 border-b border-[var(--border-color)]/50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={noteSearchQuery}
                  onChange={(e) => setNoteSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
                />
                <i className="fas fa-search absolute left-3 top-2.5 text-[var(--text-muted)] text-[10px]"></i>
              </div>
            </div>
            {/* Notes List */}
            <div className="flex-grow overflow-y-auto divide-y divide-[var(--border-color)]/20 scrollbar-thin max-h-[450px]">
              {notes.filter(n => n.title.toLowerCase().includes(noteSearchQuery.toLowerCase())).length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--text-muted)] italic">
                  No notes found
                </div>
              ) : (
                notes
                  .filter(n => n.title.toLowerCase().includes(noteSearchQuery.toLowerCase()))
                  .map(n => {
                    const isActive = n.id === activeNoteId;
                    const cleanExcerpt = n.content ? n.content.substring(0, 45).replace(/\n/g, ' ') + (n.content.length > 45 ? '...' : '') : 'No content';
                    return (
                      <div
                        key={n.id}
                        onClick={() => setActiveNoteId(n.id)}
                        className={`p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none transition-all duration-200 relative group ${
                          isActive
                            ? 'bg-indigo-600/10 border-l-2 border-indigo-500'
                            : 'hover:bg-[var(--bg-tertiary)]/30'
                        }`}
                      >
                        <div className="flex-grow min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isActive ? 'text-indigo-400' : 'text-white'}`}>
                            {n.title || 'Untitled Note'}
                          </h4>
                          <p className="text-[10px] text-[var(--text-muted)] truncate mt-1">
                            {cleanExcerpt}
                          </p>
                          <span className="text-[8px] text-[var(--text-muted)] mt-2 block font-mono">
                            {new Date(n.updatedAt).toLocaleDateString()} {new Date(n.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteNote(n.id, e)}
                          className="text-[var(--text-muted)] hover:text-rose-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 p-1"
                          title="Delete Note"
                        >
                          <i className="fas fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Active Note Area */}
          <div className="flex-grow flex flex-col bg-[#1e1e2e]/10 font-sans">
            {activeNote ? (
              <>
                <div className="h-11 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/20 flex items-center justify-between px-6">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Saved locally</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyNote}
                      className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-[var(--text-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/40 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                      title="Copy content"
                    >
                      <i className="fas fa-copy text-xs"></i>
                    </button>
                    <button
                      onClick={handleDownloadNote}
                      className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-[var(--text-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/40 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                      title="Download as txt"
                    >
                      <i className="fas fa-download text-xs"></i>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateNote('title', e.target.value)}
                  placeholder="Note Title"
                  className="w-full px-6 py-4 bg-transparent border-b border-[var(--border-color)] text-white text-base font-bold focus:outline-none focus:ring-0 placeholder:text-slate-500 font-sans"
                />

                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateNote('content', e.target.value)}
                  placeholder="Start typing your thoughts here..."
                  className="w-full flex-grow px-6 py-4 bg-transparent border-none text-slate-300 font-sans text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 placeholder:text-slate-600 min-h-[300px]"
                />

                <div className="h-9 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/10 flex items-center justify-between px-6 text-[9px] font-mono text-[var(--text-muted)] select-none">
                  <div>
                    Last updated: {new Date(activeNote.updatedAt).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Words: {activeNote.content.trim().split(/\s+/).filter(Boolean).length}</span>
                    <span>Chars: {activeNote.content.length}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <i className="far fa-sticky-note text-4xl text-[var(--border-color)] mb-4 animate-bounce"></i>
                <h3 className="text-sm font-bold text-white mb-2">No active note selected</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mb-4">
                  Create a new note using the plus icon or sidebar controls to begin writing.
                </p>
                <button
                  onClick={handleCreateNote}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all duration-200"
                >
                  Create New Note
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-grow relative z-10">
        {/* Monaco Code Editor Area (Occupies 2 columns on large displays) */}
        <div className="lg:col-span-2 flex flex-col border border-[var(--border-color)] rounded-2xl glass-panel overflow-hidden shadow-xl transition-all duration-300 ide-neon-border">
          {/* Tab Bar Header */}
          <div className="h-11 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              {currentLanguage !== "html" ? (
                <div id="editor-title-container" className="flex items-center gap-2">
                  <i className="fas fa-code text-indigo-400 text-xs"></i>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Source Code Editor</span>
                </div>
              ) : (
                <div id="web-editor-tabs" className="flex items-center gap-1 bg-[var(--bg-primary)] p-0.5 rounded-lg border border-[var(--border-color)]">
                  <button
                    onClick={() => switchWebTab("html")}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all duration-200 ${
                      activeWebTab === "html" ? "bg-indigo-600 text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    index.html
                  </button>
                  <button
                    onClick={() => switchWebTab("css")}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all duration-200 ${
                      activeWebTab === "css" ? "bg-indigo-600 text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    style.css
                  </button>
                  <button
                    onClick={() => switchWebTab("js")}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all duration-200 ${
                      activeWebTab === "js" ? "bg-indigo-600 text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    script.js
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
            </div>
          </div>

          {/* Monaco Editor Wrapper */}
          <div className="flex-grow min-h-[450px] relative">
            <div className="absolute inset-0 w-full h-full">
              <Editor
                language={
                  currentLanguage === "html"
                    ? (activeWebTab === "js" ? "javascript" : activeWebTab)
                    : LANGUAGES[currentLanguage]?.monacoId || "text"
                }
                value={
                  currentLanguage === "html"
                    ? (activeWebTab === "html" ? htmlCode : activeWebTab === "css" ? cssCode : jsCode)
                    : code
                }
                onChange={(val) => {
                  if (currentLanguage === "html") {
                    if (activeWebTab === "html") {
                      setHtmlCode(val || "");
                      localStorage.setItem("codeverse_code_html", val || "");
                    } else if (activeWebTab === "css") {
                      setCssCode(val || "");
                      localStorage.setItem("codeverse_web_css", val || "");
                    } else {
                      setJsCode(val || "");
                      localStorage.setItem("codeverse_web_js", val || "");
                    }
                  } else {
                    setCode(val || "");
                    localStorage.setItem(`codeverse_code_${currentLanguage}`, val || "");
                  }
                }}
                onMount={handleEditorDidMount}
                loading={
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-xs">
                    <div className="spinner mr-2"></div> Loading Monaco IDE Workspace...
                  </div>
                }
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
          <div className="h-8 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/20 flex items-center justify-between px-4 text-[10px] text-[var(--text-muted)] font-mono">
            <div>Status: Ready to edit</div>
            <div>Shortcut: Ctrl + Enter to run</div>
          </div>
        </div>

        {/* Input Stdin / Console Output Panel (Occupies 1 column) */}
        <div className="flex flex-col gap-6">
          {currentLanguage !== "html" ? (
            <>
              {/* Standard Input (Stdin) Area */}
              <div id="stdin-container" className="flex flex-col border border-[var(--border-color)] rounded-2xl glass-panel overflow-hidden shadow-lg transition-all duration-300 ide-neon-border">
                <div className="h-11 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-keyboard text-cyan-400 text-xs"></i>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Standard Input (Stdin)</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">Optional</span>
                </div>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  className="w-full h-24 p-3 bg-[var(--console-bg)] text-[var(--text-primary)] border-none resize-none focus:outline-none focus:ring-0 font-mono text-xs placeholder:text-[var(--text-muted)] placeholder:italic"
                  placeholder="If your code requires inputs (e.g. scanf, cin, input()), enter them here before clicking 'Run Code' (one input per line)..."
                />
              </div>

              {/* Output Terminal Panel */}
              <div className="flex-grow flex flex-col border border-[var(--border-color)] rounded-2xl glass-panel overflow-hidden shadow-xl transition-all duration-300 ide-neon-border">
                <div className="h-auto py-2 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 flex flex-col gap-2 px-4 justify-center">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <i id="console-header-icon" className="fas fa-terminal text-emerald-400 text-xs"></i>
                      <span id="console-header-title" className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] whitespace-nowrap">Output Console</span>
                    </div>
                    {statusBadge.text !== 'Idle' && statusBadge.text !== 'Compiling...' && statusBadge.text !== 'Accepted' ? (
                      <button
                        onClick={handleAIDebug}
                        className={`rounded font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 shadow-md shadow-rose-600/10 flex items-center gap-1 transition-all duration-200 cursor-pointer animate-pulse whitespace-nowrap flex-shrink-0 ${
                          showAIPanel 
                            ? 'px-2.5 py-0.5 text-[9px]' 
                            : 'px-4 py-1.5 text-[11px]'
                        }`}
                      >
                        <i className={`fas fa-bug ${showAIPanel ? 'text-[8px]' : 'text-[10px]'}`}></i>
                        <span>Debug with AI</span>
                      </button>
                    ) : (
                      <span id="status-badge" className={`px-2 py-0.5 rounded text-[10px] font-extrabold whitespace-nowrap flex-shrink-0 uppercase tracking-wider ${statusBadge.className}`}>
                        {statusBadge.text}
                      </span>
                    )}
                  </div>
                  {statusBadge.text !== 'Idle' && statusBadge.text !== 'Compiling...' && statusBadge.text !== 'Accepted' && (
                    <div className="flex justify-center w-full">
                      <span id="status-badge" className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold whitespace-nowrap flex-shrink-0 uppercase tracking-wider ${statusBadge.className}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Console Output box */}
                <div id="console-output-container" className="flex-grow p-4 bg-[var(--console-bg)] overflow-y-auto min-h-[220px] max-h-[350px] relative">
                  <pre id="output-console" className="text-slate-300 font-mono text-xs whitespace-pre-wrap select-text leading-relaxed">
                    {consoleOutput}
                    <span className="terminal-cursor"></span>
                  </pre>
                </div>

                {/* Execution metadata footer metrics */}
                <div className="h-10 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/20 grid grid-cols-2 divide-x divide-[var(--border-color)] text-[10px] font-mono text-[var(--text-muted)]">
                  <div className="flex items-center justify-center gap-1">
                    <i className="fas fa-clock text-indigo-400/70"></i>
                    <span>Time: </span>
                    <span id="time-indicator" className="font-bold text-[var(--text-secondary)]">{timeIndicator}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <i className="fas fa-memory text-cyan-400/70"></i>
                    <span>Memory: </span>
                    <span id="memory-indicator" className="font-bold text-[var(--text-secondary)]">{memoryIndicator}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Live Preview Container for HTML/CSS/JS Web Lab
            <div className="flex-grow flex flex-col border border-[var(--border-color)] rounded-2xl glass-panel overflow-hidden shadow-xl transition-all duration-300 ide-neon-border">
              {/* Preview Header */}
              <div className="h-11 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <i className="fas fa-eye text-indigo-400 text-xs"></i>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Live Preview</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Web Sandbox
                </span>
              </div>

              {/* Web Sandbox Iframe */}
              <div id="preview-container" className="flex-grow flex flex-col min-h-[300px] bg-white relative">
                <iframe
                  ref={previewFrameRef}
                  id="preview-frame"
                  className="flex-grow w-full border-none bg-white min-h-[220px]"
                  sandbox="allow-scripts allow-modals allow-same-origin"
                  title="Web Lab Preview Frame"
                ></iframe>
                
                {/* Web Dev Console Logs Panel */}
                <div id="web-console" className="h-44 border-t border-[var(--border-color)] bg-[var(--console-bg)] flex flex-col overflow-hidden">
                  <div className="h-7 border-b border-[var(--border-color)] px-3 bg-[var(--bg-tertiary)]/20 flex items-center justify-between text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <i className="fas fa-bug text-rose-500/80"></i>
                      <span>Console Logs</span>
                    </div>
                    <button
                      onClick={() => setWebLogs([])}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200"
                      title="Clear Console"
                    >
                      <i className="fas fa-trash-can"></i>
                    </button>
                  </div>
                  <div id="web-console-logs" className="flex-grow p-2 overflow-y-auto font-mono text-[10px] space-y-1.5 select-text scrollbar-thin">
                    {webLogs.length === 0 ? (
                      <div className="text-[var(--text-muted)] italic text-[10px] font-mono">
                        No console logs yet. Press Run Code to execute and load preview.
                      </div>
                    ) : (
                      webLogs.map((log, index) => {
                        let headerIcon = "fa-info-circle text-indigo-400";
                        if (log.type === "error") headerIcon = "fa-exclamation-triangle text-rose-400";
                        if (log.type === "warn") headerIcon = "fa-exclamation-circle text-amber-400";

                        const formattedArgs = log.args.map(arg => {
                          if (typeof arg === "object") {
                            try {
                              return JSON.stringify(arg);
                            } catch(e) {
                              return String(arg);
                            }
                          }
                          return String(arg);
                        }).join(" ");

                        return (
                          <div key={index} className={`console-log-item console-log-${log.type} font-mono text-[11px] pb-1 border-b border-slate-800/40 last:border-b-0`}>
                            <div className="flex items-center gap-1.5 opacity-60">
                              <i className={`fas ${headerIcon} text-[9px]`}></i>
                              <span className="text-[8px] font-bold font-mono uppercase">{log.type}</span>
                            </div>
                            <div className="console-log-body pl-3.5 text-slate-300 font-mono text-xs whitespace-pre-wrap">{formattedArgs}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
          )}
        </div>

        {showAIPanel && (
          <div className="w-full lg:w-[380px] h-[500px] lg:h-auto relative flex-shrink-0 min-w-0">
            <div className="lg:absolute lg:inset-0 flex flex-col h-full">
              <AIPanel
                onClose={() => setShowAIPanel(false)}
                activeCode={currentLanguage === "html" ? (activeWebTab === "html" ? htmlCode : activeWebTab === "css" ? cssCode : jsCode) : code}
                activeLanguage={LANGUAGES[currentLanguage]?.name || currentLanguage}
                initialContextPrompt={aiPromptContext}
                clearInitialContextPrompt={() => setAiPromptContext("")}
              />
            </div>
          </div>
        )}
      </div>

      {/* ==================== SETTINGS MODAL ==================== */}
      {showSettings && (
        <div className="modal-overlay fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 transition-all duration-300">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-2xl animate-fade-in-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-sliders text-indigo-400"></i>
                <h3 className="font-bold text-[var(--text-primary)]">Compiler Settings</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label htmlFor="api-url-input" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Judge0 API Base URL
                </label>
                <input
                  type="text"
                  id="api-url-input"
                  value={settingsUrlInput}
                  onChange={(e) => setSettingsUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono transition-all duration-200"
                  placeholder="https://ce.judge0.com"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  By default we use the Judge0 Community Edition testing instance. You can replace this with your self-hosted Docker URL or RapidAPI proxy.
                </p>
              </div>

              <div>
                <label htmlFor="api-key-input" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  RapidAPI Host Key (x-rapidapi-key)
                </label>
                <input
                  type="password"
                  id="api-key-input"
                  value={settingsKeyInput}
                  onChange={(e) => setSettingsKeyInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono transition-all duration-200"
                  placeholder="••••••••••••••••••••••••••••••••"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Only required if pointing to RapidAPI endpoint (e.g. <code>https://judge0-ce.p.rapidapi.com</code>). Leave empty for self-hosted instances.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/20 flex justify-end gap-3">
              <button
                onClick={saveSettings}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10 active:scale-95 transition-all duration-200"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
