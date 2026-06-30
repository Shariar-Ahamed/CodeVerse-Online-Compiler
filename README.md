# CodeVerse — Online Compiler & Live Web Editor 🚀

[![Vite Build](https://img.shields.io/badge/Vite-v8.1.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React Version](https://img.shields.io/badge/React-v18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Deployment: Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://code-verse-online.vercel.app/)

> **Live Production Demo**: **[code-verse-online.vercel.app](https://code-verse-online.vercel.app/)**

CodeVerse is a premium, high-performance web-based Integrated Development Environment (IDE) and real-time frontend playground. Built using **React + Vite**, it features a gorgeous custom glassmorphic UI, Microsoft's Monaco Editor engine, sandboxed code compilation, database activity tracking, and a secure administration panel.

---

## ✨ Key Features

### 💻 1. Multi-Language Compiler Dashboard
* **38+ Supported Languages**: Ready-to-go compiler templates for C, C++, Java, Python, Go, Rust, C#, PHP, Swift, Bash, SQL, Assembly, and more.
* **Premium Language Selector Modal**: A gorgeous, search-focused cards grid that lets users quickly search, filter, and switch compilers with zero friction.
* **Full-Bleed IDE Viewport**: A layout engineered to utilize the full width of the screen, maximizing the code editor space for programmers.

### 🌐 2. Interactive Frontend Web Lab
* **Live Previews**: Write HTML, CSS, and JavaScript in side-by-side panes and preview the rendering instantly inside an isolated iframe.
* **Console Interceptor**: Capture, capture, and intercept console logs within the preview container, showing them inside a custom console tab.

### 📊 3. Gamified Developer Dashboard
* **Developer Profiles**: Track total code submissions, top languages used, and general compilation achievements.
* **Contribution Heatmap**: A GitHub-style contribution grid displaying compilation frequency and database actions day-by-day.
* **Global Leaderboard**: Compete with other programmers in the community rankings.

### 🛡️ 4. Enterprise-Grade Security & Stability
* **Client-Side Timeout Guards**: Fetch execution abort controllers block compilation threads from hanging indefinitely when remote compilers drop packets.
* **Non-Blocking Firebase Sync**: Activities and analytics logging execute in the background asynchronously, ensuring compiler actions are never blocked by database network sync latencies.
* **Admin Privacy Patch**: Leaderboard ranks exclude administrator accounts, and public access to administrative profiles is strictly blocked ("User Not Found" responses).

---

## 📂 Project Architecture

```text
CodeVerse-Online-Compiler/
├── public/                # Static assets, SVG icons, and tab graphics
├── src/
│   ├── components/        # Global layout components (Header, Footer, Toast, AIPanel)
│   ├── pages/             # Page views (LandingPage, AuthPage, EditorPage, ProfilePage, LeaderboardPage, AdminPage)
│   ├── utils/             # Helper configurations, languages metadata, and boilerplates
│   ├── App.jsx            # React router definitions, global theme contexts, and Auth Guards
│   ├── main.jsx           # React app DOM mounting and initialization entrypoint
│   └── index.css          # Core CSS variables stylesheet (Dracula colors, glass panels, neon borders)
├── LICENSE                # MIT License
├── package.json           # npm dependencies & script commands
├── vite.config.js         # Vite compiler bundler rules
└── README.md              # Project documentation
```

---

## 🚀 Setup & Local Execution Guide

To set up a local development copy of CodeVerse, follow these instructions:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

### Step 1: Clone and Install Dependencies
Navigate to the project workspace directory and run:
```bash
npm install
```

### Step 2: Launch Vite Dev Server
To start Vite's local dev server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open the local address provided in your terminal (default: `http://localhost:5173/`) in your web browser.

### Step 3: Compile for Production
To build a highly optimized, minified production build:
```bash
npm run build
```
This will compile assets into the `dist/` directory, ready to be hosted on any web server.

---

## ⚙️ Judge0 API Configuration

By default, the editor is pointed to the free public trial tier: `https://ce.judge0.com`. 

If you require instant executions, you can configure your own self-hosted Docker URL or RapidAPI tier:
1. Click the **Compiler Settings (sliders icon)** in the editor controls bar.
2. Update the **Judge0 API Base URL** to your self-hosted Docker endpoint (e.g., `http://localhost:2358`) or RapidAPI host.
3. Save configuration. Settings are safely cached inside your browser's local storage.

---

## 📄 License

This project is licensed under the terms of the [MIT License](file:///e:/Git%20All%20Repo/CodeVerse-Online-Compiler/LICENSE).