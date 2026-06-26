/**
 * CodeVerse - Dedicated Auth Page JavaScript Engine
 * Handles Login & Registration form submissions, validations, and page redirects
 */

let authCurrentTab = "login"; // "login" or "signup"

const authDOM = {
  authCard: document.getElementById("auth-card"),
  authTabLogin: document.getElementById("auth-tab-login"),
  authTabSignup: document.getElementById("auth-tab-signup"),
  authForm: document.getElementById("auth-form"),
  authFieldName: document.getElementById("auth-field-name"),
  authFieldConfirmPass: document.getElementById("auth-field-confirm-pass"),
  authInputName: document.getElementById("auth-input-name"),
  authInputEmail: document.getElementById("auth-input-email"),
  authInputPassword: document.getElementById("auth-input-password"),
  authInputConfirmPass: document.getElementById("auth-input-confirm-pass"),
  authTogglePass: document.getElementById("auth-toggle-pass"),
  authSubmitBtn: document.getElementById("auth-submit-btn"),
  authSocialGithub: document.getElementById("auth-social-github"),
  authSocialGoogle: document.getElementById("auth-social-google")
};

function switchAuthTab(tab) {
  authCurrentTab = tab;
  
  if (tab === "login") {
    // Tabs UI
    authDOM.authTabLogin.classList.remove("border-transparent", "text-[var(--text-secondary)]");
    authDOM.authTabLogin.classList.add("border-indigo-500", "text-white");
    
    authDOM.authTabSignup.classList.remove("border-indigo-500", "text-white");
    authDOM.authTabSignup.classList.add("border-transparent", "text-[var(--text-secondary)]");
    
    // Field toggles
    authDOM.authFieldName.classList.add("hidden");
    authDOM.authFieldConfirmPass.classList.add("hidden");
    
    // Input requirements
    authDOM.authInputName.required = false;
    authDOM.authInputConfirmPass.required = false;
    
    // Button text
    authDOM.authSubmitBtn.textContent = "Sign In to Account";
  } else {
    // Tabs UI
    authDOM.authTabSignup.classList.remove("border-transparent", "text-[var(--text-secondary)]");
    authDOM.authTabSignup.classList.add("border-indigo-500", "text-white");
    
    authDOM.authTabLogin.classList.remove("border-indigo-500", "text-white");
    authDOM.authTabLogin.classList.add("border-transparent", "text-[var(--text-secondary)]");
    
    // Field toggles
    authDOM.authFieldName.classList.remove("hidden");
    authDOM.authFieldName.classList.add("flex");
    authDOM.authFieldConfirmPass.classList.remove("hidden");
    authDOM.authFieldConfirmPass.classList.add("flex");
    
    // Input requirements
    authDOM.authInputName.required = true;
    authDOM.authInputConfirmPass.required = true;
    
    // Button text
    authDOM.authSubmitBtn.textContent = "Create Account";
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  
  const email = authDOM.authInputEmail.value.trim();
  const password = authDOM.authInputPassword.value;
  let loggedUser = null;

  if (authCurrentTab === "signup") {
    const name = authDOM.authInputName.value.trim();
    const confirmPass = authDOM.authInputConfirmPass.value;
    
    if (password !== confirmPass) {
      if (typeof showToast === 'function') showToast("Passwords do not match!", "error");
      return;
    }
    
    loggedUser = { name, email };
    localStorage.setItem("codeverse_user", JSON.stringify(loggedUser));
    if (typeof showToast === 'function') showToast(`Welcome to CodeVerse, ${name}!`, "success");
  } else {
    const name = email.split('@')[0]; // Default user name from email
    loggedUser = { name: name.charAt(0).toUpperCase() + name.slice(1), email };
    localStorage.setItem("codeverse_user", JSON.stringify(loggedUser));
    if (typeof showToast === 'function') showToast(`Welcome back, ${loggedUser.name}!`, "success");
  }
  
  // Update state in main and redirect back to index
  if (typeof initAuth === 'function') initAuth();
  
  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

function togglePasswordVisibility() {
  const type = authDOM.authInputPassword.getAttribute("type") === "password" ? "text" : "password";
  authDOM.authInputPassword.setAttribute("type", type);
  const icon = authDOM.authTogglePass.querySelector("i");
  if (icon) {
    icon.className = type === "password" ? "fas fa-eye text-xs" : "fas fa-eye-slash text-xs";
  }
}

function initAuthPage() {
  // Check if already logged in - if so, redirect to home
  const savedUser = localStorage.getItem("codeverse_user");
  if (savedUser) {
    window.location.href = "index.html";
    return;
  }

  // Register listeners
  if (authDOM.authTabLogin) {
    authDOM.authTabLogin.addEventListener("click", () => switchAuthTab("login"));
  }
  if (authDOM.authTabSignup) {
    authDOM.authTabSignup.addEventListener("click", () => switchAuthTab("signup"));
  }
  if (authDOM.authForm) {
    authDOM.authForm.addEventListener("submit", handleAuthSubmit);
  }
  if (authDOM.authTogglePass) {
    authDOM.authTogglePass.addEventListener("click", togglePasswordVisibility);
  }

  // Mock social logins
  if (authDOM.authSocialGithub) {
    authDOM.authSocialGithub.addEventListener("click", () => {
      const loggedUser = { name: "GitHub Coder", email: "github-coder@codeverse.me" };
      localStorage.setItem("codeverse_user", JSON.stringify(loggedUser));
      if (typeof showToast === 'function') showToast("Logged in via GitHub", "success");
      setTimeout(() => { window.location.href = "index.html"; }, 800);
    });
  }
  if (authDOM.authSocialGoogle) {
    authDOM.authSocialGoogle.addEventListener("click", () => {
      const loggedUser = { name: "Google Dev", email: "google-dev@codeverse.me" };
      localStorage.setItem("codeverse_user", JSON.stringify(loggedUser));
      if (typeof showToast === 'function') showToast("Logged in via Google", "success");
      setTimeout(() => { window.location.href = "index.html"; }, 800);
    });
  }
}

document.addEventListener("DOMContentLoaded", initAuthPage);
