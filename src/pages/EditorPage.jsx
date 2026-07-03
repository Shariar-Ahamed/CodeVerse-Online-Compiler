import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ace from 'ace-builds';
ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.37.0/src-noconflict/');
import { LANGUAGES, DEFAULT_WEB_CSS, DEFAULT_WEB_JS } from '../utils/languages';
import { doc, collection, setDoc, deleteDoc, getDocs, onSnapshot, increment } from 'firebase/firestore';
import { db } from '../firebase';
import AIPanel from '../components/AIPanel';
const draculaTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'f8f8f2' },
    { token: 'invalid', foreground: 'ff5555' },
    { token: 'emphasis', fontStyle: 'italic' },
    { token: 'strong', fontStyle: 'bold' },
    
    // Comments
    { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
    { token: 'comment.doc', foreground: '6272a4', fontStyle: 'italic' },
    
    // Keywords and Storage
    { token: 'keyword', foreground: 'ff79c6' },
    { token: 'keyword.control', foreground: 'ff79c6' },
    { token: 'keyword.operator', foreground: 'ff79c6' },
    { token: 'keyword.directive', foreground: 'ff79c6' },
    { token: 'keyword.other', foreground: 'ff79c6' },
    { token: 'storage', foreground: 'ff79c6' },
    { token: 'storage.type', foreground: '8be9fd', fontStyle: 'italic' },
    
    // Preprocessors (C/C++ directives like #include)
    { token: 'meta.preprocessor', foreground: 'ff79c6' },
    { token: 'meta.preprocessor.string', foreground: 'f1fa8c' },
    { token: 'meta.preprocessor.numeric', foreground: 'bd93f9' },
    
    // Numbers
    { token: 'number', foreground: 'bd93f9' },
    { token: 'number.hex', foreground: 'bd93f9' },
    { token: 'number.octal', foreground: 'bd93f9' },
    { token: 'number.binary', foreground: 'bd93f9' },
    { token: 'number.float', foreground: 'bd93f9' },
    { token: 'constant.numeric', foreground: 'bd93f9' },
    
    { token: 'regexp', foreground: 'ffb86c' },
    
    // Types, Classes, Functions
    { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
    { token: 'type.identifier', foreground: '8be9fd', fontStyle: 'italic' },
    { token: 'class', foreground: '50fa7b' },
    { token: 'class.identifier', foreground: '50fa7b' },
    { token: 'function', foreground: '50fa7b' },
    { token: 'function.identifier', foreground: '50fa7b' },
    { token: 'member', foreground: '50fa7b' },
    
    // Strings
    { token: 'string', foreground: 'f1fa8c' },
    { token: 'string.escape', foreground: 'ff79c6' },
    
    // Identifiers and Variables
    { token: 'identifier', foreground: 'f8f8f2' },
    { token: 'variable', foreground: 'f8f8f2' },
    { token: 'variable.predefined', foreground: '8be9fd' },
    { token: 'variable.parameter', foreground: 'ffb86c', fontStyle: 'italic' },
    { token: 'constant', foreground: 'bd93f9' },
    { token: 'constant.language', foreground: 'bd93f9' },
    
    // Tags and Markup
    { token: 'tag', foreground: 'ff79c6' },
    { token: 'tag.id', foreground: '8be9fd' },
    { token: 'tag.class', foreground: '50fa7b' },
    { token: 'tag.html', foreground: 'ff79c6' },
    { token: 'tag.xml', foreground: 'ff79c6' },
    
    // Attributes
    { token: 'attribute.name', foreground: '50fa7b' },
    { token: 'attribute.name.html', foreground: '50fa7b' },
    { token: 'attribute.name.xml', foreground: '50fa7b' },
    { token: 'attribute.name.css', foreground: '50fa7b' },
    { token: 'attribute.value', foreground: 'f1fa8c' },
    { token: 'attribute.value.html', foreground: 'f1fa8c' },
    { token: 'attribute.value.xml', foreground: 'f1fa8c' },
    { token: 'attribute.value.number', foreground: 'bd93f9' },
    { token: 'attribute.value.unit', foreground: 'bd93f9' },
    { token: 'string.html', foreground: 'f1fa8c' },
    { token: 'string.xml', foreground: 'f1fa8c' },
    { token: 'string.yaml', foreground: 'f1fa8c' },
    
    // CSS specific rules
    { token: 'tag.css', foreground: 'ff79c6' },
    { token: 'keyword.css', foreground: 'ff79c6' },
    { token: 'string.css', foreground: 'f1fa8c' },
    { token: 'number.css', foreground: 'bd93f9' },
    { token: 'tag.class.css', foreground: '50fa7b' },
    { token: 'tag.id.css', foreground: '8be9fd' },
    { token: 'attribute.value.css', foreground: 'f1fa8c' },
    
    // JSON and Yaml
    { token: 'keyword.json', foreground: 'ff79c6' },
    { token: 'string.key.json', foreground: 'ff79c6' },
    { token: 'string.value.json', foreground: 'f1fa8c' },
    
    // Delimiters, Operators, Annotations
    { token: 'delimiter', foreground: 'f8f8f2' },
    { token: 'delimiter.html', foreground: 'f8f8f2' },
    { token: 'delimiter.xml', foreground: 'f8f8f2' },
    { token: 'operator', foreground: 'ff79c6' },
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
};

const DEFAULT_API_URL = "https://ce.judge0.com";

// Map project language keys/extensions to Ace Editor mode names
const getAceMode = (langKey, filename, activeWebTab) => {
  let targetExt = "";
  if (filename) {
    targetExt = filename.split('.').pop().toLowerCase();
  }

  if (langKey === "html" || targetExt === "html" || targetExt === "htm") {
    if (activeWebTab === "js") return "javascript";
    if (activeWebTab === "css") return "css";
    return "html";
  }

  const mapping = {
    'text': 'text',
    'c': 'c_cpp',
    'cpp': 'c_cpp',
    'python': 'python',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'java': 'java',
    'csharp': 'csharp',
    'go': 'golang',
    'rust': 'rust',
    'php': 'php',
    'ruby': 'ruby',
    'bash': 'sh',
    'sql': 'sql',
    'json': 'json',
    'markdown': 'markdown',
    'css': 'css',
    'html': 'html'
  };

  return mapping[langKey] || mapping[targetExt] || "text";
};

// Map settingsColorTheme names to Ace Editor theme names
const getAceTheme = (themeName) => {
  const lightThemes = ['Light (Default)', 'One Light', 'GitHub Light', 'Solarized Light', 'Night Owl Light', 'Catppuccin Latte', 'Min Light', 'Vitesse Light', 'High Contrast Light'];
  if (lightThemes.includes(themeName)) {
    return "chrome";
  }
  if (themeName === "Dracula") {
    return "dracula";
  }
  if (themeName === "Monokai") {
    return "monokai";
  }
  return "tomorrow_night_eighties";
};

// Opaque Vanilla Ace Editor React wrapper compatible with React 19 concurrent mode
const VanillaAceEditor = ({ mode, theme, value, onChange, fontSize, wordWrap, disableAutocomplete, style }) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const isSettingValueRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Ace Editor instance directly on the container reference
    const editor = ace.edit(containerRef.current);
    editorRef.current = editor;

    // Configure startup options
    editor.setOptions({
      enableBasicAutocompletion: !disableAutocomplete,
      enableLiveAutocompletion: !disableAutocomplete,
      showLineNumbers: true,
      tabSize: 4,
      useWorker: false, // Disables background worker scripts to prevent Vite resolving issues
      fontFamily: "Fira Code, JetBrains Mono, monospace"
    });

    // Populate initial text
    editor.setValue(value || "", -1);

    // Bind change listener and propagate state updates
    editor.on('change', () => {
      if (isSettingValueRef.current) return;
      const currentVal = editor.getValue();
      if (onChange) {
        onChange(currentVal);
      }
    });

    return () => {
      editor.destroy();
    };
  }, []);

  // Update editor values safely if modified externally
  useEffect(() => {
    if (editorRef.current) {
      const currentVal = editorRef.current.getValue();
      if (currentVal !== value) {
        isSettingValueRef.current = true;
        editorRef.current.setValue(value || "", -1);
        isSettingValueRef.current = false;
      }
    }
  }, [value]);

  // Synchronize options dynamically
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setOption("fontSize", fontSize);
    }
  }, [fontSize]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setOption("wrap", wordWrap);
    }
  }, [wordWrap]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.session.setMode("ace/mode/" + mode);
    }
  }, [mode]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setTheme("ace/theme/" + theme);
    }
  }, [theme]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', ...style }} />;
};

export default function EditorPage({ user, onLogout, theme, toggleTheme, showToast }) {
  // --- States ---
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const queryLang = searchParams.get('lang');
  
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem("codeverse_lang");
    return (saved && LANGUAGES[saved]) ? saved : "c";
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
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState("");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPromptContext, setAiPromptContext] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState(() => localStorage.getItem("codeverse_api_url") || DEFAULT_API_URL);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("codeverse_api_key") || "");
  
  // --- Sidebar & Editor Settings States ---
  const [activeSidebarTab, setActiveSidebarTab] = useState(null);
  const [drafts, setDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem("codeverse_drafts");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const autoRunTimerRef = useRef(null);
  const webPreviewSessionRef = useRef(0);
  const [isAutoRunEnabled, setIsAutoRunEnabled] = useState(() => {
    const saved = localStorage.getItem("codeverse_autorun_web");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("codeverse_autorun_web", isAutoRunEnabled);
  }, [isAutoRunEnabled]);

  const [isWebConsoleOpen, setIsWebConsoleOpen] = useState(false);

  const [showEditorSettings, setShowEditorSettings] = useState(false);
  const [settingsFontSize, setSettingsFontSize] = useState(() => {
    const val = localStorage.getItem("codeverse_settings_font_size");
    return val ? parseInt(val, 10) : 14;
  });
  const [settingsWordWrap, setSettingsWordWrap] = useState(() => {
    return localStorage.getItem("codeverse_settings_word_wrap") === "true";
  });
  const [settingsDisableAutocomplete, setSettingsDisableAutocomplete] = useState(() => {
    return localStorage.getItem("codeverse_settings_disable_autocomplete") === "true";
  });
  const [settingsColorTheme, setSettingsColorTheme] = useState(() => {
    return localStorage.getItem("codeverse_settings_color_theme") || "Dracula";
  });
  const [settingsPreserveErrorLog, setSettingsPreserveErrorLog] = useState(() => {
    return localStorage.getItem("codeverse_settings_preserve_error_log") === "true";
  });
  const [settingsAvoidAutoScrolling, setSettingsAvoidAutoScrolling] = useState(() => {
    return localStorage.getItem("codeverse_settings_avoid_auto_scrolling") === "true";
  });
  const [settingsEditorEngine, setSettingsEditorEngine] = useState(() => {
    const saved = localStorage.getItem("codeverse_settings_editor_engine");
    if (saved) return saved;
    // Default dynamically based on device size: Ace for mobile, Monaco for PC
    return window.innerWidth < 1024 ? "Ace" : "Monaco";
  });
  
  // Panel resizing states
  const [drawerWidth, setDrawerWidth] = useState(() => {
    const val = localStorage.getItem("codeverse_settings_drawer_width");
    return val ? parseInt(val, 10) : 160;
  });
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const val = localStorage.getItem("codeverse_settings_left_panel_width");
    return val ? parseFloat(val) : 65;
  });
  
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Explorer Workspace Files & Creation States
  const [workspaceFiles, setWorkspaceFiles] = useState([]);
  const [activeFileName, setActiveFileName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // Sync workspace files when language changes
  useEffect(() => {
    let savedFiles = localStorage.getItem(`codeverse_files_${currentLanguage}`);
    let parsed = null;
    if (savedFiles) {
      try {
        parsed = JSON.parse(savedFiles);
      } catch (e) {
        console.error(e);
      }
    }

    // Auto-repair logic for old/stuck workspaces in localStorage
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      let needsRepair = false;
      const repaired = parsed.map(file => {
        // If it's a default single file named main.txt but the active language is NOT text/html
        if (
          currentLanguage !== "text" && 
          currentLanguage !== "html" && 
          file.name === "main.txt" && 
          (file.language === "text" || !file.language)
        ) {
          needsRepair = true;
          const ext = LANGUAGES[currentLanguage]?.extension || 'txt';
          return {
            ...file,
            name: `main.${ext}`,
            language: currentLanguage
          };
        }
        
        // General repair: if file language doesn't match extension resolution
        const detected = detectLanguageByExtension(file.name);
        if (file.language !== detected) {
          needsRepair = true;
          return {
            ...file,
            language: detected
          };
        }
        
        return file;
      });

      if (needsRepair) {
        setWorkspaceFiles(repaired);
        setActiveFileName(repaired[0].name);
        localStorage.setItem(`codeverse_files_${currentLanguage}`, JSON.stringify(repaired));
        return;
      }

      setWorkspaceFiles(parsed);
      setActiveFileName(parsed[0].name);
      return;
    }
    
    let defaultFiles = [];
    if (currentLanguage === "html") {
      defaultFiles = [
        { name: "index.html", content: localStorage.getItem("codeverse_code_html") || LANGUAGES.html.defaultCode, language: "html" },
        { name: "style.css", content: localStorage.getItem("codeverse_web_css") || DEFAULT_WEB_CSS, language: "css" },
        { name: "script.js", content: localStorage.getItem("codeverse_web_js") || DEFAULT_WEB_JS, language: "javascript" }
      ];
    } else {
      const ext = LANGUAGES[currentLanguage]?.extension || 'txt';
      const defaultName = `main.${ext}`;
      const savedCode = localStorage.getItem(`codeverse_code_${currentLanguage}`) || LANGUAGES[currentLanguage]?.defaultCode || "";
      defaultFiles = [
        { name: defaultName, content: savedCode, language: currentLanguage }
      ];
    }
    setWorkspaceFiles(defaultFiles);
    setActiveFileName(defaultFiles[0].name);
  }, [currentLanguage]);

  // Close user profile dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setUserDropdownOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

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
            
            // Sync with workspaceFiles
            setWorkspaceFiles(prev => {
              const files = (prev && prev.length > 0) ? prev : [
                { name: "index.html", content: data.htmlCode || LANGUAGES.html.defaultCode, language: "html" },
                { name: "style.css", content: data.cssCode || DEFAULT_WEB_CSS, language: "css" },
                { name: "script.js", content: data.jsCode || DEFAULT_WEB_JS, language: "javascript" }
              ];
              const updated = files.map(f => {
                if (f.name === "index.html" && data.htmlCode) return { ...f, content: data.htmlCode };
                if (f.name === "style.css" && data.cssCode) return { ...f, content: data.cssCode };
                if (f.name === "script.js" && data.jsCode) return { ...f, content: data.jsCode };
                return f;
              });
              localStorage.setItem("codeverse_files_html", JSON.stringify(updated));
              return updated;
            });
          } else {
            if (data.code) {
              localStorage.setItem(`codeverse_code_${langId}`, data.code);
              if (currentLanguage === langId) {
                setCode(data.code);
              }
              
              // Sync with workspaceFiles
              setWorkspaceFiles(prev => {
                const ext = LANGUAGES[langId]?.extension || 'txt';
                const defaultName = `main.${ext}`;
                const files = (prev && prev.length > 0) ? prev : [
                  { name: defaultName, content: data.code || "", language: langId }
                ];
                const updated = files.map(f => {
                  if (f.name.startsWith("main.") && f.language === langId) {
                    return { ...f, content: data.code };
                  }
                  return f;
                });
                localStorage.setItem(`codeverse_files_${langId}`, JSON.stringify(updated));
                return updated;
              });
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

  // Track latest code state in a ref to fetch on unmount
  const latestCodeRef = useRef({ htmlCode, cssCode, jsCode, code, currentLanguage });
  useEffect(() => {
    latestCodeRef.current = { htmlCode, cssCode, jsCode, code, currentLanguage };
  }, [htmlCode, cssCode, jsCode, code, currentLanguage]);

  // Save latest workspace changes to cloud on unmount
  useEffect(() => {
    return () => {
      const { htmlCode: latestHtml, cssCode: latestCss, jsCode: latestJs, code: latestCode, currentLanguage: latestLang } = latestCodeRef.current;
      if (user && !user.isGuest && latestLang) {
        if (latestLang === "html") {
          saveCodeToFirestore("html", {
            htmlCode: latestHtml,
            cssCode: latestCss,
            jsCode: latestJs
          });
        } else if (latestLang !== "text") {
          saveCodeToFirestore(latestLang, {
            code: latestCode
          });
        }
      }
    };
  }, [user]);

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

  // --- Drafts Operations ---
  const saveDraft = () => {
    const draftId = `draft-${Math.random().toString(36).substring(2, 6)}`;
    let draftCode = "";
    let htmlData = null;
    
    if (currentLanguage === "html") {
      htmlData = {
        htmlCode: htmlCode,
        cssCode: cssCode,
        jsCode: jsCode
      };
    } else if (currentLanguage !== "text") {
      draftCode = editorRef.current ? editorRef.current.getValue() : code;
    } else {
      showToast("Cannot save a text note as a draft. Try downloading as txt instead!", "warning");
      return;
    }

    const newDraft = {
      id: draftId,
      name: draftId,
      language: currentLanguage,
      code: draftCode,
      htmlData: htmlData,
      timestamp: new Date().toISOString()
    };

    const updatedDrafts = [newDraft, ...drafts];
    setDrafts(updatedDrafts);
    localStorage.setItem("codeverse_drafts", JSON.stringify(updatedDrafts));
    showToast(`Draft ${draftId} created successfully!`, "success");
  };

  const loadDraft = (draft) => {
    if (draft.language === "html") {
      setCurrentLanguage("html");
      if (draft.htmlData) {
        setHtmlCode(draft.htmlData.htmlCode || "");
        setCssCode(draft.htmlData.cssCode || "");
        setJsCode(draft.htmlData.jsCode || "");
        
        localStorage.setItem("codeverse_code_html", draft.htmlData.htmlCode || "");
        localStorage.setItem("codeverse_web_css", draft.htmlData.cssCode || "");
        localStorage.setItem("codeverse_web_js", draft.htmlData.jsCode || "");
      }
    } else if (draft.language !== "text") {
      setCurrentLanguage(draft.language);
      setCode(draft.code || "");
      localStorage.setItem(`codeverse_code_${draft.language}`, draft.code || "");
    }
    showToast(`Loaded draft: ${draft.name}`, "info");
  };

  const deleteDraft = (draftId) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem("codeverse_drafts", JSON.stringify(updatedDrafts));
    showToast("Draft deleted", "info");
  };

  // --- Workspace Drag Resize Helpers ---
  const startResizingDrawer = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = drawerWidth;

    const handleMouseMove = (mouseMoveEvent) => {
      if (mouseMoveEvent.buttons === 0) {
        handleMouseUp();
        return;
      }
      const deltaX = mouseMoveEvent.clientX - startX;
      const newWidth = Math.max(140, Math.min(450, startWidth + deltaX));
      setDrawerWidth(newWidth);
      localStorage.setItem("codeverse_settings_drawer_width", newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('select-none', 'cursor-col-resize');
      
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => iframe.style.pointerEvents = 'auto');
    };

    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.style.pointerEvents = 'none');

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.classList.add('select-none', 'cursor-col-resize');
  };

  const startResizingPanels = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidthPercent = leftPanelWidth;
    const container = mouseDownEvent.currentTarget.parentElement;
    const containerWidth = container ? container.clientWidth : window.innerWidth;

    const handleMouseMove = (mouseMoveEvent) => {
      if (mouseMoveEvent.buttons === 0) {
        handleMouseUp();
        return;
      }
      const deltaX = mouseMoveEvent.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newPercent = Math.max(30, Math.min(85, startWidthPercent + deltaPercent));
      setLeftPanelWidth(newPercent);
      localStorage.setItem("codeverse_settings_left_panel_width", newPercent);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('select-none', 'cursor-col-resize');
      
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => iframe.style.pointerEvents = 'auto');
    };

    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.style.pointerEvents = 'none');

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.classList.add('select-none', 'cursor-col-resize');
  };

  // --- Workspace File Helpers ---
  function detectLanguageByExtension(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    // Search in LANGUAGES list for a matching extension
    const foundKey = Object.keys(LANGUAGES).find(key => LANGUAGES[key].extension === ext);
    if (foundKey) {
      return foundKey;
    }
    
    // Fallback cases
    switch(ext) {
      case 'html': case 'htm': return 'html';
      case 'css': return 'css';
      case 'js': case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'cpp': case 'cc': case 'cxx': case 'h': case 'hpp': return 'cpp';
      case 'c': return 'c';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'cs': return 'csharp';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'rb': return 'ruby';
      case 'php': return 'php';
      case 'sh': return 'bash';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'text';
    }
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      setIsCreatingFile(false);
      return;
    }

    const name = newFileName.trim();
    if (workspaceFiles.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      showToast("A file with this name already exists!", "error");
      return;
    }

    const detectedLang = detectLanguageByExtension(name);
    const newFile = {
      name: name,
      content: "",
      language: detectedLang
    };

    const updated = [...workspaceFiles, newFile];
    setWorkspaceFiles(updated);
    localStorage.setItem(`codeverse_files_${currentLanguage}`, JSON.stringify(updated));
    setActiveFileName(name);
    setIsCreatingFile(false);
    setNewFileName("");
    showToast(`Created file: ${name}`, "success");
  };

  const handleDeleteFile = (fileNameToDelete) => {
    const updated = workspaceFiles.filter(f => f.name !== fileNameToDelete);
    setWorkspaceFiles(updated);
    localStorage.setItem(`codeverse_files_${currentLanguage}`, JSON.stringify(updated));
    
    if (activeFileName === fileNameToDelete) {
      setActiveFileName(updated[0].name);
    }
    showToast(`Deleted file: ${fileNameToDelete}`, "info");
  };

  const handleWorkspaceCodeChange = (val) => {
    setWorkspaceFiles(prev => {
      const updated = prev.map(f => {
        if (f.name === activeFileName) {
          return { ...f, content: val || "" };
        }
        return f;
      });
      localStorage.setItem(`codeverse_files_${currentLanguage}`, JSON.stringify(updated));
      return updated;
    });

    if (currentLanguage === "html") {
      if (activeFileName === "index.html") {
        setHtmlCode(val || "");
        localStorage.setItem("codeverse_code_html", val || "");
      } else if (activeFileName === "style.css") {
        setCssCode(val || "");
        localStorage.setItem("codeverse_web_css", val || "");
      } else if (activeFileName === "script.js") {
        setJsCode(val || "");
        localStorage.setItem("codeverse_web_js", val || "");
      }
    } else {
      if (activeFileName.startsWith("main.")) {
        setCode(val || "");
        localStorage.setItem(`codeverse_code_${currentLanguage}`, val || "");
      }
    }
  };

  // Refs
  const editorRef = useRef(null);
  const previewFrameRef = useRef(null);
  const selectedCardRef = useRef(null);

  // Sync settings inputs in state
  const [settingsUrlInput, setSettingsUrlInput] = useState(apiEndpoint);
  const [settingsKeyInput, setSettingsKeyInput] = useState(apiKey);

  // Effect to sync options when global theme changes
  useEffect(() => {
    if (editorRef.current && window.monaco) {
      const targetTheme = theme === 'light' ? 'Light (Default)' : 'Dracula';
      setSettingsColorTheme(targetTheme);
      localStorage.setItem("codeverse_settings_color_theme", targetTheme);
      
      const lightThemes = ['Light (Default)', 'One Light', 'GitHub Light', 'Solarized Light', 'Night Owl Light', 'Catppuccin Latte', 'Min Light', 'Vitesse Light', 'High Contrast Light'];
      let baseTheme = 'vs-dark';
      if (lightThemes.includes(targetTheme)) {
        baseTheme = 'vs';
      }
      if (targetTheme === 'Dracula') {
        window.monaco.editor.setTheme('dracula');
      } else {
        window.monaco.editor.setTheme(baseTheme);
      }
    }
  }, [theme]);

  // Effect to apply Monaco theme when settingsColorTheme changes
  useEffect(() => {
    if (editorRef.current && window.monaco) {
      const lightThemes = ['Light (Default)', 'One Light', 'GitHub Light', 'Solarized Light', 'Night Owl Light', 'Catppuccin Latte', 'Min Light', 'Vitesse Light', 'High Contrast Light'];
      let baseTheme = 'vs-dark';
      if (lightThemes.includes(settingsColorTheme)) {
        baseTheme = 'vs';
      }
      if (settingsColorTheme === 'Dracula') {
        window.monaco.editor.setTheme('dracula');
      } else {
        window.monaco.editor.setTheme(baseTheme);
      }
    }
  }, [settingsColorTheme]);

  // Listen to messages from Web Lab Preview Iframe
  useEffect(() => {
    const handleIframeMessage = (e) => {
      if (e.data && e.data.source === "codeverse-preview") {
        if (e.data.sessionId === webPreviewSessionRef.current) {
          setWebLogs((prev) => [...prev, { type: e.data.type, args: e.data.args }]);
        }
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

  // Scroll to active selected language card inside selection modal
  useEffect(() => {
    if (showLanguageModal) {
      setTimeout(() => {
        if (selectedCardRef.current) {
          selectedCardRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }, 120);
    }
  }, [showLanguageModal]);

  // Define Dracula theme before the editor mounts to prevent initial render fallback
  const handleEditorBeforeMount = (monaco) => {
    monaco.editor.defineTheme('dracula', draculaTheme);
  };

  // Define Dracula theme and cache editor reference
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    window.monaco = monaco;

    monaco.editor.defineTheme('dracula', draculaTheme);

    const lightThemes = ['Light (Default)', 'One Light', 'GitHub Light', 'Solarized Light', 'Night Owl Light', 'Catppuccin Latte', 'Min Light', 'Vitesse Light', 'High Contrast Light'];
    let baseTheme = 'vs-dark';
    if (lightThemes.includes(settingsColorTheme)) {
      baseTheme = 'vs';
    }
    if (settingsColorTheme === 'Dracula') {
      monaco.editor.setTheme('dracula');
    } else {
      monaco.editor.setTheme(baseTheme);
    }

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
    if (tab === "html") setActiveFileName("index.html");
    else if (tab === "css") setActiveFileName("style.css");
    else if (tab === "js") setActiveFileName("script.js");
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

  const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
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
      const d = new Date();
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const userRef = doc(db, "users", user.uid);
      setDoc(userRef, {
        activityLogs: {
          [dateKey]: increment(1)
        },
        languageStats: {
          [currentLanguage]: increment(1)
        }
      }, { merge: true }).catch(err => {
        console.error("Error logging activity: ", err);
      });
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

      const response = await fetchWithTimeout(`${apiEndpoint}/submissions?base64_encoded=true&wait=false`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          source_code: encodeBase64(codeToCompile),
          language_id: LANGUAGES[currentLanguage].id,
          stdin: encodeBase64(stdin),
          redirect_stderr_to_stdout: true
        })
      }, 10000);

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
    const maxAttempts = 40;
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        setConsoleOutput(`[Timeout Error]\nExecution exceeded standard queue wait times. The free public Judge0 API demo server is currently experiencing heavy load or rate limits.\n\n💡 Tip: Try again shortly, or click the gear settings icon at the top right to configure your own self-hosted Docker URL or RapidAPI proxy key for instant executions.`);
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

  const renderWebLabPreview = (skipSaveToDb = false) => {
    webPreviewSessionRef.current += 1;
    const currentSessionId = webPreviewSessionRef.current;

    const htmlVal = htmlCode;
    const cssVal = cssCode;
    const jsVal = jsCode;

    if (user && !user.isGuest && !skipSaveToDb) {
      saveCodeToFirestore("html", { htmlCode: htmlVal, cssCode: cssVal, jsCode: jsVal });
      const d = new Date();
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const userRef = doc(db, "users", user.uid);
      setDoc(userRef, {
        activityLogs: {
          [dateKey]: increment(1)
        },
        languageStats: {
          html: increment(1)
        }
      }, { merge: true }).catch(err => {
        console.error("Error logging web activity: ", err);
      });
    }

    // Inject log interceptor code in iframe preview
    const iframeLoggerScript = `
      <script>
        (function() {
          const sessionId = ${currentSessionId};
          const _log = console.log;
          const _error = console.error;
          const _warn = console.warn;
          
          function sendLog(type, args) {
            window.parent.postMessage({
              source: 'codeverse-preview',
              sessionId: sessionId,
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
              sessionId: sessionId,
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
      try {
        const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (frameDoc) {
          frameDoc.open();
          frameDoc.write(fullDocument);
          frameDoc.close();
        }
      } catch (err) {
        console.error("Failed to write to iframe: ", err);
      }
    }

    setWebLogs([]);
    if (!skipSaveToDb) {
      showToast("Web Sandbox preview updated", "success");
    }
  };

  // Live server style auto preview with 1000ms debounce (skips Firestore writes during typing)
  useEffect(() => {
    if (currentLanguage === "html" && isAutoRunEnabled) {
      if (autoRunTimerRef.current) {
        clearTimeout(autoRunTimerRef.current);
      }
      
      autoRunTimerRef.current = setTimeout(() => {
        renderWebLabPreview(true); // pass true to skip database updates
      }, 1000);
    }
    
    return () => {
      if (autoRunTimerRef.current) {
        clearTimeout(autoRunTimerRef.current);
      }
    };
  }, [htmlCode, cssCode, jsCode, currentLanguage, isAutoRunEnabled]);

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

  const filteredLanguages = Object.keys(LANGUAGES).filter((langKey) => {
    const lang = LANGUAGES[langKey];
    const nameMatch = lang.name.toLowerCase().includes(langSearchQuery.toLowerCase());
    const descMatch = (lang.desc || "").toLowerCase().includes(langSearchQuery.toLowerCase());
    return nameMatch || descMatch;
  });

  return (
    <main className="flex-grow w-full px-4 lg:px-6 py-4 flex flex-col gap-4 animate-fade-in-up">
      {/* Background Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-600/5 blur-[120px] z-0 pointer-events-none"></div>

      {/* ==================== COMPILER CONTROLS PANEL ==================== */}
      <div className="glass-panel py-2 px-4 rounded-2xl border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all duration-300 relative z-30">
        {/* Row 1: Back Button & Language Selector */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-2.5 w-full sm:w-auto relative z-20">
          {/* Left Side: Back button */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] active:scale-95 transition-all duration-200 relative z-20"
          >
            <i className="fas fa-arrow-left text-[10px] sm:text-xs"></i>
            <span>Back</span>
          </Link>

          {/* Selection of Language Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:border-indigo-500/30"
            >
              <i className="fas fa-cubes text-[10px] sm:text-xs text-indigo-400"></i>
              <span className="text-[var(--text-secondary)] text-[10px] sm:text-xs">Language:</span>
              <span className="text-indigo-400 font-extrabold text-[10px] sm:text-xs">{LANGUAGES[currentLanguage]?.name}</span>
              <i className="fas fa-chevron-down text-[8px] sm:text-[10px] text-[var(--text-secondary)] ml-0.5"></i>
            </button>
            <span
              id="lang-badge"
              className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold whitespace-nowrap flex-shrink-0 ${LANGUAGES[currentLanguage]?.badgeClass}`}
            >
              {LANGUAGES[currentLanguage]?.name}
            </span>
          </div>
        </div>

        {/* Row 2: Action items wrapper */}
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 w-full sm:w-auto relative z-20">
          {/* Group 1: Content Utility Actions */}
          <div className="flex items-center gap-2">
            {/* Clear Button */}
            <button
              onClick={currentLanguage === "text" ? () => handleUpdateNote('content', '') : clearConsole}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
            >
              <i className="fas fa-eraser text-[11px] sm:text-xs"></i>
              <span className="hidden sm:inline">{currentLanguage === "text" ? "Clear Note" : "Clear"}</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={currentLanguage === "text" ? handleCopyNote : copyCodeToClipboard}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
            >
              <i className="fas fa-copy text-[11px] sm:text-xs"></i>
              <span className="hidden sm:inline">{currentLanguage === "text" ? "Copy Note" : "Copy"}</span>
            </button>

            {/* Download Button */}
            <button
              onClick={currentLanguage === "text" ? handleDownloadNote : downloadCodeFile}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
            >
              <i className="fas fa-download text-[11px] sm:text-xs"></i>
              <span className="hidden sm:inline">{currentLanguage === "text" ? "Download Note" : "Download"}</span>
            </button>
          </div>

          {currentLanguage !== "text" && (
            <>
              {/* Separator 1 */}
              <div className="hidden sm:block h-5 w-[1px] bg-[var(--border-color)] mx-1" />

              {/* Group 2: Configurations & AI Tools */}
              <div className="flex items-center gap-2">
                {/* Settings Modal Button */}
                <button
                  onClick={openSettingsModal}
                  className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                  title="API Credentials Configuration"
                >
                  <i className="fas fa-sliders text-xs"></i>
                </button>

                {/* AI Code Assistant Toggle Button */}
                <button
                  onClick={() => setShowAIPanel(prev => !prev)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                    showAIPanel
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/10'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-emerald-400 hover:border-emerald-500/30 bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)]'
                  }`}
                  title="AI Code Assistant"
                >
                  <i className="fas fa-brain text-xs text-emerald-400 animate-pulse"></i>
                </button>
              </div>

              {/* Separator 2 */}
              <div className="hidden sm:block h-5 w-[1px] bg-[var(--border-color)] mx-1" />

              {/* Group 3: Execution Controls */}
              <div className="flex items-center gap-3">
                {currentLanguage === "html" && (
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mr-1">
                    <input
                      type="checkbox"
                      checked={isAutoRunEnabled}
                      onChange={(e) => setIsAutoRunEnabled(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[var(--border-color)] bg-[var(--bg-tertiary)] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-600"
                    />
                    <span className="flex items-center gap-1">
                      <i className={`fas fa-bolt text-[9px] sm:text-[10px] ${isAutoRunEnabled ? 'text-amber-400 animate-pulse' : 'text-[var(--text-muted)]'}`}></i>
                      <span>Auto Preview</span>
                    </span>
                  </label>
                )}
                <button
                  onClick={runCode}
                  disabled={isExecuting}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all duration-200 btn-premium-glow ${isExecuting ? 'opacity-75' : ''}`}
                >
                  {isExecuting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play text-[10px] sm:text-xs"></i>
                      <span>Run<span className="hidden sm:inline"> Code</span></span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* User Profile Dropdown */}
          {user ? (
            <div className="relative flex items-center gap-2 border-l border-[var(--border-color)] pl-3 ml-1 select-none">
              {/* User Name */}
              <span className="hidden md:inline text-xs font-bold text-slate-300 max-w-[100px] truncate">
                {user.name}
              </span>
              
              {/* Avatar Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserDropdownOpen(prev => !prev);
                }}
                className="w-8 h-8 rounded-full border border-[var(--border-color)] text-white text-xs font-bold flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 font-sans overflow-hidden"
                title="View Profile Actions"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-sm">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-10 w-44 rounded-xl border border-[var(--border-color)] bg-[#0f1420] shadow-2xl p-1.5 flex flex-col gap-1 z-50 animate-scale-up">
                  {/* Account Info summary */}
                  <div className="px-2.5 py-1.5 border-b border-[var(--border-color)]/30 mb-1 flex flex-col text-left">
                    <span className="text-[10px] font-bold text-slate-400 truncate">{user.name}</span>
                    <span className="text-[8px] font-mono text-slate-500 truncate mt-0.5">{user.email}</span>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate(`/profile/${user.username || ''}`);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-150 cursor-pointer flex items-center gap-2"
                  >
                    <i className="far fa-user text-[10px] text-indigo-400 w-4 text-center"></i>
                    <span>My account</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (user.role === 'admin') {
                        navigate('/admin');
                      } else {
                        openSettingsModal();
                      }
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-150 cursor-pointer flex items-center gap-2"
                  >
                    <i className="fas fa-sliders text-[10px] text-cyan-400 w-4 text-center"></i>
                    <span>{user.role === 'admin' ? 'Admin Panel' : 'API Console'}</span>
                  </button>

                  <div className="h-[1px] bg-[var(--border-color)]/30 my-0.5" />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150 cursor-pointer flex items-center gap-2"
                  >
                    <i className="fas fa-sign-out-alt text-[10px] text-rose-400 w-4 text-center"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Login button if user is not logged in
            <div className="border-l border-[var(--border-color)] pl-3 ml-1">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 active:scale-95 transition-all duration-200"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </button>
            </div>
          )}
        </div>
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
        <div className="flex flex-col lg:flex-row gap-4 items-stretch flex-grow w-full relative z-10 min-h-[500px]">
        {/* Monaco Code Editor Area */}
        <div 
          className="flex flex-col border border-[var(--border-color)] rounded-2xl glass-panel overflow-hidden shadow-xl transition-all duration-300 ide-neon-border flex-shrink-0"
          style={{ width: isMobile ? '100%' : `${leftPanelWidth}%` }}
        >
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

          {/* Editor Workspace with Sidebar Navigation & Side Drawer */}
          <div className="flex-grow flex flex-row min-h-[450px] relative overflow-hidden">
            {/* 1. Left Vertical Icon Sidebar Bar */}
            <div className="w-12 bg-[var(--bg-tertiary)]/10 border-r border-[var(--border-color)]/30 flex flex-col justify-between items-center py-4 flex-shrink-0 z-20">
              {/* Top Icons */}
              <div className="flex flex-col gap-5 w-full items-center">
                {/* Explorer/Files icon */}
                <button
                  onClick={() => setActiveSidebarTab(prev => prev === 'explorer' ? null : 'explorer')}
                  className={`w-8 h-8 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center text-base hover:text-white ${
                    activeSidebarTab === 'explorer' 
                      ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' 
                      : 'text-slate-400 border border-transparent hover:bg-slate-800/20'
                  }`}
                  title="Files Explorer"
                >
                  <i className="far fa-folder-open"></i>
                </button>
                
                {/* Search icon */}
                <button
                  onClick={() => setActiveSidebarTab(prev => prev === 'search' ? null : 'search')}
                  className={`w-8 h-8 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center text-base hover:text-white ${
                    activeSidebarTab === 'search' 
                      ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' 
                      : 'text-slate-400 border border-transparent hover:bg-slate-800/20'
                  }`}
                  title="Search Workspace"
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>

              {/* Bottom Icons */}
              <div className="flex flex-col gap-4 w-full items-center">
                {/* History / Drafts Icon */}
                <button
                  onClick={() => setActiveSidebarTab(prev => prev === 'history' ? null : 'history')}
                  className={`w-8 h-8 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center text-base hover:text-white ${
                    activeSidebarTab === 'history' 
                      ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' 
                      : 'text-slate-400 border border-transparent hover:bg-slate-800/20'
                  }`}
                  title="Local Drafts & Snapshots"
                >
                  <i className="fas fa-clock-rotate-left"></i>
                </button>
                
                {/* Editor Settings Gear Icon */}
                <button
                  onClick={() => setShowEditorSettings(true)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/30 transition-all duration-200 cursor-pointer flex items-center justify-center text-base"
                  title="Editor Settings"
                >
                  <i className="fas fa-cog"></i>
                </button>
              </div>
            </div>

            {/* 2. Slide Drawer Panel */}
            {activeSidebarTab && (
              <div 
                className="border-r border-[var(--border-color)]/30 bg-[var(--bg-tertiary)]/5 flex flex-col flex-shrink-0 z-10 animate-fade-in relative"
                style={{ width: `${drawerWidth}px` }}
              >
                {/* Explorer Tab Panel */}
                {activeSidebarTab === 'explorer' && (
                  <div className="flex flex-col h-full">
                    {/* Explorer Header */}
                    <div className="p-3 border-b border-[var(--border-color)]/30 bg-[var(--bg-tertiary)]/10 flex justify-between items-center shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Explorer</span>
                      
                      {/* Icons to Add File/Folder */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setIsCreatingFile(true);
                            setNewFileName("");
                          }}
                          className="w-6 h-6 rounded hover:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-150 cursor-pointer"
                          title="New File..."
                        >
                          <i className="fas fa-file-circle-plus text-xs"></i>
                        </button>
                        <button
                          onClick={() => {
                            showToast("Folder creation is a Premium feature!", "info");
                          }}
                          className="w-6 h-6 rounded hover:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-150 cursor-pointer"
                          title="New Folder..."
                        >
                          <i className="fas fa-folder-plus text-xs"></i>
                        </button>
                      </div>
                    </div>

                    {/* Files List Wrapper */}
                    <div className="p-3 flex flex-col gap-1.5 flex-grow overflow-y-auto scrollbar-thin">
                      {/* Inline Input Field for New File Name */}
                      {isCreatingFile && (
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-primary)]/80 border border-indigo-500/50 shrink-0">
                          <i className="far fa-file text-slate-400 text-xs"></i>
                          <input
                            autoFocus
                            type="text"
                            placeholder="filename.ext"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateFile();
                              } else if (e.key === 'Escape') {
                                setIsCreatingFile(false);
                                setNewFileName("");
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setIsCreatingFile(false);
                                setNewFileName("");
                              }, 200);
                            }}
                            className="w-full bg-transparent text-xs text-white focus:outline-none focus:ring-0 p-0 font-mono"
                          />
                        </div>
                      )}

                      {/* Display Workspace Files */}
                      {workspaceFiles.map(f => {
                        const isActive = f.name === activeFileName;
                        
                        let fileIcon = "far fa-file-code text-indigo-400";
                        const ext = f.name.split('.').pop().toLowerCase();
                        if (ext === 'html') fileIcon = "fab fa-html5 text-orange-500";
                        else if (ext === 'css') fileIcon = "fab fa-css3-alt text-blue-500";
                        else if (ext === 'js') fileIcon = "fab fa-js text-yellow-500";
                        else if (ext === 'py') fileIcon = "fab fa-python text-sky-400";
                        else if (ext === 'c') fileIcon = "fas fa-copyright text-blue-400";
                        else if (ext === 'cpp' || ext === 'cc') fileIcon = "fas fa-c text-blue-500";
                        
                        const isDefaultFile = ['index.html', 'style.css', 'script.js'].includes(f.name) || f.name.startsWith('main.');
                        
                        return (
                          <div
                            key={f.name}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all duration-200 group select-none ${
                              isActive 
                                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                                : "text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent"
                            }`}
                          >
                            <button
                              onClick={() => {
                                if (editorRef.current) {
                                  const currentVal = editorRef.current.getValue();
                                  handleWorkspaceCodeChange(currentVal);
                                }
                                
                                setActiveFileName(f.name);
                                
                                if (currentLanguage === "html") {
                                  if (f.name === "index.html") switchWebTab("html");
                                  else if (f.name === "style.css") switchWebTab("css");
                                  else if (f.name === "script.js") switchWebTab("js");
                                }
                              }}
                              className="flex items-center gap-2 flex-grow text-left cursor-pointer"
                            >
                              <i className={fileIcon}></i>
                              <span className="truncate">{f.name}</span>
                            </button>

                            {/* Delete button */}
                            {!isDefaultFile && (
                              <button
                                onClick={() => handleDeleteFile(f.name)}
                                className="w-5 h-5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Delete file"
                              >
                                <i className="far fa-trash-can text-[10px]"></i>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Search Tab Panel */}
                {activeSidebarTab === 'search' && (
                  <div className="flex flex-col h-full">
                    <div className="p-3 border-b border-[var(--border-color)]/30 bg-[var(--bg-tertiary)]/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Search</span>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search in file..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-[var(--bg-primary)] border border-[var(--border-color)]/40 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50 transition-all duration-200"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && editorRef.current) {
                              const searchString = e.target.value;
                              if (searchString) {
                                editorRef.current.trigger('actions', 'actions.find');
                              }
                            }
                          }}
                        />
                        <i className="fas fa-search absolute left-3 top-2.5 text-[var(--text-muted)] text-[10px]"></i>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] leading-relaxed italic">
                        Type search query and press <strong>Enter</strong> to open built-in Monaco editor find overlay.
                      </p>
                    </div>
                  </div>
                )}

                {/* History / Drafts Tab Panel */}
                {activeSidebarTab === 'history' && (
                  <div className="flex flex-col h-full max-h-[480px]">
                    <div className="p-3 border-b border-[var(--border-color)]/30 bg-[var(--bg-tertiary)]/10 flex justify-between items-center flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Drafts</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                          {drafts.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Save Current Workspace as Draft */}
                        <button
                          onClick={saveDraft}
                          className="w-6 h-6 rounded hover:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-150 cursor-pointer"
                          title="Save current workspace snapshot as draft"
                        >
                          <i className="fas fa-plus text-xs"></i>
                        </button>
                        {/* Reload Drafts List from LocalStorage */}
                        <button
                          onClick={() => {
                            try {
                              const saved = localStorage.getItem("codeverse_drafts");
                              setDrafts(saved ? JSON.parse(saved) : []);
                              showToast("Drafts list reloaded", "info");
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="w-6 h-6 rounded hover:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-150 cursor-pointer"
                          title="Reload drafts list"
                        >
                          <i className="fas fa-sync text-xs"></i>
                        </button>
                      </div>
                    </div>

                    <div className="flex-grow overflow-y-auto divide-y divide-[var(--border-color)]/10 scrollbar-thin">
                      {drafts.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[var(--text-muted)] italic leading-relaxed">
                          No drafts saved yet.<br/>Click the "+" button to save a snapshot.
                        </div>
                      ) : (
                        drafts.map(d => {
                          const dateObj = new Date(d.timestamp);
                          const dateStr = isNaN(dateObj.getTime()) ? 'yesterday' : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          return (
                            <div
                              key={d.id}
                              className="p-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/20 transition-all duration-200 select-none group"
                            >
                              <div
                                onClick={() => loadDraft(d)}
                                className="flex-grow min-w-0 pr-2 cursor-pointer"
                              >
                                <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors duration-150">
                                  {d.name}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-[var(--text-muted)] font-mono">
                                  <span className="uppercase font-extrabold text-indigo-400/80">{d.language}</span>
                                  <span>•</span>
                                  <span>{dateStr}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteDraft(d.id)}
                                className="w-5 h-5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Delete draft"
                              >
                                <i className="far fa-trash-can text-[10px]"></i>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
                
                {/* Drag Resize Handle */}
                <div
                  onMouseDown={startResizingDrawer}
                  className="absolute right-0 top-0 bottom-0 w-1.5 hover:w-2 bg-transparent hover:bg-indigo-500/40 cursor-col-resize z-30 transition-all duration-150 select-none"
                  style={{ right: '-3px' }}
                />
              </div>
            )}

            {/* 3. Main Monaco Editor Container Wrapper */}
            <div className="flex-grow relative h-[450px] lg:h-full min-w-0">
              <div className="absolute inset-0 w-full h-full">
                {settingsEditorEngine === "Ace" ? (
                  <VanillaAceEditor
                    mode={getAceMode(currentLanguage, activeFileName, activeWebTab)}
                    theme={getAceTheme(settingsColorTheme)}
                    value={workspaceFiles.find(f => f.name === activeFileName)?.content || ""}
                    onChange={handleWorkspaceCodeChange}
                    fontSize={settingsFontSize}
                    wordWrap={settingsWordWrap}
                    disableAutocomplete={settingsDisableAutocomplete}
                    style={{
                      borderRadius: '0px',
                      background: settingsColorTheme === 'Dracula' ? '#282a36' : (['Light (Default)', 'One Light', 'GitHub Light', 'Solarized Light', 'Night Owl Light', 'Catppuccin Latte', 'Min Light', 'Vitesse Light', 'High Contrast Light'].includes(settingsColorTheme) ? '#f5f5f5' : '#1e1e1e')
                    }}
                  />
                ) : (
                  <Editor
                    language={
                      (() => {
                        const fileLang = workspaceFiles.find(f => f.name === activeFileName)?.language;
                        if (fileLang) {
                          return LANGUAGES[fileLang]?.monacoId || fileLang;
                        }
                        return currentLanguage === "html"
                          ? (activeWebTab === "js" ? "javascript" : activeWebTab)
                          : LANGUAGES[currentLanguage]?.monacoId || "text";
                      })()
                    }
                    value={
                      workspaceFiles.find(f => f.name === activeFileName)?.content || ""
                    }
                    onChange={handleWorkspaceCodeChange}
                    beforeMount={handleEditorBeforeMount}
                    onMount={handleEditorDidMount}
                    theme={
                      settingsColorTheme === 'Dracula' 
                        ? 'dracula' 
                        : (['Light (Default)', 'One Light', 'GitHub Light', 'Solarized Light', 'Night Owl Light', 'Catppuccin Latte', 'Min Light', 'Vitesse Light', 'High Contrast Light'].includes(settingsColorTheme) ? 'vs' : 'vs-dark')
                    }
                    loading={
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-xs">
                        <div className="spinner mr-2"></div> Loading Monaco IDE Workspace...
                      </div>
                    }
                    options={{
                      fontSize: settingsFontSize,
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
                      padding: { top: 12, bottom: 12 },
                      wordWrap: settingsWordWrap ? 'on' : 'off',
                      quickSuggestions: !settingsDisableAutocomplete,
                      suggestOnTriggerCharacters: !settingsDisableAutocomplete
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Editor Status bar */}
          <div className="h-8 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/20 flex items-center justify-between px-4 text-[10px] text-[var(--text-muted)] font-mono">
            <div>Status: Ready to edit</div>
            <div>Shortcut: Ctrl + Enter to run</div>
          </div>
        </div>

        {/* Panel resizing divider handle */}
        {!isMobile && (
          <div
            onMouseDown={startResizingPanels}
            className="hidden lg:block w-3 bg-transparent cursor-col-resize flex-shrink-0 z-20 relative self-stretch select-none -mx-1.5 flex justify-center group"
            title="Drag to resize workspace split ratio"
          >
            <div className="w-[1px] h-full bg-transparent group-hover:bg-white/80 transition-colors duration-150" />
          </div>
        )}

        {/* Input Stdin / Console Output Panel */}
        <div className="flex flex-col gap-6 flex-grow min-w-0">
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
                <div id="console-output-container" className="flex-grow p-4 bg-[var(--console-bg)] overflow-y-auto min-h-[220px] relative">
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
                <div id="web-console" className={`border-t border-[var(--border-color)] bg-[var(--console-bg)] flex flex-col overflow-hidden transition-all duration-300 ${isWebConsoleOpen ? 'h-44' : 'h-7'}`}>
                  <div 
                    onClick={() => setIsWebConsoleOpen(prev => !prev)}
                    className="h-7 border-b border-[var(--border-color)] px-3 bg-[var(--bg-tertiary)]/20 flex items-center justify-between text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider cursor-pointer select-none hover:bg-[var(--bg-tertiary)]/30 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <i className="fas fa-bug text-rose-500/80"></i>
                      <span>Console Logs</span>
                      {webLogs.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold ml-1 font-sans">
                          {webLogs.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setWebLogs([])}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer"
                        title="Clear Console"
                      >
                        <i className="fas fa-trash-can"></i>
                      </button>
                      <button
                        onClick={() => setIsWebConsoleOpen(prev => !prev)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer"
                        title={isWebConsoleOpen ? "Collapse Console" : "Expand Console"}
                      >
                        <i className={`fas ${isWebConsoleOpen ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
                      </button>
                    </div>
                  </div>
                  {isWebConsoleOpen && (
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
                  )}
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
        <div
          onClick={() => setShowSettings(false)}
          className="modal-overlay fixed inset-0 z-50 bg-black/40 flex items-start pt-[8vh] md:items-center md:pt-0 justify-center p-4 transition-all duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[85vh] rounded-2xl border border-[var(--border-color)] bg-[#121824] overflow-hidden shadow-2xl animate-fade-in-up flex flex-col glass-panel"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border-color)]/50 bg-[#0f1420]/75 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <i className="fas fa-sliders text-sm"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Compiler Settings</h3>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 cursor-pointer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-grow scrollbar-thin">
              {/* 1. Judge0 API Base URL */}
              <div className="flex flex-col gap-2 pb-3 border-b border-[var(--border-color)]/10 text-left">
                <span className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Judge0 API Base URL</span>
                <input
                  type="text"
                  value={settingsUrlInput}
                  onChange={(e) => setSettingsUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono transition-all duration-200"
                  placeholder="https://ce.judge0.com"
                />
                <span className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  By default we use the Judge0 Community Edition testing instance. You can replace this with your self-hosted Docker URL or RapidAPI proxy.
                </span>
              </div>

              {/* 2. RapidAPI Host Key */}
              <div className="flex flex-col gap-2 text-left">
                <span className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">RapidAPI Host Key (x-rapidapi-key)</span>
                <input
                  type="password"
                  value={settingsKeyInput}
                  onChange={(e) => setSettingsKeyInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono transition-all duration-200"
                  placeholder="••••••••••••••••••••••••••••••••"
                />
                <span className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  Only required if pointing to RapidAPI endpoint (e.g. <code>https://judge0-ce.p.rapidapi.com</code>). Leave empty for self-hosted instances.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-color)]/50 bg-[#0f1420]/75 flex justify-between items-center shrink-0">
              <button
                onClick={() => {
                  setSettingsUrlInput(DEFAULT_API_URL);
                  setSettingsKeyInput("");
                  showToast("Compiler settings reset to defaults", "info");
                }}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer bg-transparent border-none"
              >
                Reset to defaults
              </button>
              <button
                onClick={saveSettings}
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all duration-200 btn-premium-glow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== LANGUAGE SELECTOR GRID MODAL ==================== */}
      {showLanguageModal && (
        <div
          onClick={() => {
            setShowLanguageModal(false);
            setLangSearchQuery("");
          }}
          className="modal-overlay fixed inset-0 z-50 bg-black/40 flex items-start pt-[8vh] md:items-center md:pt-0 justify-center p-4 transition-all duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl rounded-2xl border border-[#232f48] bg-[#121824] overflow-hidden shadow-2xl animate-fade-in-up flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#232f48] bg-[#0f1420]/75 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <i className="fas fa-cubes text-sm"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Select Environment</h3>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Choose your programming language workspace</p>
                </div>
              </div>

              {/* Live Fuzzy Search Input */}
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={langSearchQuery}
                  onChange={(e) => setLangSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-1.5 rounded-xl text-xs bg-[#0c101c] border border-[#232f48] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <i className="fas fa-search text-[10px]"></i>
                </div>
                {langSearchQuery && (
                  <button
                    onClick={() => setLangSearchQuery("")}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white transition-colors duration-200"
                  >
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body: Cards Grid */}
            <div className="p-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
              {filteredLanguages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
                  <i className="fas fa-search text-lg text-slate-600 animate-bounce"></i>
                  <span>No matches found for "{langSearchQuery}"</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredLanguages.map((langKey) => {
                    const lang = LANGUAGES[langKey];
                    const isSelected = currentLanguage === langKey;
                    return (
                      <div
                        key={langKey}
                        ref={isSelected ? selectedCardRef : null}
                        onClick={() => {
                          handleLanguageSwitch(langKey);
                          setShowLanguageModal(false);
                          setLangSearchQuery("");
                        }}
                        className={`group flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none active:scale-98 ${
                          isSelected
                            ? 'border-indigo-500 bg-[#1e273d] shadow-lg shadow-indigo-500/5 text-white'
                            : 'border-[#222c3f]/80 bg-[#161e30]/70 hover:bg-[#1a233b] hover:border-indigo-500/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {/* Dynamic Colored Icon Container using badgeClass */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                          isSelected ? lang.badgeClass : `${lang.badgeClass} opacity-80 group-hover:opacity-100`
                        }`}>
                          <i className={lang.icon || "fas fa-code"}></i>
                        </div>

                        {/* Name and Compiler Details */}
                        <div className="text-left overflow-hidden">
                          <h4 className={`text-xs font-black tracking-wide truncate ${isSelected ? 'text-indigo-400' : 'text-[var(--text-primary)] group-hover:text-indigo-400'}`}>
                            {lang.name}
                          </h4>
                          <p className="text-[10px] text-[var(--text-muted)] truncate mt-1 tracking-wide font-medium">
                            {lang.desc || "Interactive Sandbox"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#232f48] bg-[#0f1420]/75 flex items-center justify-between shrink-0 text-[10px] text-[var(--text-secondary)]">
              <span>{filteredLanguages.length} environments available</span>
              <button
                onClick={() => {
                  setShowLanguageModal(false);
                  setLangSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded-lg border border-[#232f48] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#1c263e] active:scale-95 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDITOR CONFIGURATION SETTINGS MODAL ==================== */}
      {showEditorSettings && (
        <div
          onClick={() => setShowEditorSettings(false)}
          className="modal-overlay fixed inset-0 z-50 bg-black/40 flex items-start pt-[8vh] md:items-center md:pt-0 justify-center p-4 transition-all duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[85vh] rounded-2xl border border-[var(--border-color)] bg-[#121824] overflow-hidden shadow-2xl animate-fade-in-up flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border-color)]/50 bg-[#0f1420] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <i className="fas fa-sliders text-sm"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Editor Settings</h3>
                </div>
              </div>
              <button
                onClick={() => setShowEditorSettings(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 cursor-pointer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-grow scrollbar-thin">
              {/* 1. Font Size Control */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/10">
                <div className="text-left">
                  <span className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Font size</span>
                  <span className="text-[10px] text-[var(--text-muted)]">8–32px</span>
                </div>
                <div className="flex items-center gap-3 bg-[#090d16] p-1 rounded-xl border border-[var(--border-color)]/50">
                  <button
                    onClick={() => {
                      const next = Math.max(8, settingsFontSize - 1);
                      setSettingsFontSize(next);
                      localStorage.setItem("codeverse_settings_font_size", next);
                    }}
                    className="w-6 h-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="text-xs font-mono font-bold text-white w-8 text-center">{settingsFontSize}px</span>
                  <button
                    onClick={() => {
                      const next = Math.min(32, settingsFontSize + 1);
                      setSettingsFontSize(next);
                      localStorage.setItem("codeverse_settings_font_size", next);
                    }}
                    className="w-6 h-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              {/* 2. Theme Control */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/10">
                <div className="text-left">
                  <span className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Theme</span>
                </div>
                <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-[var(--border-color)]/50">
                  <button
                    onClick={() => {
                      if (theme !== 'light' && toggleTheme) toggleTheme();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      theme === 'light' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="far fa-sun text-[10px]"></i>
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => {
                      if (theme !== 'dark' && toggleTheme) toggleTheme();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      theme === 'dark' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="far fa-moon text-[10px]"></i>
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* 3. Editor Engine */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/10">
                <div className="text-left">
                  <span className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Editor</span>
                  <span className="text-[10px] text-[var(--text-muted)]">On mobile, Ace is always used.</span>
                </div>
                <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-[var(--border-color)]/50">
                  <button
                    onClick={() => {
                      setSettingsEditorEngine("Monaco");
                      localStorage.setItem("codeverse_settings_editor_engine", "Monaco");
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                      settingsEditorEngine === "Monaco" 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Monaco
                  </button>
                  <button
                    onClick={() => {
                      setSettingsEditorEngine("Ace");
                      localStorage.setItem("codeverse_settings_editor_engine", "Ace");
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                      settingsEditorEngine === "Ace" 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Ace
                  </button>
                </div>
              </div>

              {/* 4. Color Theme Dropdown */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/10">
                <div className="text-left">
                  <span className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Color theme</span>
                </div>
                <select
                  value={settingsColorTheme}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setSettingsColorTheme(selected);
                    localStorage.setItem("codeverse_settings_color_theme", selected);
                    
                    if (editorRef.current && window.monaco) {
                      const lightThemes = ['Light (Default)', 'One Light', 'GitHub Light', 'Solarized Light', 'Night Owl Light', 'Catppuccin Latte', 'Min Light', 'Vitesse Light', 'High Contrast Light'];
                      let baseTheme = 'vs-dark';
                      if (lightThemes.includes(selected)) {
                        baseTheme = 'vs';
                      }
                      if (selected === 'Dracula') {
                        window.monaco.editor.setTheme('dracula');
                      } else {
                        window.monaco.editor.setTheme(baseTheme);
                      }
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs bg-[#090d16] border border-[var(--border-color)] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer max-w-[150px]"
                >
                  <optgroup label="Dark themes" className="bg-[#121824] text-slate-300">
                    <option value="Dark (Default)">Dark (Default)</option>
                    <option value="One Dark Pro">One Dark Pro</option>
                    <option value="Dracula">Dracula</option>
                    <option value="Monokai">Monokai</option>
                    <option value="Night Owl">Night Owl</option>
                    <option value="GitHub Dark">GitHub Dark</option>
                    <option value="Tokyo Night">Tokyo Night</option>
                    <option value="Catppuccin Mocha">Catppuccin Mocha</option>
                    <option value="Nord">Nord</option>
                    <option value="Solarized Dark">Solarized Dark</option>
                    <option value="High Contrast Dark">High Contrast Dark</option>
                  </optgroup>
                  <optgroup label="Light themes" className="bg-[#121824] text-slate-300">
                    <option value="Light (Default)">Light (Default)</option>
                    <option value="One Light">One Light</option>
                    <option value="GitHub Light">GitHub Light</option>
                    <option value="Solarized Light">Solarized Light</option>
                    <option value="Night Owl Light">Night Owl Light</option>
                    <option value="Catppuccin Latte">Catppuccin Latte</option>
                    <option value="Min Light">Min Light</option>
                    <option value="Vitesse Light">Vitesse Light</option>
                    <option value="High Contrast Light">High Contrast Light</option>
                  </optgroup>
                </select>
              </div>

              {/* 5. Word Wrap Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/10">
                <div className="text-left pr-4">
                  <span className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Word wrap</span>
                  <span className="text-[10px] text-[var(--text-muted)] leading-relaxed">Wrap long lines to fit the editor width.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !settingsWordWrap;
                    setSettingsWordWrap(next);
                    localStorage.setItem("codeverse_settings_word_wrap", next);
                  }}
                  className={`w-10 h-5 rounded-full flex items-center p-0.5 shrink-0 transition-colors duration-200 cursor-pointer ${
                    settingsWordWrap ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settingsWordWrap ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* 6. Autocomplete Disable Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/10">
                <div className="text-left pr-4">
                  <span className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Disable auto-complete</span>
                  <span className="text-[10px] text-[var(--text-muted)] leading-relaxed">Stop suggesting completions as you type.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !settingsDisableAutocomplete;
                    setSettingsDisableAutocomplete(next);
                    localStorage.setItem("codeverse_settings_disable_autocomplete", next);
                  }}
                  className={`w-10 h-5 rounded-full flex items-center p-0.5 shrink-0 transition-colors duration-200 cursor-pointer ${
                    settingsDisableAutocomplete ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settingsDisableAutocomplete ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* 7. Preserve Console Error Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/10">
                <div className="text-left pr-4">
                  <span className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Web Console: Preserve error log</span>
                  <span className="text-[10px] text-[var(--text-muted)] leading-relaxed">Keep errors in the console instead of clearing them.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !settingsPreserveErrorLog;
                    setSettingsPreserveErrorLog(next);
                    localStorage.setItem("codeverse_settings_preserve_error_log", next);
                  }}
                  className={`w-10 h-5 rounded-full flex items-center p-0.5 shrink-0 transition-colors duration-200 cursor-pointer ${
                    settingsPreserveErrorLog ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settingsPreserveErrorLog ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* 8. Avoid Console Auto-scroll Toggle */}
              <div className="flex items-center justify-between pb-3">
                <div className="text-left pr-4">
                  <span className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Web Console: Avoid auto scrolling</span>
                  <span className="text-[10px] text-[var(--text-muted)] leading-relaxed">Don't auto-scroll the console to the newest line.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !settingsAvoidAutoScrolling;
                    setSettingsAvoidAutoScrolling(next);
                    localStorage.setItem("codeverse_settings_avoid_auto_scrolling", next);
                  }}
                  className={`w-10 h-5 rounded-full flex items-center p-0.5 shrink-0 transition-colors duration-200 cursor-pointer ${
                    settingsAvoidAutoScrolling ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settingsAvoidAutoScrolling ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-color)]/50 bg-[#0f1420] flex justify-between items-center shrink-0">
              <button
                onClick={() => {
                  setSettingsFontSize(14);
                  setSettingsWordWrap(false);
                  setSettingsDisableAutocomplete(false);
                  setSettingsColorTheme("Dracula");
                  setSettingsPreserveErrorLog(false);
                  setSettingsAvoidAutoScrolling(false);
                  setSettingsEditorEngine("Monaco");

                  localStorage.setItem("codeverse_settings_font_size", 14);
                  localStorage.setItem("codeverse_settings_word_wrap", false);
                  localStorage.setItem("codeverse_settings_disable_autocomplete", false);
                  localStorage.setItem("codeverse_settings_color_theme", "Dracula");
                  localStorage.setItem("codeverse_settings_preserve_error_log", false);
                  localStorage.setItem("codeverse_settings_avoid_auto_scrolling", false);
                  localStorage.setItem("codeverse_settings_editor_engine", "Monaco");
                  
                  if (editorRef.current && window.monaco) {
                    window.monaco.editor.setTheme('dracula');
                  }
                  showToast("Settings reset to defaults", "info");
                }}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer bg-transparent border-none p-0 focus:outline-none"
              >
                Reset to defaults
              </button>
              
              <button
                onClick={() => setShowEditorSettings(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/10 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
