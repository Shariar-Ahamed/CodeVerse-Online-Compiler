# CodeVerse - Online Compiler & Live Web Editor 🚀

🖥️ **Live Demo**: **[https://code-verse-online.vercel.app/](https://code-verse-online.vercel.app/)**

CodeVerse is a modern, responsive, high-performance online IDE and visual playground web application built using React + Vite. It features a sleek glassmorphic UI, global state theme configuration (inspired by VS Code & Dracula), Microsoft's Monaco Editor integration, multi-language code execution powered by the Judge0 API, and a custom visual sandbox (Web Lab) for live HTML/CSS/JS frontend previews.

---

## 📂 Project Structure

Below is the directory tree of the cleaned-up React workspace:
```text
CodeVerse-Online-Compiler/
├── public/                # Static assets (Favicons, icon SVGs)
├── src/
│   ├── components/        # Reusable global layout items (Header, Footer, Toast, AuthParticles)
│   ├── pages/             # App views (LandingPage, AuthPage, EditorPage, ProfilePage)
│   ├── utils/             # Helper configs (Boilerplate language codes, utilities)
│   ├── App.jsx            # Main app router (HashRouter), theme configurations, & Auth Guard
│   ├── main.jsx           # ReactDOM application entry mount point
│   └── index.css          # Core design system stylesheet (Variables, transitions, ambient glow)
├── index.html             # React template DOM mounting point
├── package.json           # npm dependencies & workspace build/dev script configurations
├── vite.config.js         # Vite bundler configurations
└── README.md              # Project documentation and guides
```

---

## 🛠️ Technology Stack

1. **React**: Component-driven UI framework for highly reactive, stateful rendering.
2. **Vite**: Ultra-fast bundler providing Hot Module Replacement (HMR) for quick local development.
3. **Tailwind CSS**: Utility-first styling framework driving modular UI structures.
4. **Monaco Editor (`@monaco-editor/react`)**: Microsoft's VS Code text editor engine featuring syntax highlighting, custom theme registers, auto-indentation, and hotkey bindings.
5. **Judge0 CE API**: Safe, sandboxed API orchestrating backend code compilation and execution.

---

## ✨ Features

- **29 Supported Languages**: Fully pre-configured compiler boilerplates and environments (C, C++, C#, Java, Python, Go, Rust, Ruby, PHP, Swift, Bash, SQL, etc.).
- **Live HTML/CSS/JS Sandbox (Web Lab)**: Dedicated editor pane for frontend sketches rendering inside an iframe with real-time browser console log interception.
- **Dynamic Dracula Theme**: Lockable premium dark mode styling with optional Light mode alert messages.
- **Developer Profile Dashboard**: Track compilation metrics, achievements, language preferences, and a GitHub-style activity grid visual.
- **Secure Auth Guard Router**: Protect user profile dashboard views with redirect guards.
- **Clipboard & File Tools**: Download codes directly as local files or copy to clipboard with toast notifications.
- **Settings configuration**: Customize API credentials (self-hosted vs RapidAPI proxy) easily.

---

## 🚀 Setup & Local Execution Guide

To run this project locally, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Step 1: Install Dependencies
Open your shell inside the project workspace directory and run:
```bash
npm install
```
*(On Windows PowerShell, use `npm.cmd install` if execution policies restrict raw script execution).*

### Step 2: Run Development Server
To launch Vite's HMR local development server, run:
```bash
npm run dev
```
*(On Windows PowerShell, use `npm.cmd run dev`)*

Your terminal will display the local address (default: `http://localhost:5173/`). Open this link in your web browser.

### Step 3: Build for Production
To generate compiled production static files ready for hosting, run:
```bash
npm run build
```
*(On Windows PowerShell, use `npm.cmd run build`)*

This compiles assets into the `dist/` directory.

---

## ⚙️ Judge0 API Configuration Details

By default, this application connects to the free public instance of Judge0 CE: `https://ce.judge0.com`. 

If you hit rate limits, you can self-host Judge0 via Docker or configure your own RapidAPI tier:
1. Click the **Sliders (Settings)** icon in the compiler controls bar.
2. Replace the **Judge0 API Base URL** (e.g. to `http://localhost:2358` or `https://judge0-ce.p.rapidapi.com`).
3. Add your RapidAPI key (`x-rapidapi-key`) if necessary.
4. Click **Save Configuration**. It will persist inside your browser cache.

---

## 🌐 Deployment Instructions

### Vercel / Netlify Deployment
1. Push this repository to your GitHub account.
2. Log in to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
3. Create a new project and import your repository.
4. Vercel/Netlify will automatically detect **Vite** configuration:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your site will be online in under a minute with automatic HMR deploys on code push.