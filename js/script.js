/**
 * CodeVerse Online Compiler - Core JS Engine
 * Handles UI interactions, Monaco Editor configurations, and Judge0 API compilation logic.
 */

// --- Constants & Configurations ---
const DEFAULT_API_URL = "https://ce.judge0.com"; // Judge0 CE free instance
const REPO_NAME = "CodeVerse Online Compiler";

// Language Configurations & Templates
const LANGUAGES = {
  c: {
    id: 50, // C (GCC 9.2.0)
    name: "C",
    monacoId: "c",
    extension: "c",
    badgeClass: "badge-c",
    defaultCode: `#include <stdio.h>

int main() {
    char name[100];
    printf("Enter your name: ");
    
    // Read from standard input (stdin)
    if (scanf("%s", name) == 1) {
        printf("Hello, %s! Welcome to CodeVerse Online Compiler.\\n", name);
    } else {
        printf("Hello, World! Welcome to CodeVerse.\\n");
    }
    
    return 0;
}`
  },
  cpp: {
    id: 54, // C++ (GCC 9.2.0)
    name: "C++",
    monacoId: "cpp",
    extension: "cpp",
    badgeClass: "badge-cpp",
    defaultCode: `#include <iostream>
#include <string>

using namespace std;

int main() {
    string name;
    cout << "Enter your name: ";
    
    // Read from standard input (stdin)
    if (cin >> name) {
        cout << "Hello, " << name << "! Welcome to CodeVerse Online Compiler." << endl;
    } else {
        cout << "Hello, World! Welcome to CodeVerse." << endl;
    }
    
    return 0;
}`
  },
  python: {
    id: 71, // Python (3.8.1)
    name: "Python 3",
    monacoId: "python",
    extension: "py",
    badgeClass: "badge-python",
    defaultCode: `# Python program execution
import sys

print("Enter your name: ", end="")
sys.stdout.flush()

# Read from standard input (stdin)
line = sys.stdin.readline().strip()

if line:
    print(f"Hello, {line}! Welcome to CodeVerse Online Compiler.")
else:
    print("Hello, World! Welcome to CodeVerse Python Playground.")

# Example loop
print("\\nCounting 1 to 5:")
for i in range(1, 6):
    print(f"Step: {i}")
`
  },
  javascript: {
    id: 63, // JavaScript (Node.js 12.14.0)
    name: "JavaScript (NodeJS)",
    monacoId: "javascript",
    extension: "js",
    badgeClass: "badge-js",
    defaultCode: `// JavaScript Code Execution (NodeJS Environment)
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your name: ', (name) => {
    console.log(\`Hello, \${name || 'World'}! Welcome to CodeVerse Online Compiler.\`);
    
    // Demonstration of calculations
    const result = factorial(5);
    console.log(\`Factorial of 5 is: \${result}\`);
    
    rl.close();
});

function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`
  },
  java: {
    id: 62, // Java (OpenJDK 13.0.1)
    name: "Java",
    monacoId: "java",
    extension: "java",
    badgeClass: "badge-java",
    defaultCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        
        // Read from standard input (stdin)
        if (scanner.hasNextLine()) {
            String name = scanner.nextLine();
            System.out.println("Hello, " + name + "! Welcome to CodeVerse Online Compiler.");
        } else {
            System.out.println("Hello, World! Welcome to CodeVerse Java Environment.");
        }
        
        scanner.close();
    }
}`
  },
  php: {
    id: 68, // PHP (7.4.1)
    name: "PHP",
    monacoId: "php",
    extension: "php",
    badgeClass: "badge-php",
    defaultCode: `<?php
// PHP Script Execution
echo "Enter your name: ";

// Read standard input
$name = trim(fgets(STDIN));

if (!empty($name)) {
    echo "Hello, " . $name . "! Welcome to CodeVerse Online Compiler.\\n";
} else {
    echo "Hello, World! Welcome to CodeVerse PHP Console.\\n";
}

$numbers = [1, 2, 3, 4, 5];
echo "Sum of array values: " . array_sum($numbers) . "\\n";
?>`
  },
  bash: {
    id: 46, // Bash (5.0.0)
    name: "Bash Shell",
    monacoId: "shell",
    extension: "sh",
    badgeClass: "badge-bash",
    defaultCode: `#!/bin/bash
# Bash script execution

echo -n "Enter your name: "
read name

if [ -n "$name" ]; then
    echo "Hello, $name! Welcome to CodeVerse Online Compiler."
else
    echo "Hello, World! Welcome to CodeVerse Bash Environment."
fi

echo "Current System Path:"
echo $PATH | cut -d':' -f1-3
`
  }
};

// --- Application State ---
let editor = null;
let currentLanguage = localStorage.getItem("codeverse_lang") || "cpp";
let apiEndpoint = localStorage.getItem("codeverse_api_url") || DEFAULT_API_URL;
let apiKey = localStorage.getItem("codeverse_api_key") || "";
let isExecuting = false;

// Safe UTF-8 Base64 Encoding and Decoding Helpers
function encodeBase64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str || "")));
  } catch (e) {
    console.error("Base64 encoding error: ", e);
    return "";
  }
}

function decodeBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str || "")));
  } catch (e) {
    console.error("Base64 decoding error: ", e);
    return str || "";
  }
}

// --- DOM Elements ---
const DOM = {
  themeToggleBtn: document.getElementById("theme-toggle"),
  themeIcon: document.getElementById("theme-icon"),
  langSelect: document.getElementById("language-select"),
  badge: document.getElementById("lang-badge"),
  runBtn: document.getElementById("run-btn"),
  runText: document.getElementById("run-text"),
  runIcon: document.getElementById("run-icon"),
  runSpinner: document.getElementById("run-spinner"),
  clearBtn: document.getElementById("clear-btn"),
  copyBtn: document.getElementById("copy-btn"),
  downloadBtn: document.getElementById("download-btn"),
  settingsBtn: document.getElementById("settings-btn"),
  
  // Terminal Panel
  stdinArea: document.getElementById("stdin-area"),
  outputConsole: document.getElementById("output-console"),
  statusBadge: document.getElementById("status-badge"),
  timeIndicator: document.getElementById("time-indicator"),
  memoryIndicator: document.getElementById("memory-indicator"),
  
  // Settings Modal
  settingsModal: document.getElementById("settings-modal"),
  saveSettingsBtn: document.getElementById("save-settings"),
  closeSettingsBtn: document.getElementById("close-settings"),
  apiUrlInput: document.getElementById("api-url-input"),
  apiKeyInput: document.getElementById("api-key-input")
};

// --- Monaco Editor Initialization ---
function initMonaco() {
  require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
  
  require(['vs/editor/editor.main'], function() {
    // Define Dracula theme for Monaco Editor
    monaco.editor.defineTheme('dracula', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'identifier', foreground: 'f8f8f2' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'operator', foreground: 'ff79c6' },
        { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
        { token: 'class', foreground: '50fa7b' },
        { token: 'function', foreground: '50fa7b' }
      ],
      colors: {
        'editor.background': '#282a36',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#44475a',
        'editorCursor.foreground': '#f8f8f2',
        'editor.selectionBackground': '#44475a',
        'editor.inactiveSelectionBackground': '#44475a44',
        'editor.lineHighlightBorder': '#282a36'
      }
    });
    
    // Retrieve saved code or set default
    const savedCode = localStorage.getItem(`codeverse_code_${currentLanguage}`);
    const initialCode = savedCode !== null ? savedCode : LANGUAGES[currentLanguage].defaultCode;

    editor = monaco.editor.create(document.getElementById('editor-container'), {
      value: initialCode,
      language: LANGUAGES[currentLanguage].monacoId,
      theme: document.documentElement.classList.contains('light') ? 'vs' : 'dracula',
      fontSize: 14,
      fontFamily: 'Fira Code, JetBrains Mono, monospace',
      fontLigatures: true,
      automaticLayout: true,
      minimap: { enabled: true },
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8
      },
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: 'on',
      padding: { top: 12, bottom: 12 },
      roundedSelection: true,
      selectOnLineNumbers: true
    });

    // Auto-save code to localStorage when changed
    editor.onDidChangeModelContent(() => {
      localStorage.setItem(`codeverse_code_${currentLanguage}`, editor.getValue());
    });
  });
}

// --- Theme Management ---
function initTheme() {
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const storedTheme = localStorage.getItem("codeverse_theme");
  
  // Default to dark theme if not saved
  const isLight = storedTheme === "light" || (storedTheme === null && !systemPrefersDark);
  
  if (isLight) {
    document.documentElement.classList.add("light");
    DOM.themeIcon.className = "fas fa-moon"; // Show moon in light mode (to click and go dark)
  } else {
    document.documentElement.classList.remove("light");
    DOM.themeIcon.className = "fas fa-sun"; // Show sun in dark mode
  }
}

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle("light");
  localStorage.setItem("codeverse_theme", isLight ? "light" : "dark");
  
  // Toggle Monaco Theme
  if (editor) {
    monaco.editor.setTheme(isLight ? 'vs' : 'dracula');
  }
  
  // Toggle icons
  DOM.themeIcon.className = isLight ? "fas fa-moon" : "fas fa-sun";
  
  showToast(isLight ? "Light Mode Active" : "Dracula Theme Active");
}

// --- Dynamic Badge Helper ---
function updateLanguageBadge() {
  const langConfig = LANGUAGES[currentLanguage];
  DOM.badge.className = `px-2 py-0.5 rounded text-xs font-semibold ${langConfig.badgeClass}`;
  DOM.badge.textContent = langConfig.name;
}

// --- Toast Alerts ---
function showToast(message, type = "info") {
  // Create toast container if not exists
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  // Create individual toast element
  const toast = document.createElement("div");
  toast.className = `px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transform translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto max-w-sm glass-panel text-sm`;
  
  let icon = '<i class="fas fa-info-circle text-indigo-400"></i>';
  if (type === "success") {
    icon = '<i class="fas fa-check-circle text-emerald-400"></i>';
  } else if (type === "error") {
    icon = '<i class="fas fa-exclamation-circle text-rose-500"></i>';
  }

  toast.innerHTML = `
    ${icon}
    <span class="text-slate-100 light:text-slate-900">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Force reflow and animate
  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  }, 10);

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add("translate-y-10", "opacity-0");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// --- Judge0 Code Execution Logic ---
async function runCode() {
  if (isExecuting) return;
  
  const code = editor ? editor.getValue() : "";
  if (!code.trim()) {
    showToast("Please enter some code first!", "error");
    return;
  }

  isExecuting = true;
  toggleExecutionUI(true);
  
  // Clear stdout, update execution status to running
  DOM.outputConsole.innerHTML = '<span class="text-slate-400 animate-pulse">Running compilation processes...</span><span class="terminal-cursor"></span>';
  DOM.statusBadge.textContent = "Compiling...";
  DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
  DOM.timeIndicator.textContent = "-";
  DOM.memoryIndicator.textContent = "-";

  const stdin = DOM.stdinArea.value;
  const langId = LANGUAGES[currentLanguage].id;

  try {
    // Setup request headers (RapidAPI vs Free server)
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    // If using RapidAPI endpoint
    if (apiEndpoint.includes("rapidapi.com")) {
      headers["X-RapidAPI-Host"] = apiEndpoint.replace("https://", "").split("/")[0];
      headers["X-RapidAPI-Key"] = apiKey;
    }

    // Submit request to Judge0
    const submissionBody = JSON.stringify({
      source_code: encodeBase64(code),
      language_id: langId,
      stdin: encodeBase64(stdin),
      redirect_stderr_to_stdout: true
    });

    const response = await fetch(`${apiEndpoint}/submissions?base64_encoded=true&wait=false`, {
      method: "POST",
      headers: headers,
      body: submissionBody
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || `Failed to connect. HTTP Status: ${response.status}`);
    }

    const { token } = await response.json();
    
    // Poll Judge0 for results
    pollSubmission(token, headers);

  } catch (error) {
    console.error("Submission error: ", error);
    DOM.outputConsole.innerHTML = `<span class="text-rose-500 font-semibold">[Connection Error]</span>\n${error.message}\n\n💡 Tip: Please check your Internet Connection or Settings Modal config.`;
    DOM.statusBadge.textContent = "Error";
    DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30";
    
    isExecuting = false;
    toggleExecutionUI(false);
  }
}

// Polling Loop
async function pollSubmission(token, headers) {
  const maxAttempts = 15;
  let attempts = 0;
  
  const pollInterval = setInterval(async () => {
    attempts++;
    
    if (attempts > maxAttempts) {
      clearInterval(pollInterval);
      DOM.outputConsole.innerHTML = `<span class="text-rose-500 font-semibold">[Timeout Error]</span>\nExecution exceeded standard queue wait times. Please try again.`;
      DOM.statusBadge.textContent = "Timeout";
      DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30";
      
      isExecuting = false;
      toggleExecutionUI(false);
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

      // Status IDs: 1 (In Queue), 2 (Processing), other numbers are resolved states
      if (statusId > 2) {
        clearInterval(pollInterval);
        displayExecutionResult(result);
        isExecuting = false;
        toggleExecutionUI(false);
      }

    } catch (error) {
      clearInterval(pollInterval);
      DOM.outputConsole.innerHTML = `<span class="text-rose-500 font-semibold">[Polling Error]</span>\n${error.message}`;
      DOM.statusBadge.textContent = "Error";
      DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30";
      
      isExecuting = false;
      toggleExecutionUI(false);
    }
  }, 1500);
}

// Display outputs from Judge0
function displayExecutionResult(result) {
  const stdout = result.stdout ? decodeBase64(result.stdout) : "";
  const stderr = result.stderr ? decodeBase64(result.stderr) : "";
  const compileOutput = result.compile_output ? decodeBase64(result.compile_output) : "";
  const status = result.status || {};
  
  // Reset Console output HTML
  DOM.outputConsole.innerHTML = "";
  
  // Status Code updates
  DOM.statusBadge.textContent = status.description || "Success";
  DOM.timeIndicator.textContent = result.time ? `${result.time}s` : "0.00s";
  DOM.memoryIndicator.textContent = result.memory ? `${(result.memory / 1024).toFixed(2)} MB` : "0.0 MB";

  if (status.id === 3) {
    // Accepted / Success
    DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    
    if (stdout.trim() === "") {
      DOM.outputConsole.innerHTML = '<span class="text-slate-400 italic">[Execution finished. No standard output was printed]</span>';
    } else {
      // Escape HTML entities to prevent XSS in output rendering
      const escapedStdout = stdout
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      DOM.outputConsole.innerHTML = escapedStdout;
    }
  } else {
    // Compilation Error, Runtime Error, Time Limit Exceeded, etc.
    DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30";
    
    let errorLog = "";
    if (compileOutput) errorLog += compileOutput;
    if (stderr) errorLog += (errorLog ? "\n" : "") + stderr;
    if (stdout) errorLog += (errorLog ? "\n" : "") + stdout;

    if (!errorLog) {
      errorLog = `Execution terminated with Status Code ${status.id} (${status.description}).`;
    }

    const escapedErrorLog = errorLog
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    DOM.outputConsole.innerHTML = `<span class="text-rose-500 font-bold">Error: ${status.description}</span>\n\n<span class="text-rose-400 font-mono">${escapedErrorLog}</span>`;
  }

  // Append a blinking cursor at the end
  DOM.outputConsole.innerHTML += '<span class="terminal-cursor"></span>';
  
  // Scroll to bottom
  DOM.outputConsole.scrollTop = DOM.outputConsole.scrollHeight;
}

// Toggle loading states for UI buttons
function toggleExecutionUI(loading) {
  if (loading) {
    DOM.runBtn.disabled = true;
    DOM.runBtn.classList.add("opacity-75", "pulse-glow");
    DOM.runIcon.classList.add("hidden");
    DOM.runSpinner.classList.remove("hidden");
    DOM.runText.textContent = "Compiling...";
  } else {
    DOM.runBtn.disabled = false;
    DOM.runBtn.classList.remove("opacity-75", "pulse-glow");
    DOM.runIcon.classList.remove("hidden");
    DOM.runSpinner.classList.add("hidden");
    DOM.runText.textContent = "Run Code";
  }
}

// --- Action Handlers ---
function clearConsole() {
  DOM.outputConsole.innerHTML = '<span class="text-slate-500">Console cleared. Ready to compile.</span><span class="terminal-cursor"></span>';
  DOM.statusBadge.textContent = "Idle";
  DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30";
  DOM.timeIndicator.textContent = "-";
  DOM.memoryIndicator.textContent = "-";
  showToast("Console cleared", "info");
}

function copyCodeToClipboard() {
  const code = editor ? editor.getValue() : "";
  if (!code.trim()) {
    showToast("Editor is empty!", "error");
    return;
  }
  
  navigator.clipboard.writeText(code).then(() => {
    showToast("Code copied to clipboard", "success");
  }).catch(err => {
    console.error("Clipboard copy error: ", err);
    showToast("Failed to copy code", "error");
  });
}

function downloadCodeFile() {
  const code = editor ? editor.getValue() : "";
  if (!code.trim()) {
    showToast("Nothing to download!", "error");
    return;
  }

  const lang = LANGUAGES[currentLanguage];
  const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `codeverse_main.${lang.extension}`;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(`Downloaded codeverse_main.${lang.extension}`, "success");
}

// --- Settings Dialog Handlers ---
function openSettings() {
  DOM.apiUrlInput.value = apiEndpoint;
  DOM.apiKeyInput.value = apiKey;
  DOM.settingsModal.classList.remove("hidden");
  DOM.settingsModal.classList.add("flex");
}

function closeSettings() {
  DOM.settingsModal.classList.remove("flex");
  DOM.settingsModal.classList.add("hidden");
}

function saveSettings() {
  const newUrl = DOM.apiUrlInput.value.trim() || DEFAULT_API_URL;
  const newKey = DOM.apiKeyInput.value.trim();

  apiEndpoint = newUrl;
  apiKey = newKey;

  localStorage.setItem("codeverse_api_url", apiEndpoint);
  localStorage.setItem("codeverse_api_key", apiKey);

  closeSettings();
  showToast("Settings updated successfully", "success");
}

// --- Language Selector Handlers ---
function handleLanguageChange(event) {
  const nextLang = event.target.value;
  if (!LANGUAGES[nextLang]) return;

  // Save current code before changing languages
  if (editor) {
    localStorage.setItem(`codeverse_code_${currentLanguage}`, editor.getValue());
  }

  currentLanguage = nextLang;
  localStorage.setItem("codeverse_lang", currentLanguage);
  updateLanguageBadge();

  // Retrieve code for the new language, fallback to starter template
  const newLangCode = localStorage.getItem(`codeverse_code_${currentLanguage}`) || LANGUAGES[currentLanguage].defaultCode;

  if (editor) {
    editor.setValue(newLangCode);
    
    // Update monaco model language
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, LANGUAGES[currentLanguage].monacoId);
    }
  }

  showToast(`Language switched to ${LANGUAGES[currentLanguage].name}`);
}

// --- App Event Listeners ---
function registerEventListeners() {
  // Theme Toggle
  DOM.themeToggleBtn.addEventListener("click", toggleTheme);
  
  // Actions
  DOM.runBtn.addEventListener("click", runCode);
  DOM.clearBtn.addEventListener("click", clearConsole);
  DOM.copyBtn.addEventListener("click", copyCodeToClipboard);
  DOM.downloadBtn.addEventListener("click", downloadCodeFile);
  
  // Modal Actions
  DOM.settingsBtn.addEventListener("click", openSettings);
  DOM.closeSettingsBtn.addEventListener("click", closeSettings);
  DOM.saveSettingsBtn.addEventListener("click", saveSettings);
  DOM.settingsModal.addEventListener("click", (e) => {
    if (e.target === DOM.settingsModal) closeSettings();
  });

  // Language Dropdown
  DOM.langSelect.addEventListener("change", handleLanguageChange);

  // Setup Hotkeys (Ctrl+Enter to run code)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runCode();
    }
  });
}

// --- Application Bootstrapping ---
function initApp() {
  initTheme();
  registerEventListeners();
  updateLanguageBadge();
  initMonaco();
  
  // Set initial selected value in dropdown matching local storage
  DOM.langSelect.value = currentLanguage;

  console.log(`${REPO_NAME} Initialized Successfully!`);
}

// Boot the app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", initApp);
