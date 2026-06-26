export const LANGUAGES = {
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
  },
  text: {
    id: "text",
    name: "Text Notes",
    monacoId: "plaintext",
    extension: "txt",
    badgeClass: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
    defaultCode: ""
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

export const DEFAULT_WEB_JS = `// JavaScript logic
console.log("Hello from CodeVerse Web Lab!");

const btn = document.getElementById("btn");
if (btn) {
    btn.addEventListener("click", () => {
        console.log("Button clicked!");
        alert("Welcome to the CodeVerse Frontend Playground!");
    });
}`;
