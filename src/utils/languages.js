// Pre-configured Compiler Profiles for Judge0 REST Execution engine
export const LANGUAGES = {
  text: {
    id: "text",
    name: "Text Notes",
    desc: "Personal Workspace",
    monacoId: "plaintext",
    extension: "txt",
    badgeClass: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
    icon: "fas fa-file-alt",
    categories: ["popular"],
    defaultCode: ""
  },
  html: {
    id: "html",
    name: "HTML/CSS/JS",
    desc: "Web Lab Preview",
    monacoId: "html",
    extension: "html",
    badgeClass: "bg-orange-500/10 border-orange-500/20 text-orange-500",
    icon: "fab fa-html5",
    categories: ["popular", "web"],
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
  },
  c: {
    id: 103,
    name: "C",
    desc: "GCC 14.1.0 Compiler",
    monacoId: "c",
    extension: "c",
    badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    icon: "fas fa-code",
    categories: ["popular", "programming"],
    defaultCode: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`
  },
  cpp: {
    id: 105,
    name: "C++",
    desc: "GCC 14.1.0 Compiler",
    monacoId: "cpp",
    extension: "cpp",
    badgeClass: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    icon: "fas fa-code",
    categories: ["popular", "programming"],
    defaultCode: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`
  },
  python: {
    id: 113,
    name: "Python 3",
    desc: "3.14.0 Interpreter",
    monacoId: "python",
    extension: "py",
    badgeClass: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    icon: "fab fa-python",
    categories: ["popular", "programming"],
    defaultCode: `print("Hello, World!")`
  },
  javascript: {
    id: 102,
    name: "JavaScript",
    desc: "NodeJS 22.08.0 Runtime",
    monacoId: "javascript",
    extension: "js",
    badgeClass: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    icon: "fab fa-js",
    categories: ["popular", "programming", "web"],
    defaultCode: `console.log("Hello, World!");`
  },
  java: {
    id: 97,
    name: "Java",
    desc: "JDK 21.0.4 Runtime",
    monacoId: "java",
    extension: "java",
    badgeClass: "bg-red-500/10 border-red-500/20 text-red-500",
    icon: "fab fa-java",
    categories: ["popular", "programming"],
    defaultCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
  },
  typescript: {
    id: 101,
    name: "TypeScript",
    desc: "5.6.2 Compiler",
    monacoId: "typescript",
    extension: "ts",
    badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    icon: "fas fa-code",
    categories: ["programming", "web"],
    defaultCode: `const greeting: string = "Hello, World!";\nconsole.log(greeting);`
  },
  rust: {
    id: 108,
    name: "Rust",
    desc: "1.85.0 Compiler",
    monacoId: "rust",
    extension: "rs",
    badgeClass: "bg-orange-600/10 border-orange-600/20 text-orange-600",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `fn main() {
    println!("Hello, World!");
}`
  },
  go: {
    id: 60,
    name: "Go",
    desc: "1.13.5 Compiler",
    monacoId: "go",
    extension: "go",
    badgeClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`
  },
  sql: {
    id: 82,
    name: "SQL",
    desc: "SQLite 3.27.2 Database",
    monacoId: "sql",
    extension: "sql",
    badgeClass: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    icon: "fas fa-database",
    categories: ["popular", "databases"],
    defaultCode: `-- SQLite database table operations
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO users (name) VALUES ('Shariar'), ('CodeVerse');
SELECT * FROM users;`
  },
  assembly: {
    id: 45,
    name: "Assembly",
    desc: "NASM 2.14.02 Compiler",
    monacoId: "plaintext",
    extension: "asm",
    badgeClass: "bg-blue-400/10 border-blue-400/20 text-blue-400",
    icon: "fas fa-microchip",
    categories: ["programming"],
    defaultCode: `; Hello World in NASM Assembly
section .data
    msg db 'Hello, World!', 0xa
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
  bash: {
    id: 46,
    name: "Bash Shell",
    desc: "5.0.0 Interpreter",
    monacoId: "shell",
    extension: "sh",
    badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    icon: "fas fa-terminal",
    categories: ["programming"],
    defaultCode: `#!/bin/bash
echo "Hello, World!"`
  },
  basic: {
    id: 47,
    name: "Basic",
    desc: "FBC 1.07.1 Compiler",
    monacoId: "plaintext",
    extension: "bas",
    badgeClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `print "Hello, World!"`
  },
  clojure: {
    id: 86,
    name: "Clojure",
    desc: "1.10.1 Workspace",
    monacoId: "clojure",
    extension: "clj",
    badgeClass: "bg-blue-400/10 border-blue-400/20 text-blue-400",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `(println "Hello, World!")`
  },
  cobol: {
    id: 77,
    name: "COBOL",
    desc: "GnuCOBOL 2.2 Compiler",
    monacoId: "cobol",
    extension: "cbl",
    badgeClass: "bg-yellow-600/10 border-yellow-600/20 text-yellow-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HELLO.
       PROCEDURE DIVISION.
           DISPLAY 'Hello, World!'.
           STOP RUN.`
  },
  coffeescript: {
    id: 48,
    name: "CoffeeScript",
    desc: "2.4.1 JS Transpiler",
    monacoId: "coffeescript",
    extension: "coffee",
    badgeClass: "bg-yellow-600/10 border-yellow-600/20 text-yellow-600",
    icon: "fab fa-js",
    categories: ["programming", "web"],
    defaultCode: `console.log "Hello, World!"`
  },
  d: {
    id: 56,
    name: "D",
    desc: "DMD 2.089.1 Compiler",
    monacoId: "d",
    extension: "d",
    badgeClass: "bg-slate-500/10 border-slate-500/20 text-slate-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `import std.stdio;

void main() {
    writeln("Hello, World!");
}`
  },
  dart: {
    id: 115,
    name: "Dart",
    desc: "3.5.2 Runtime",
    monacoId: "dart",
    extension: "dart",
    badgeClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `void main() {
  print('Hello, World!');
}`
  },
  elixir: {
    id: 57,
    name: "Elixir",
    desc: "1.9.4 Compiler",
    monacoId: "elixir",
    extension: "ex",
    badgeClass: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    icon: "fas fa-code",
    categories: ["programming", "web"],
    defaultCode: `IO.puts "Hello, World!"`
  },
  erlang: {
    id: 58,
    name: "Erlang",
    desc: "OTP 22.2 Runtime",
    monacoId: "erlang",
    extension: "erl",
    badgeClass: "bg-purple-500/10 border-purple-500/20 text-purple-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `-module(main).
-export([start/0]).

start() ->
    io:fwrite("Hello, World!~n").`
  },
  fortran: {
    id: 59,
    name: "Fortran",
    desc: "GFortran 9.2.0 Compiler",
    monacoId: "fortran",
    extension: "f90",
    badgeClass: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `program hello
  print *, "Hello, World!"
end program hello`
  },
  fsharp: {
    id: 87,
    name: "F#",
    desc: ".NET Core SDK 3.1.202 Compiler",
    monacoId: "fsharp",
    extension: "fs",
    badgeClass: "bg-purple-600/10 border-purple-600/20 text-purple-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `printfn "Hello, World!"`
  },
  groovy: {
    id: 88,
    name: "Groovy",
    desc: "3.0.3 Scripting Engine",
    monacoId: "groovy",
    extension: "groovy",
    badgeClass: "bg-emerald-600/10 border-emerald-600/20 text-emerald-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `println "Hello, World!"`
  },
  haskell: {
    id: 61,
    name: "Haskell",
    desc: "GHC 8.8.1 Compiler",
    monacoId: "haskell",
    extension: "hs",
    badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `main = putStrLn "Hello, World!"`
  },
  lisp: {
    id: 55,
    name: "Lisp",
    desc: "SBCL 2.0.0 Interpreter",
    monacoId: "lisp",
    extension: "lisp",
    badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `(write-line "Hello, World!")`
  },
  kotlin: {
    id: 111,
    name: "Kotlin",
    desc: "2.1.10 Compiler",
    monacoId: "kotlin",
    extension: "kt",
    badgeClass: "bg-purple-500/10 border-purple-500/20 text-purple-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `fun main() {
    println("Hello, World!")
}`
  },
  lua: {
    id: 64,
    name: "Lua",
    desc: "5.3.5 Interpreter",
    monacoId: "lua",
    extension: "lua",
    badgeClass: "bg-purple-500/10 border-purple-500/20 text-purple-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `print("Hello, World!")`
  },
  objectivec: {
    id: 79,
    name: "Objective-C",
    desc: "Clang 7.0.1 Compiler",
    monacoId: "objective-c",
    extension: "m",
    badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `#import <Foundation/Foundation.h>\n\nint main() {\n    NSLog(@"Hello, World!");\n    return 0;\n}`
  },
  ocaml: {
    id: 65,
    name: "OCaml",
    desc: "4.09.0 Functional Compiler",
    monacoId: "ocaml",
    extension: "ml",
    badgeClass: "bg-orange-500/10 border-orange-500/20 text-orange-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `print_endline "Hello, World!"`
  },
  octave: {
    id: 66,
    name: "GNU Octave",
    desc: "5.1.0 Scientific Workspace",
    monacoId: "octave",
    extension: "m",
    badgeClass: "bg-blue-600/10 border-blue-600/20 text-blue-500",
    icon: "fas fa-calculator",
    categories: ["programming"],
    defaultCode: `disp('Hello, World!')`
  },
  pascal: {
    id: 67,
    name: "Pascal",
    desc: "FPC 3.0.4 Compiler",
    monacoId: "pascal",
    extension: "pas",
    badgeClass: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `program Hello;
begin
  writeln('Hello, World!');
end.`
  },
  perl: {
    id: 85,
    name: "Perl",
    desc: "5.28.1 Interpreter",
    monacoId: "perl",
    extension: "pl",
    badgeClass: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `print "Hello, World!\\n";`
  },
  php: {
    id: 98,
    name: "PHP",
    desc: "8.3.11 Interpreter",
    monacoId: "php",
    extension: "php",
    badgeClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    icon: "fab fa-php",
    categories: ["programming", "web"],
    defaultCode: `<?php
echo "Hello, World!\\n";`
  },
  prolog: {
    id: 69,
    name: "Prolog",
    desc: "GNU Prolog 1.4.5 Compiler",
    monacoId: "prolog",
    extension: "pl",
    badgeClass: "bg-emerald-600/10 border-emerald-600/20 text-emerald-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `:- initialization(main).
main :-
    write('Hello, World!'), nl.`
  },
  ruby: {
    id: 72,
    name: "Ruby",
    desc: "2.7.0 Interpreter",
    monacoId: "ruby",
    extension: "rb",
    badgeClass: "bg-red-500/10 border-red-500/20 text-red-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `puts "Hello, World!"`
  },
  scala: {
    id: 112,
    name: "Scala",
    desc: "3.4.2 Compiler",
    monacoId: "scala",
    extension: "scala",
    badgeClass: "bg-red-500/10 border-red-500/20 text-red-500",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `object Main extends App {
  println("Hello, World!")
}`
  },
  swift: {
    id: 83,
    name: "Swift",
    desc: "5.2.3 Compiler",
    monacoId: "swift",
    extension: "swift",
    badgeClass: "bg-orange-500/10 border-orange-500/20 text-orange-500",
    icon: "fab fa-swift",
    categories: ["programming"],
    defaultCode: `print("Hello, World!")`
  },
  vbnet: {
    id: 84,
    name: "VB.NET",
    desc: "Mono 6.6.0.161 Compiler",
    monacoId: "plaintext",
    extension: "bas",
    badgeClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    icon: "fas fa-code",
    categories: ["programming"],
    defaultCode: `Imports System

Module Program
    Sub Main()
        Console.WriteLine("Hello, World!")
    End Sub
End Module`
  }
};

export const DEFAULT_WEB_CSS = `/* CSS Styles */
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
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    max-width: 400px;
}

h1 {
    color: #6366f1;
    margin-top: 0;
}

button {
    background: #6366f1;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

button:hover {
    background: #4f46e5;
    transform: translateY(-2px);
}`;

export const DEFAULT_WEB_JS = `// Client side scripts
document.getElementById('btn').addEventListener('click', () => {
    alert('CodeVerse sandbox interactive action successfully invoked!');
    console.log('Button clicked inside iframe environment');
});`;
