/**
 * CodeVerse - Editor / IDE JavaScript Engine
 * Handles Monaco Editor setup, Judge0 API compilation requests, output consoles, and settings
 */

const DEFAULT_API_URL = "https://ce.judge0.com"; // Judge0 CE free instance

// --- Compiler Language Configurations & Boilerplates ---
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
// In batch compilers like Judge0, we read standard input (stdin) synchronously using fs.readFileSync.
const fs = require('fs');

function main() {
    // Read all inputs from standard input (stdin)
    const name = fs.readFileSync(0, 'utf-8').trim();
    
    console.log(\`Hello, \${name || 'World'}! Welcome to CodeVerse Online Compiler.\`);
    
    // Demonstration of calculations
    const result = factorial(5);
    console.log(\`Factorial of 5 is: \${result}\`);
}

function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

main();`
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
    name, _ := reader.ReadString('\\n')
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
-export([main/1]).

main(_Args) ->
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
    padding: 20px;
}

.card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

h1 {
    font-size: 28px;
    margin: 0 0 10px 0;
    background: linear-gradient(45deg, #818cf8, #22d3ee);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

p {
    font-size: 14px;
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

// --- Workspace DOM Mapping ---
const IDE_DOM = {
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
  consoleHeaderIcon: document.getElementById("console-header-icon")
};

// --- Application State ---
let editor = null;
let currentLanguage = localStorage.getItem("codeverse_lang") || "html";
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
    if (IDE_DOM.webEditorTabs) IDE_DOM.webEditorTabs.classList.remove("hidden");
    if (IDE_DOM.editorTitleContainer) IDE_DOM.editorTitleContainer.classList.add("hidden");
    if (IDE_DOM.stdinContainer) IDE_DOM.stdinContainer.classList.add("hidden");
    if (IDE_DOM.consoleOutputContainer) IDE_DOM.consoleOutputContainer.classList.add("hidden");
    if (IDE_DOM.previewContainer) IDE_DOM.previewContainer.classList.remove("hidden");
    
    if (IDE_DOM.consoleHeaderTitle) IDE_DOM.consoleHeaderTitle.textContent = "Live Preview";
    if (IDE_DOM.consoleHeaderIcon) {
      IDE_DOM.consoleHeaderIcon.className = "fas fa-eye text-indigo-400 text-xs";
    }
    if (IDE_DOM.statusBadge) {
      IDE_DOM.statusBadge.textContent = "Web Sandbox";
      IDE_DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
    }
    
    updateWebTabUI();
  } else {
    if (IDE_DOM.webEditorTabs) IDE_DOM.webEditorTabs.classList.add("hidden");
    if (IDE_DOM.editorTitleContainer) IDE_DOM.editorTitleContainer.classList.remove("hidden");
    if (IDE_DOM.stdinContainer) IDE_DOM.stdinContainer.classList.remove("hidden");
    if (IDE_DOM.consoleOutputContainer) IDE_DOM.consoleOutputContainer.classList.remove("hidden");
    if (IDE_DOM.previewContainer) IDE_DOM.previewContainer.classList.add("hidden");
    
    if (IDE_DOM.consoleHeaderTitle) IDE_DOM.consoleHeaderTitle.textContent = "Output Console";
    if (IDE_DOM.consoleHeaderIcon) {
      IDE_DOM.consoleHeaderIcon.className = "fas fa-terminal text-emerald-400 text-xs";
    }
    if (IDE_DOM.statusBadge) {
      IDE_DOM.statusBadge.textContent = "Idle";
      IDE_DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30";
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

// --- Monaco Editor Initialization ---
function initMonaco() {
  require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
  
  require(['vs/editor/editor.main'], function() {
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
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8
        },
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        padding: { top: 12, bottom: 12 }
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
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8
        },
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        padding: { top: 12, bottom: 12 }
      });

      editor.onDidChangeModelContent(() => {
        localStorage.setItem(`codeverse_code_${currentLanguage}`, editor.getValue());
      });
    }
  });
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

// --- Judge0 Execution Logic ---
async function runCode() {
  if (currentLanguage === "html") {
    renderWebLabPreview();
    return;
  }

  if (isExecuting) return;
  
  const code = editor ? editor.getValue() : "";
  if (!code.trim()) {
    if (typeof showToast === 'function') showToast("Please enter some code first!", "error");
    return;
  }

  isExecuting = true;
  toggleExecutionUI(true);
  
  IDE_DOM.outputConsole.innerHTML = '<span class="text-slate-400 animate-pulse">Running compilation processes...</span><span class="terminal-cursor"></span>';
  IDE_DOM.statusBadge.textContent = "Compiling...";
  IDE_DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
  IDE_DOM.timeIndicator.textContent = "-";
  IDE_DOM.memoryIndicator.textContent = "-";

  const stdin = IDE_DOM.stdinArea.value;
  const langId = LANGUAGES[currentLanguage].id;

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
        source_code: encodeBase64(code),
        language_id: langId,
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
    IDE_DOM.outputConsole.innerHTML = `<span class="text-rose-500 font-semibold">[Connection Error]</span>\n${error.message}\n\n💡 Tip: Please check your Internet Connection or Settings Modal config.`;
    IDE_DOM.statusBadge.textContent = "Error";
    IDE_DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30";
    
    isExecuting = false;
    toggleExecutionUI(false);
  }
}

async function pollSubmission(token, headers) {
  const maxAttempts = 15;
  let attempts = 0;
  
  const pollInterval = setInterval(async () => {
    attempts++;
    
    if (attempts > maxAttempts) {
      clearInterval(pollInterval);
      IDE_DOM.outputConsole.innerHTML = `<span class="text-rose-500 font-semibold">[Timeout Error]</span>\nExecution exceeded standard queue wait times. Please try again.`;
      IDE_DOM.statusBadge.textContent = "Timeout";
      IDE_DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30";
      
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

      if (statusId > 2) {
        clearInterval(pollInterval);
        displayExecutionResult(result);
        isExecuting = false;
        toggleExecutionUI(false);
      }

    } catch (error) {
      clearInterval(pollInterval);
      IDE_DOM.outputConsole.innerHTML = `<span class="text-rose-500 font-semibold">[Polling Error]</span>\n${error.message}`;
      IDE_DOM.statusBadge.textContent = "Error";
      IDE_DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30";
      
      isExecuting = false;
      toggleExecutionUI(false);
    }
  }, 1500);
}

function displayExecutionResult(result) {
  const stdout = result.stdout ? decodeBase64(result.stdout) : "";
  const stderr = result.stderr ? decodeBase64(result.stderr) : "";
  const compileOutput = result.compile_output ? decodeBase64(result.compile_output) : "";
  const status = result.status || {};
  
  IDE_DOM.outputConsole.innerHTML = "";
  IDE_DOM.statusBadge.textContent = status.description || "Success";
  IDE_DOM.timeIndicator.textContent = result.time ? `${result.time}s` : "0.00s";
  IDE_DOM.memoryIndicator.textContent = result.memory ? `${(result.memory / 1024).toFixed(2)} MB` : "0.0 MB";

  if (status.id === 3) {
    IDE_DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    
    if (stdout.trim() === "") {
      IDE_DOM.outputConsole.innerHTML = '<span class="text-slate-400 italic">[Execution finished. No standard output was printed]</span>';
    } else {
      const escapedStdout = stdout.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      IDE_DOM.outputConsole.innerHTML = escapedStdout;
    }
  } else {
    IDE_DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30";
    
    let errorLog = "";
    if (compileOutput) errorLog += compileOutput;
    if (stderr) errorLog += (errorLog ? "\n" : "") + stderr;
    if (stdout) errorLog += (errorLog ? "\n" : "") + stdout;

    if (!errorLog) {
      errorLog = `Execution terminated with Status Code ${status.id} (${status.description}).`;
    }

    const escapedErrorLog = errorLog.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    IDE_DOM.outputConsole.innerHTML = `<span class="text-rose-500 font-bold">Error: ${status.description}</span>\n\n<span class="text-rose-400 font-mono">${escapedErrorLog}</span>`;
  }

  IDE_DOM.outputConsole.innerHTML += '<span class="terminal-cursor"></span>';
  IDE_DOM.outputConsole.scrollTop = IDE_DOM.outputConsole.scrollHeight;
}

function toggleExecutionUI(loading) {
  if (loading) {
    IDE_DOM.runBtn.disabled = true;
    IDE_DOM.runBtn.classList.add("opacity-75", "pulse-glow");
    IDE_DOM.runIcon.classList.add("hidden");
    IDE_DOM.runSpinner.classList.remove("hidden");
    IDE_DOM.runText.textContent = "Compiling...";
  } else {
    IDE_DOM.runBtn.disabled = false;
    IDE_DOM.runBtn.classList.remove("opacity-75", "pulse-glow");
    IDE_DOM.runIcon.classList.remove("hidden");
    IDE_DOM.runSpinner.classList.add("hidden");
    IDE_DOM.runText.textContent = "Run Code";
  }
}

// --- Action Button Triggers ---
function clearConsole() {
  if (currentLanguage === "html") {
    clearWebConsole();
    if (typeof showToast === 'function') showToast("Web console cleared", "info");
    return;
  }
  
  IDE_DOM.outputConsole.innerHTML = '<span class="text-slate-500">Console cleared. Ready to compile.</span><span class="terminal-cursor"></span>';
  IDE_DOM.statusBadge.textContent = "Idle";
  IDE_DOM.statusBadge.className = "px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30";
  IDE_DOM.timeIndicator.textContent = "-";
  IDE_DOM.memoryIndicator.textContent = "-";
  if (typeof showToast === 'function') showToast("Console cleared", "info");
}

function copyCodeToClipboard() {
  const code = editor ? editor.getValue() : "";
  if (!code.trim()) {
    if (typeof showToast === 'function') showToast("Editor is empty!", "error");
    return;
  }
  
  navigator.clipboard.writeText(code).then(() => {
    if (typeof showToast === 'function') showToast("Code copied to clipboard", "success");
  }).catch(err => {
    console.error("Clipboard copy error: ", err);
    if (typeof showToast === 'function') showToast("Failed to copy code", "error");
  });
}

function downloadCodeFile() {
  const code = editor ? editor.getValue() : "";
  if (!code.trim()) {
    if (typeof showToast === 'function') showToast("Nothing to download!", "error");
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
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  if (typeof showToast === 'function') showToast(`Downloaded ${fileName}`, "success");
}

// --- Settings Dialog handlers ---
function openSettings() {
  IDE_DOM.apiUrlInput.value = apiEndpoint;
  IDE_DOM.apiKeyInput.value = apiKey;
  IDE_DOM.settingsModal.classList.remove("hidden");
  IDE_DOM.settingsModal.classList.add("flex");
}

function closeSettings() {
  IDE_DOM.settingsModal.classList.remove("flex");
  IDE_DOM.settingsModal.classList.add("hidden");
}

function saveSettings() {
  const newUrl = IDE_DOM.apiUrlInput.value.trim() || DEFAULT_API_URL;
  const newKey = IDE_DOM.apiKeyInput.value.trim();

  apiEndpoint = newUrl;
  apiKey = newKey;

  localStorage.setItem("codeverse_api_url", apiEndpoint);
  localStorage.setItem("codeverse_api_key", apiKey);

  closeSettings();
  if (typeof showToast === 'function') showToast("Settings updated successfully", "success");
}

// --- Compiler Language Selector Event handler ---
function handleLanguageChange(event) {
  const nextLang = event.target.value;
  if (!LANGUAGES[nextLang]) return;

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
    ensureWebLabModelsCreated();
    toggleWebLabView(true);
    if (editor) {
      editor.setModel(webLabModels[activeWebTab]);
    }
  } else {
    if (prevLang === "html") {
      toggleWebLabView(false);
    }
    
    const newLangCode = localStorage.getItem(`codeverse_code_${currentLanguage}`) || LANGUAGES[currentLanguage].defaultCode;

    if (editor) {
      const oldModel = editor.getModel();
      const newModel = monaco.editor.createModel(newLangCode, LANGUAGES[currentLanguage].monacoId);
      editor.setModel(newModel);
      
      newModel.onDidChangeContent(() => {
        localStorage.setItem(`codeverse_code_${currentLanguage}`, newModel.getValue());
      });
      
      if (oldModel && oldModel !== webLabModels.html && oldModel !== webLabModels.css && oldModel !== webLabModels.js) {
        oldModel.dispose();
      }
    }
  }

  if (typeof showToast === 'function') showToast(`Language switched to ${LANGUAGES[currentLanguage].name}`);
}

function updateLanguageBadge() {
  const langConfig = LANGUAGES[currentLanguage];
  if (IDE_DOM.badge) {
    IDE_DOM.badge.className = `px-2 py-0.5 rounded text-xs font-semibold ${langConfig.badgeClass}`;
    IDE_DOM.badge.textContent = langConfig.name;
  }
}

// --- Web Lab Preview Sandbox Render ---
function renderWebLabPreview() {
  ensureWebLabModelsCreated();
  
  const htmlContent = webLabModels.html.getValue();
  const cssContent = webLabModels.css.getValue();
  const jsContent = webLabModels.js.getValue();
  
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
        <style>${cssContent}</style>
        ${iframeLoggerScript}
      </head>
      <body>
        ${htmlContent}
        <script>${jsContent}</script>
      </body>
    </html>
  `;
  
  if (IDE_DOM.previewFrame) {
    const frameDoc = IDE_DOM.previewFrame.contentDocument || IDE_DOM.previewFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(fullDocument);
    frameDoc.close();
  }
  
  // Reset logs
  if (IDE_DOM.webConsoleLogs) IDE_DOM.webConsoleLogs.innerHTML = "";
  if (typeof showToast === 'function') showToast("Web Sandbox preview updated", "success");
}

function clearWebConsole() {
  if (IDE_DOM.webConsoleLogs) {
    IDE_DOM.webConsoleLogs.innerHTML = '<div class="console-log-item console-log-info font-mono text-[10px] italic">Console cleared. Waiting for outputs...</div>';
  }
}

function appendWebLog(type, args) {
  if (!IDE_DOM.webConsoleLogs) return;
  
  // Clear waiting placeholder
  const placeholder = IDE_DOM.webConsoleLogs.querySelector(".italic");
  if (placeholder) {
    IDE_DOM.webConsoleLogs.removeChild(placeholder);
  }
  
  const logItem = document.createElement("div");
  logItem.className = `console-log-item console-log-${type} font-mono text-[11px]`;
  
  let headerIcon = "fa-info-circle";
  if (type === "error") headerIcon = "fa-exclamation-triangle";
  if (type === "warn") headerIcon = "fa-exclamation-circle";
  
  const formattedArgs = args.map(arg => {
    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg);
      } catch(e) {
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
  
  IDE_DOM.webConsoleLogs.appendChild(logItem);
  IDE_DOM.webConsoleLogs.scrollTop = IDE_DOM.webConsoleLogs.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

// --- Setup Workspace Event Bindings ---
function initEditorPage() {
  // Parsing Query Parameters (editor.html?lang=...)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang && LANGUAGES[urlLang]) {
    currentLanguage = urlLang;
    localStorage.setItem("codeverse_lang", currentLanguage);
  }

  // Set initial selected value in dropdown matching local storage
  if (IDE_DOM.langSelect) {
    IDE_DOM.langSelect.value = currentLanguage;
    IDE_DOM.langSelect.addEventListener("change", handleLanguageChange);
  }
  
  updateLanguageBadge();
  initMonaco();

  // Attach button triggers
  if (IDE_DOM.runBtn) IDE_DOM.runBtn.addEventListener("click", runCode);
  if (IDE_DOM.clearBtn) IDE_DOM.clearBtn.addEventListener("click", clearConsole);
  if (IDE_DOM.copyBtn) IDE_DOM.copyBtn.addEventListener("click", copyCodeToClipboard);
  if (IDE_DOM.downloadBtn) IDE_DOM.downloadBtn.addEventListener("click", downloadCodeFile);
  
  if (IDE_DOM.settingsBtn) IDE_DOM.settingsBtn.addEventListener("click", openSettings);
  if (IDE_DOM.closeSettingsBtn) IDE_DOM.closeSettingsBtn.addEventListener("click", closeSettings);
  if (IDE_DOM.saveSettingsBtn) IDE_DOM.saveSettingsBtn.addEventListener("click", saveSettings);
  
  if (IDE_DOM.settingsModal) {
    IDE_DOM.settingsModal.addEventListener("click", (e) => {
      if (e.target === IDE_DOM.settingsModal) closeSettings();
    });
  }

  // Web Lab Tab Clicks
  if (IDE_DOM.tabHtml) IDE_DOM.tabHtml.addEventListener("click", () => switchWebTab("html"));
  if (IDE_DOM.tabCss) IDE_DOM.tabCss.addEventListener("click", () => switchWebTab("css"));
  if (IDE_DOM.tabJs) IDE_DOM.tabJs.addEventListener("click", () => switchWebTab("js"));
  if (IDE_DOM.clearWebConsoleBtn) IDE_DOM.clearWebConsoleBtn.addEventListener("click", clearWebConsole);

  // Catch log messages from Web Lab Preview Iframe
  window.addEventListener("message", (e) => {
    if (e.data && e.data.source === "codeverse-preview") {
      appendWebLog(e.data.type, e.data.args);
    }
  });

  // Handle Monaco Editor resize responsiveness
  window.addEventListener("resize", () => {
    if (editor) {
      editor.layout();
    }
  });
}

document.addEventListener("DOMContentLoaded", initEditorPage);
