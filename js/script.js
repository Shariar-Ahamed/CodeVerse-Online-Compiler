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

using namespace std;

int main() {
    cout << "Hello, World! Welcome to CodeVerse C++ Environment." << endl;
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
  },
  csharp: {
    id: 51, // C# (Mono 6.6.0)
    name: "C#",
    monacoId: "csharp",
    extension: "cs",
    badgeClass: "badge-csharp",
    defaultCode: `using System;

class Program {
    static void Main(string[] args) {
        Console.Write("Enter your name: ");
        string name = Console.ReadLine();
        if (!string.IsNullOrEmpty(name)) {
            Console.WriteLine($"Hello, {name}! Welcome to CodeVerse C# Environment.");
        } else {
            Console.WriteLine("Hello, World! Welcome to CodeVerse C#.");
        }
    }
}`
  },
  go: {
    id: 60, // Go (1.13.5)
    name: "Go (Golang)",
    monacoId: "go",
    extension: "go",
    badgeClass: "badge-go",
    defaultCode: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

func main() {
    reader := bufio.NewReader(os.Stdin)
    fmt.Print("Enter your name: ")
    name, _ := reader.ReadString('\n')
    name = strings.TrimSpace(name)
    
    if name != "" {
        fmt.Printf("Hello, %s! Welcome to CodeVerse Go Compiler.\\n", name)
    } else {
        fmt.Println("Hello, World! Welcome to CodeVerse Go.")
    }
}`
  },
  rust: {
    id: 73, // Rust (1.40.0)
    name: "Rust",
    monacoId: "rust",
    extension: "rs",
    badgeClass: "badge-rust",
    defaultCode: `use std::io::{self, Write};

fn main() {
    print!("Enter your name: ");
    io::stdout().flush().unwrap();
    
    let mut name = String::new();
    io::stdin().read_line(&mut name).unwrap();
    let name = name.trim();
    
    if !name.is_empty() {
        println!("Hello, {}! Welcome to CodeVerse Rust Environment.", name);
    } else {
        println!("Hello, World! Welcome to CodeVerse Rust.");
    }
}`
  },
  typescript: {
    id: 74, // TypeScript (3.7.4)
    name: "TypeScript",
    monacoId: "typescript",
    extension: "ts",
    badgeClass: "badge-typescript",
    defaultCode: `// TypeScript Execution Environment
interface User {
    name: string;
    isAdmin: boolean;
}

function greetUser(user: User): string {
    return \`Hello, \${user.name}! Welcome to CodeVerse TypeScript Playground. Admin status: \${user.isAdmin}\`;
}

const guest: User = { name: "Developer", isAdmin: true };
console.log(greetUser(guest));`
  },
  ruby: {
    id: 72, // Ruby (2.7.0)
    name: "Ruby",
    monacoId: "ruby",
    extension: "rb",
    badgeClass: "badge-ruby",
    defaultCode: `# Ruby execution code
print "Enter your name: "
name = gets.chomp

if !name.empty?
  puts "Hello, #{name}! Welcome to CodeVerse Ruby Compiler."
else
  puts "Hello, World! Welcome to CodeVerse Ruby."
end`
  },
  swift: {
    id: 83, // Swift (5.1.4)
    name: "Swift",
    monacoId: "swift",
    extension: "swift",
    badgeClass: "badge-swift",
    defaultCode: `import Foundation

// Swift execution console
print("Enter your name: ", terminator: "")
if let name = readLine(), !name.isEmpty {
    print("Hello, \\(name)! Welcome to CodeVerse Swift Environment.")
} else {
    print("Hello, World! Welcome to CodeVerse Swift.")
}`
  },
  kotlin: {
    id: 78, // Kotlin (1.3.70)
    name: "Kotlin",
    monacoId: "kotlin",
    extension: "kt",
    badgeClass: "badge-kotlin",
    defaultCode: `import java.util.Scanner

fun main(args: Array<String>) {
    val scanner = Scanner(System.\`in\`)
    print("Enter your name: ")
    if (scanner.hasNextLine()) {
        val name = scanner.nextLine()
        println("Hello, $name! Welcome to CodeVerse Kotlin Environment.")
    } else {
        println("Hello, World! Welcome to CodeVerse Kotlin.")
    }
}`
  },
  sql: {
    id: 82, // SQL (SQLite 3.31.1)
    name: "SQL (SQLite)",
    monacoId: "sql",
    extension: "sql",
    badgeClass: "badge-sql",
    defaultCode: `-- SQL Database script execution (SQLite)
CREATE TABLE developers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    language TEXT NOT NULL
);

INSERT INTO developers (name, language) VALUES ('Shariar', 'C++');
INSERT INTO developers (name, language) VALUES ('Developer', 'Python');
INSERT INTO developers (name, language) VALUES ('Guest', 'Rust');

SELECT * FROM developers WHERE id > 0;`
  },
  scala: {
    id: 81, // Scala (2.13.0)
    name: "Scala",
    monacoId: "scala",
    extension: "scala",
    badgeClass: "badge-scala",
    defaultCode: `object Main {
  def main(args: Array[String]): Unit = {
    println("Hello, CodeVerse Scala Environment!")
  }
}`
  },
  objectivec: {
    id: 79, // Objective-C (Clang 7.0.1)
    name: "Objective-C",
    monacoId: "objective-c",
    extension: "m",
    badgeClass: "badge-objectivec",
    defaultCode: `#import <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSLog(@"Hello, CodeVerse Objective-C Workspace!");
    }
    return 0;
}`
  },
  haskell: {
    id: 61, // Haskell (GHC 8.8.1)
    name: "Haskell",
    monacoId: "haskell",
    extension: "hs",
    badgeClass: "badge-haskell",
    defaultCode: `main :: IO ()
main = putStrLn "Hello, CodeVerse Haskell Workspace!"`
  },
  pascal: {
    id: 67, // Pascal (FPC 3.0.4)
    name: "Pascal",
    monacoId: "pascal",
    extension: "pas",
    badgeClass: "badge-pascal",
    defaultCode: `program HelloWorld;
begin
  writeln('Hello, CodeVerse Pascal Environment!');
end.`
  },
  perl: {
    id: 85, // Perl (5.28.1)
    name: "Perl",
    monacoId: "perl",
    extension: "pl",
    badgeClass: "badge-perl",
    defaultCode: `use strict;
use warnings;

print "Hello, CodeVerse Perl Console!\\n";`
  },
  r: {
    id: 80, // R (3.6.1)
    name: "R",
    monacoId: "r",
    extension: "r",
    badgeClass: "badge-r",
    defaultCode: `cat("Hello, CodeVerse R Workspace!\\n")`
  },
  lisp: {
    id: 55, // Lisp (SBCL 2.0.0)
    name: "Lisp",
    monacoId: "lisp",
    extension: "lisp",
    badgeClass: "badge-lisp",
    defaultCode: `(format t "Hello, CodeVerse Common Lisp Workspace!~%")`
  },
  fortran: {
    id: 59, // Fortran (GFortran 9.2.0)
    name: "Fortran",
    monacoId: "fortran",
    extension: "f90",
    badgeClass: "badge-fortran",
    defaultCode: `program hello
  print *, "Hello, CodeVerse Fortran Workspace!"
end program hello`
  },
  lua: {
    id: 64, // Lua (5.3.5)
    name: "Lua",
    monacoId: "lua",
    extension: "lua",
    badgeClass: "badge-lua",
    defaultCode: `print("Hello, CodeVerse Lua Script Console!")`
  },
  assembly: {
    id: 45, // Assembly (NASM 2.14.02)
    name: "Assembly",
    monacoId: "assembly",
    extension: "asm",
    badgeClass: "badge-assembly",
    defaultCode: `section .data
    msg db 'Hello, CodeVerse Assembly!', 0xa
    len equ $ - msg

section .text
    global _start

_start:
    mov edx, len
    mov ecx, msg
    mov ebx, 1
    mov eax, 4
    int 0x80

    mov ebx, 0
    mov eax, 1
    int 0x80`
  },
  elixir: {
    id: 57, // Elixir (1.9.4)
    name: "Elixir",
    monacoId: "elixir",
    extension: "ex",
    badgeClass: "badge-elixir",
    defaultCode: `IO.puts "Hello, CodeVerse Elixir Console!"`
  },
  erlang: {
    id: 58, // Erlang (OTP 22.2)
    name: "Erlang",
    monacoId: "erlang",
    extension: "erl",
    badgeClass: "badge-erlang",
    defaultCode: `-module(main).
-export([start/0]).

start() ->
    io:fwrite("Hello, CodeVerse Erlang Console!\\n").`
  },
  clojure: {
    id: 86, // Clojure (1.10.1)
    name: "Clojure",
    monacoId: "clojure",
    extension: "clj",
    badgeClass: "badge-clojure",
    defaultCode: `(println "Hello, CodeVerse Clojure Workspace!")`
  },
  d: {
    id: 56, // D (DMD 2.089.1)
    name: "D",
    monacoId: "d",
    extension: "d",
    badgeClass: "badge-d",
    defaultCode: `import std.stdio;

void main() {
    writeln("Hello, CodeVerse D Workspace!");
}`
  },
  html: {
    id: "html",
    name: "HTML/CSS/JS",
    monacoId: "html",
    extension: "html",
    badgeClass: "badge-html",
    defaultCode: `<!-- HTML Structure -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeVerse Live Preview</title>
</head>
<body>
    <div class="card">
        <h1>Welcome to CodeVerse!</h1>
        <p>This is a live frontend development playground.</p>
        <button id="btn">Click Me!</button>
    </div>
</body>
</html>`
  }
};

// --- Web Lab Default Templates ---
const DEFAULT_WEB_CSS = `/* CSS Styles */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #1e1e38 0%, #0d0d1a 100%);
    color: #ffffff;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
}

.card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    border-left: 1px solid rgba(255, 255, 255, 0.15);
}

h1 {
    margin-top: 0;
    background: linear-gradient(to right, #a5b4fc, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 2rem;
}

p {
    color: #cbd5e1;
    margin-bottom: 20px;
}

button {
    background: #6366f1;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.2s ease;
}

button:hover {
    background: #4f46e5;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

button:active {
    transform: translateY(1px);
}`;

const DEFAULT_WEB_JS = `// JavaScript logic
console.log("Hello from CodeVerse Web Lab!");

const btn = document.getElementById("btn");
if (btn) {
    btn.addEventListener("click", () => {
        console.log("Button clicked!");
        alert("Welcome to the CodeVerse Frontend Playground!");
    });
}`;

// --- Application State ---
let editor = null;
let currentLanguage = localStorage.getItem("codeverse_lang") || "cpp";
let apiEndpoint = localStorage.getItem("codeverse_api_url") || DEFAULT_API_URL;
let apiKey = localStorage.getItem("codeverse_api_key") || "";
let isExecuting = false;

// --- Web Lab State & Models ---
let webLabModels = {
  html: null,
  css: null,
  js: null
};
let activeWebTab = localStorage.getItem("codeverse_web_active_tab") || "html";

function ensureWebLabModelsCreated() {
  if (typeof monaco === 'undefined') return;
  
  if (!webLabModels.html) {
    const savedHtml = localStorage.getItem("codeverse_code_html") || LANGUAGES.html.defaultCode;
    webLabModels.html = monaco.editor.createModel(savedHtml, "html");
    webLabModels.html.onDidChangeContent(() => {
      localStorage.setItem("codeverse_code_html", webLabModels.html.getValue());
    });
  }
  if (!webLabModels.css) {
    const savedCss = localStorage.getItem("codeverse_web_css") || DEFAULT_WEB_CSS;
    webLabModels.css = monaco.editor.createModel(savedCss, "css");
    webLabModels.css.onDidChangeContent(() => {
      localStorage.setItem("codeverse_web_css", webLabModels.css.getValue());
    });
  }
  if (!webLabModels.js) {
    const savedJs = localStorage.getItem("codeverse_web_js") || DEFAULT_WEB_JS;
    webLabModels.js = monaco.editor.createModel(savedJs, "javascript");
    webLabModels.js.onDidChangeContent(() => {
      localStorage.setItem("codeverse_web_js", webLabModels.js.getValue());
    });
  }
}

function toggleWebLabView(show) {
  if (show) {
    if (DOM.webEditorTabs) DOM.webEditorTabs.classList.remove("hidden");
    if (DOM.editorTitleContainer) DOM.editorTitleContainer.classList.add("hidden");
    if (DOM.stdinContainer) DOM.stdinContainer.classList.add("hidden");
    if (DOM.consoleOutputContainer) DOM.consoleOutputContainer.classList.add("hidden");
    if (DOM.previewContainer) DOM.previewContainer.classList.remove("hidden");
    
    if (DOM.consoleHeaderTitle) DOM.consoleHeaderTitle.textContent = "Live Preview";
    if (DOM.consoleHeaderIcon) {
      DOM.consoleHeaderIcon.className = "fas fa-eye text-indigo-400 text-xs";
    }
    if (DOM.statusBadge) {
      DOM.statusBadge.textContent = "Web Sandbox";
      DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
    }
    
    updateWebTabUI();
  } else {
    if (DOM.webEditorTabs) DOM.webEditorTabs.classList.add("hidden");
    if (DOM.editorTitleContainer) DOM.editorTitleContainer.classList.remove("hidden");
    if (DOM.stdinContainer) DOM.stdinContainer.classList.remove("hidden");
    if (DOM.consoleOutputContainer) DOM.consoleOutputContainer.classList.remove("hidden");
    if (DOM.previewContainer) DOM.previewContainer.classList.add("hidden");
    
    if (DOM.consoleHeaderTitle) DOM.consoleHeaderTitle.textContent = "Output Console";
    if (DOM.consoleHeaderIcon) {
      DOM.consoleHeaderIcon.className = "fas fa-terminal text-emerald-400 text-xs";
    }
    if (DOM.statusBadge) {
      DOM.statusBadge.textContent = "Idle";
      DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30";
    }
  }
}

function updateWebTabUI() {
  const tabs = ["html", "css", "js"];
  tabs.forEach(t => {
    const tabEl = document.getElementById(`tab-${t}`);
    if (tabEl) {
      if (t === activeWebTab) {
        tabEl.className = "px-2.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-600 text-white transition-all duration-200";
      } else {
        tabEl.className = "px-2.5 py-0.5 rounded text-[10px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200";
      }
    }
  });
}

function switchWebTab(tabName) {
  if (tabName !== "html" && tabName !== "css" && tabName !== "js") return;
  activeWebTab = tabName;
  localStorage.setItem("codeverse_web_active_tab", activeWebTab);
  
  ensureWebLabModelsCreated();
  
  if (editor && webLabModels[activeWebTab]) {
    editor.setModel(webLabModels[activeWebTab]);
  }
  
  updateWebTabUI();
}

// --- Platform Routing and Views ---
function showEditorView(langKey = "cpp") {
  if (DOM.homeView) DOM.homeView.classList.add("hidden");
  if (DOM.editorView) DOM.editorView.classList.remove("hidden");
  
  if (langKey && LANGUAGES[langKey]) {
    DOM.langSelect.value = langKey;
    handleLanguageChange({ target: { value: langKey } });
  }
  
  if (editor) {
    editor.layout();
  }
  
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHomeView(targetSectionId = null) {
  if (DOM.editorView) DOM.editorView.classList.add("hidden");
  if (DOM.homeView) DOM.homeView.classList.remove("hidden");
  
  if (targetSectionId) {
    const el = document.getElementById(targetSectionId);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }
  }
  
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- Live Auto-Typing Simulation Engine ---
const DEMO_SNIPPETS = [
  {
    tab: "main.cpp",
    code: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, CodeVerse C++!" << std::endl;\n    return 0;\n}`,
    console: "Hello, CodeVerse C++!\n\n[Process completed with exit code 0]",
    status: "Accepted",
    time: "0.04s"
  },
  {
    tab: "script.py",
    code: `# Python Factorial function\ndef factorial(n):\n    return 1 if n <= 1 else n * factorial(n - 1)\n\nprint("Factorial of 5:", factorial(5))`,
    console: "Factorial of 5: 120\n\n[Process completed with exit code 0]",
    status: "Accepted",
    time: "0.02s"
  },
  {
    tab: "index.html",
    code: `<!-- Live Web Layout Preview -->\n<div style="background:#4f46e5;color:white;padding:15px;border-radius:10px">\n   <h3>HTML Visual workbench</h3>\n   <p>Interactive preview render works!</p>\n</div>`,
    console: "Web Sandbox Loaded.\nViewport: Rendered HTML/CSS/JS Sandbox Visuals successfully.",
    status: "Web Sandbox",
    time: "0.00s"
  }
];

let currentDemoIndex = 0;
let demoTypingInterval = null;

function startDemoAnimation() {
  const demoTabName = document.getElementById("demo-tab-name");
  const demoEditorText = document.getElementById("demo-editor-text");
  const demoConsoleText = document.getElementById("demo-console-text");
  
  if (!demoTabName || !demoEditorText || !demoConsoleText) return;
  
  function typeNextSnippet() {
    const snippet = DEMO_SNIPPETS[currentDemoIndex];
    demoTabName.textContent = snippet.tab;
    demoEditorText.textContent = "";
    demoConsoleText.textContent = "Compiling processes...";
    
    let charIndex = 0;
    clearInterval(demoTypingInterval);
    
    demoTypingInterval = setInterval(() => {
      if (charIndex < snippet.code.length) {
        demoEditorText.textContent += snippet.code.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(demoTypingInterval);
        setTimeout(() => {
          demoConsoleText.textContent = snippet.console;
          setTimeout(() => {
            eraseSnippet();
          }, 4000);
        }, 800);
      }
    }, 30);
  }
  
  function eraseSnippet() {
    let currentText = demoEditorText.textContent;
    clearInterval(demoTypingInterval);
    
    demoTypingInterval = setInterval(() => {
      if (currentText.length > 0) {
        currentText = currentText.substring(0, currentText.length - 1);
        demoEditorText.textContent = currentText;
      } else {
        clearInterval(demoTypingInterval);
        currentDemoIndex = (currentDemoIndex + 1) % DEMO_SNIPPETS.length;
        setTimeout(typeNextSnippet, 500);
      }
    }, 15);
  }
  
  typeNextSnippet();
}

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
  apiKeyInput: document.getElementById("api-key-input"),
  
  // Web Lab DOM Elements
  webEditorTabs: document.getElementById("web-editor-tabs"),
  tabHtml: document.getElementById("tab-html"),
  tabCss: document.getElementById("tab-css"),
  tabJs: document.getElementById("tab-js"),
  editorTitleContainer: document.getElementById("editor-title-container"),
  stdinContainer: document.getElementById("stdin-container"),
  consoleOutputContainer: document.getElementById("console-output-container"),
  previewContainer: document.getElementById("preview-container"),
  previewFrame: document.getElementById("preview-frame"),
  webConsoleLogs: document.getElementById("web-console-logs"),
  clearWebConsoleBtn: document.getElementById("clear-web-console"),
  consoleHeaderTitle: document.getElementById("console-header-title"),
  consoleHeaderIcon: document.getElementById("console-header-icon"),
  
  // Landing Page DOM Elements
  homeView: document.getElementById("home-view"),
  editorView: document.getElementById("editor-view"),
  brandLogo: document.getElementById("brand-logo"),
  navCtaBtn: document.getElementById("nav-cta-btn"),
  mobileMenuBtn: document.getElementById("mobile-menu-btn"),
  mobileNav: document.getElementById("mobile-nav"),
  heroStartBtn: document.getElementById("hero-start-btn"),
  backHomeBtn: document.getElementById("back-home-btn"),
  mobileNavCta: document.getElementById("mobile-nav-cta"),
  contactForm: document.getElementById("contact-form")
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
        { token: 'annotation', foreground: 'ffb86c' },
        
        // HTML rules
        { token: 'tag', foreground: 'ff79c6' },
        { token: 'tag.id', foreground: '50fa7b' },
        { token: 'tag.class', foreground: '50fa7b' },
        { token: 'attribute.name', foreground: '50fa7b' },
        { token: 'attribute.value', foreground: 'f1fa8c' },
        { token: 'metatag', foreground: 'ff79c6' },
        { token: 'metatag.content', foreground: 'f8f8f2' },

        // CSS rules
        { token: 'tag.css', foreground: 'ff79c6' },
        { token: 'keyword.css', foreground: 'ff79c6' },
        { token: 'property.css', foreground: '50fa7b' },
        { token: 'attribute.value.css', foreground: 'f1fa8c' },
        { token: 'number.css', foreground: 'bd93f9' },
        { token: 'attribute.value.unit.css', foreground: 'bd93f9' },
        { token: 'attribute.value.hex.css', foreground: 'bd93f9' },

        // JSON rules
        { token: 'string.key.json', foreground: '8be9fd' },
        { token: 'string.value.json', foreground: 'f1fa8c' }
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
    if (currentLanguage === "html") {
      ensureWebLabModelsCreated();
      
      editor = monaco.editor.create(document.getElementById('editor-container'), {
        model: webLabModels[activeWebTab],
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
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        padding: { top: 12, bottom: 12 },
        roundedSelection: true,
        selectOnLineNumbers: true
      });
      
      toggleWebLabView(true);
    } else {
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
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        padding: { top: 12, bottom: 12 },
        roundedSelection: true,
        selectOnLineNumbers: true
      });

      // Auto-save code to localStorage when changed
      editor.onDidChangeModelContent(() => {
        localStorage.setItem(`codeverse_code_${currentLanguage}`, editor.getValue());
      });
    }
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

function renderWebLabPreview() {
  if (!DOM.previewFrame || !DOM.webConsoleLogs) return;
  
  // Clear logs on run
  DOM.webConsoleLogs.innerHTML = "";
  
  ensureWebLabModelsCreated();
  
  const htmlContent = webLabModels.html.getValue();
  const cssContent = webLabModels.css.getValue();
  const jsContent = webLabModels.js.getValue();
  
  // Custom console interception script to inject into iframe
  const consoleInterceptionScript = `
    <script>
      (function() {
        const _log = console.log;
        const _error = console.error;
        const _warn = console.warn;
        
        function sendLog(type, args) {
          window.parent.postMessage({
            source: "codeverse-preview",
            type: type,
            args: Array.from(args).map(arg => {
              if (arg instanceof HTMLElement) {
                return arg.outerHTML;
              }
              try {
                // If it can serialize to json or string
                return typeof arg === "object" ? JSON.stringify(arg) : arg;
              } catch(e) {
                return String(arg);
              }
            })
          }, "*");
        }
        
        console.log = function() {
          sendLog("info", arguments);
          _log.apply(console, arguments);
        };
        
        console.error = function() {
          sendLog("error", arguments);
          _error.apply(console, arguments);
        };
        
        console.warn = function() {
          sendLog("warn", arguments);
          _warn.apply(console, arguments);
        };
        
        window.onerror = function(message, source, lineno, colno, error) {
          sendLog("error", [message + " (at line " + lineno + ":" + colno + ")"]);
          return false;
        };
      })();
    </script>
  `;
  
  // Build final HTML document to insert
  let combinedContent = "";
  
  const scriptToInject = consoleInterceptionScript + `\n<style>\n${cssContent}\n</style>\n`;
  
  if (htmlContent.includes("</head>")) {
    combinedContent = htmlContent.replace("</head>", `${scriptToInject}</head>`);
  } else if (htmlContent.includes("<body>")) {
    combinedContent = htmlContent.replace("<body>", `<head>${scriptToInject}</head><body>`);
  } else {
    combinedContent = `${scriptToInject}\n${htmlContent}`;
  }
  
  const jsToInject = `\n<script>\n${jsContent}\n</script>\n`;
  if (combinedContent.includes("</body>")) {
    combinedContent = combinedContent.replace("</body>", `${jsToInject}</body>`);
  } else {
    combinedContent = `${combinedContent}\n${jsToInject}`;
  }
  
  DOM.previewFrame.srcdoc = combinedContent;
  showToast("Web preview updated!", "success");
}

// --- Judge0 Code Execution Logic ---
async function runCode() {
  if (currentLanguage === "html") {
    renderWebLabPreview();
    return;
  }

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

  // Append cursor & scroll
  DOM.outputConsole.innerHTML += '<span class="terminal-cursor"></span>';
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
  if (currentLanguage === "html") {
    clearWebConsole();
    showToast("Web console cleared", "info");
    return;
  }
  
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

  let fileName = `codeverse_main.${LANGUAGES[currentLanguage].extension}`;
  if (currentLanguage === "html") {
    if (activeWebTab === "html") fileName = "index.html";
    if (activeWebTab === "css") fileName = "style.css";
    if (activeWebTab === "js") fileName = "script.js";
  }

  const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${fileName}`, "success");
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
    if (currentLanguage !== "html") {
      localStorage.setItem(`codeverse_code_${currentLanguage}`, editor.getValue());
    }
  }

  const prevLang = currentLanguage;
  currentLanguage = nextLang;
  localStorage.setItem("codeverse_lang", currentLanguage);
  updateLanguageBadge();

  if (currentLanguage === "html") {
    // Switching to Web Lab
    ensureWebLabModelsCreated();
    toggleWebLabView(true);
    if (editor) {
      editor.setModel(webLabModels[activeWebTab]);
    }
  } else {
    // Switching to backend compiler languages
    if (prevLang === "html") {
      toggleWebLabView(false);
    }
    
    // Retrieve code for the new language, fallback to starter template
    const newLangCode = localStorage.getItem(`codeverse_code_${currentLanguage}`) || LANGUAGES[currentLanguage].defaultCode;

    if (editor) {
      const oldModel = editor.getModel();
      const newModel = monaco.editor.createModel(newLangCode, LANGUAGES[currentLanguage].monacoId);
      editor.setModel(newModel);
      
      // Auto-save changes for this single model
      newModel.onDidChangeContent(() => {
        localStorage.setItem(`codeverse_code_${currentLanguage}`, newModel.getValue());
      });
      
      // Clean up the old model if it was a temporary non-web model to prevent memory leaks
      if (oldModel && oldModel !== webLabModels.html && oldModel !== webLabModels.css && oldModel !== webLabModels.js) {
        oldModel.dispose();
      }
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

  // Web Lab Tab Clicks
  if (DOM.tabHtml) DOM.tabHtml.addEventListener("click", () => switchWebTab("html"));
  if (DOM.tabCss) DOM.tabCss.addEventListener("click", () => switchWebTab("css"));
  if (DOM.tabJs) DOM.tabJs.addEventListener("click", () => switchWebTab("js"));
  if (DOM.clearWebConsoleBtn) DOM.clearWebConsoleBtn.addEventListener("click", clearWebConsole);

  // Catch log messages from Web Lab Preview Iframe
  window.addEventListener("message", (e) => {
    if (e.data && e.data.source === "codeverse-preview") {
      appendWebLog(e.data.type, e.data.args);
    }
  });

  // Platform Navigation & View Controls
  if (DOM.brandLogo) DOM.brandLogo.addEventListener("click", () => showHomeView());
  if (DOM.navCtaBtn) DOM.navCtaBtn.addEventListener("click", () => showEditorView("cpp"));
  if (DOM.heroStartBtn) DOM.heroStartBtn.addEventListener("click", () => showEditorView("cpp"));
  if (DOM.backHomeBtn) DOM.backHomeBtn.addEventListener("click", () => showHomeView());
  if (DOM.mobileNavCta) {
    DOM.mobileNavCta.addEventListener("click", () => {
      if (DOM.mobileNav) DOM.mobileNav.classList.add("hidden");
      showEditorView("cpp");
    });
  }

  // Mobile Hamburger toggler
  if (DOM.mobileMenuBtn) {
    DOM.mobileMenuBtn.addEventListener("click", () => {
      if (DOM.mobileNav) DOM.mobileNav.classList.toggle("hidden");
    });
  }

  // Language Cards Clicking Logic
  const langCards = document.querySelectorAll(".lang-card");
  langCards.forEach(card => {
    card.addEventListener("click", () => {
      const langKey = card.getAttribute("data-lang");
      showEditorView(langKey);
    });
  });

  // Scroll links for Landing page navigation links
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSectionId = link.getAttribute("href").substring(1);
      
      // Close mobile menu if open
      if (DOM.mobileNav) DOM.mobileNav.classList.add("hidden");
      
      showHomeView(targetSectionId);
    });
  });

  // Contact Form Submission
  if (DOM.contactForm) {
    DOM.contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Thank you! Your feedback has been sent.", "success");
      DOM.contactForm.reset();
    });
  }

  // Setup Hotkeys (Ctrl+Enter to run code)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runCode();
    }
  });
}

function clearWebConsole() {
  if (DOM.webConsoleLogs) {
    DOM.webConsoleLogs.innerHTML = `<div class="text-[var(--text-muted)] italic">Console cleared.</div>`;
  }
}

function appendWebLog(type, args) {
  if (!DOM.webConsoleLogs) return;
  
  const placeholder = DOM.webConsoleLogs.querySelector(".italic");
  if (placeholder) placeholder.remove();
  
  const logItem = document.createElement("div");
  logItem.className = `console-log-item console-log-${type}`;
  
  let headerIcon = "fa-circle-info text-blue-400";
  if (type === "error") headerIcon = "fa-circle-xmark text-rose-500";
  if (type === "warn") headerIcon = "fa-triangle-exclamation text-amber-500";
  
  const formattedArgs = args.map(arg => {
    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (err) {
        return String(arg);
      }
    }
    return String(arg);
  }).join(" ");
  
  logItem.innerHTML = `
    <div class="console-log-header">
       <i class="fas ${headerIcon} text-[10px]"></i>
       <span class="text-[9px] font-bold text-[var(--text-muted)] font-mono">${type.toUpperCase()}</span>
    </div>
    <div class="console-log-body">${escapeHtml(formattedArgs)}</div>
  `;
  
  DOM.webConsoleLogs.appendChild(logItem);
  DOM.webConsoleLogs.scrollTop = DOM.webConsoleLogs.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

// --- Application Bootstrapping ---
function initApp() {
  initTheme();
  registerEventListeners();
  updateLanguageBadge();
  initMonaco();
  
  // Set initial selected value in dropdown matching local storage
  DOM.langSelect.value = currentLanguage;

  // Start typing demo loop
  startDemoAnimation();

  console.log(`${REPO_NAME} Initialized Successfully!`);
}

// Boot the app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", initApp);
