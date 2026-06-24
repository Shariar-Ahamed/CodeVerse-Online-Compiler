# CodeVerse Online Compiler 🚀

CodeVerse is a modern, responsive, and high-performance Online Compiler and IDE web application built from scratch. It features an immersive dark theme inspired by VS Code, glassmorphic layout elements, automatic syntax highlighting with Microsoft's Monaco Editor, and code execution powered by the Judge0 Community Edition API.

---

## 📂 Project Structure

Below is the directory tree of the workspace:
```text
CodeVerse-Online-Compiler/
├── index.html          # Main HTML UI workspace shell
├── css/
│   └── style.css       # Custom stylesheet, transitions & themes
├── js/
│   └── script.js       # Core compiler logic & Monaco configuration
└── README.md           # Documentation and setup instructions
```

---

## 🛠️ Technology Stack

1. **HTML5**: Structured semantic layout.
2. **Tailwind CSS (via Play CDN)**: Utility-first styling framework for responsive design, grid offsets, spacing, and flex boxes.
3. **Vanilla JavaScript (ES6+)**: Handles Monaco configuration, tab states, browser storage caching, and asynchronous Judge0 compilation fetching.
4. **Monaco Editor (via CDN Loader)**: Microsoft's VS Code text editor engine providing auto-indentation, line numbers, and syntax highlighting.
5. **Judge0 CE API**: Handles multi-language code compilation and safe execution.

---

## ✨ Features

- **7 Supported Languages**: Out-of-the-box support for C, C++, Python, JavaScript (Node.js), Java, PHP, and Bash scripts.
- **Default Boilerplates**: Switching a language automatically updates the editor pane with standard template code.
- **Interactive Stdin Console**: Send arguments or input values directly to your console program execution.
- **Custom Settings Dialog**: Change the Judge0 API Base URL (e.g. self-hosted vs RapidAPI proxy) and configure credentials.
- **Workspace Cache (localStorage)**: Drafted code for each language is saved locally. It will not be lost if you refresh or switch languages.
- **Responsive Layout**: Designed for optimal editing experiences across desktop, tablet, and mobile screens.
- **Download/Copy tools**: Download your code directly as a file (`codeverse_main.py`, etc.) or copy it to your clipboard with toast alerts.
- **Theme Toggle**: Switch between an immersive dark mode and a clean light mode instantly.

---

## 🚀 Setup & Local Execution Guide

To run this project locally, follow these simple steps:

### Prerequisite
Make sure you have [Visual Studio Code (VS Code)](https://code.visualstudio.com/) installed on your computer.

### Step 1: Open the Project in VS Code
1. Open VS Code.
2. Click on **File** -> **Open Folder...**
3. Select the `CodeVerse-Online-Compiler` directory.

### Step 2: Install Live Server Extension
1. Go to the **Extensions** tab in VS Code sidebar (or press `Ctrl+Shift+X`).
2. Search for **"Live Server"** (by Ritwick Dey).
3. Click **Install**.

### Step 3: Run the Server
1. Right-click on `index.html` inside the VS Code explorer.
2. Select **"Open with Live Server"** (or click the **"Go Live"** button in the bottom right corner of the status bar).
3. Your default web browser will automatically open: `http://127.0.5.1:5500/index.html`.

---

## 💻 How to Test Code for Each Language

1. **Select Language**: Click the language selector at the top-left to select your target language (e.g., Python).
2. **Input arguments (Optional)**: If your script reads inputs (e.g. `scanf` in C, `input()` in Python, `cin` in C++), write those inputs on separate lines inside the **Standard Input (Stdin)** box.
3. **Execute**: Click **"Run Code"** (or press `Ctrl+Enter` inside the browser).
4. **Inspect Outputs**:
   - The status bar will show execution metrics like **Time (seconds)** and **Memory Usage (Megabytes)**.
   - Successful outputs will be printed in green/white console log.
   - Syntax or compilation errors will be printed in red color for debugging.

---

## ⚙️ Judge0 API Configuration Details

By default, this application connects to the free public instance of Judge0 CE: `https://ce.judge0.com`. 

If you hit rate limits, you can self-host Judge0 via Docker or configure your own RapidAPI tier:
1. Click the **Gear (Settings)** icon in the top right navbar.
2. Replace the **Judge0 API Base URL** (e.g. to `http://localhost:2358` or `https://judge0-ce.p.rapidapi.com`).
3. Add your RapidAPI key (`x-rapidapi-key`) if necessary.
4. Click **Save Configuration**. It will persist inside your browser cache.

---

## 🌐 Deployment Instructions

### 1. GitHub Pages (Free)
1. Initialize git and push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial CodeVerse Release"
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```
2. Go to your repository settings on GitHub.
3. Scroll down to **Pages** in the sidebar.
4. Under **Build and deployment**, select **Deploy from a branch** and choose `main` -> `/root`.
5. Click **Save**. Your site will be live at `https://<your-username>.github.io/CodeVerse-Online-Compiler/` within minutes.

### 2. Vercel Deployment
1. Go to [Vercel](https://vercel.com/) and sign in.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Leave build settings to default (since this is static HTML/CSS/JS).
5. Click **Deploy**. Vercel will build and deploy your project automatically.