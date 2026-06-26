/**
 * CodeVerse - Main Shared JavaScript Engine
 * Handles common operations across all pages (theme toggling, auth UI updates, navbar dropdowns, and toast notifications)
 */

const REPO_NAME = "CodeVerse Online Compiler";
let currentUser = null;

// --- Global DOM Registry ---
const DOM = {
  themeToggleBtn: document.getElementById("theme-toggle"),
  themeIcon: document.getElementById("theme-icon"),
  mobileMenuBtn: document.getElementById("mobile-menu-btn"),
  mobileNav: document.getElementById("mobile-nav"),
  backToTopBtn: document.getElementById("back-to-top"),
  
  // Auth components
  authNavContainer: document.getElementById("auth-nav-container"),
  navSigninBtn: document.getElementById("nav-signin-btn"),
  navUserProfile: document.getElementById("nav-user-profile"),
  navUserAvatarBtn: document.getElementById("nav-user-avatar-btn"),
  navUserDropdown: document.getElementById("nav-user-dropdown"),
  dropdownUserName: document.getElementById("dropdown-user-name"),
  dropdownUserEmail: document.getElementById("dropdown-user-email"),
  dropdownGotoIde: document.getElementById("dropdown-goto-ide"),
  dropdownSignoutBtn: document.getElementById("dropdown-signout-btn"),
  
  // Mobile auth elements
  mobileSigninBtn: document.getElementById("mobile-signin-btn"),
  mobileUserProfile: document.getElementById("mobile-user-profile"),
  mobileUserAvatar: document.getElementById("mobile-user-avatar"),
  mobileUserName: document.getElementById("mobile-user-name"),
  mobileUserEmail: document.getElementById("mobile-user-email"),
  mobileSignoutBtn: document.getElementById("mobile-signout-btn"),
  
  // Maintenance warning modal (only present in editor.html)
  maintenanceModal: document.getElementById("maintenance-modal"),
  closeMaintenanceBtn: document.getElementById("close-maintenance-btn"),
  closeMaintenanceX: document.getElementById("close-maintenance-x")
};

// --- Theme Management ---
function initTheme() {
  // Light theme is under maintenance, force dark theme on launch
  localStorage.setItem("codeverse_theme", "dark");
  document.documentElement.classList.remove("light");
  if (DOM.themeIcon) {
    DOM.themeIcon.className = "fas fa-sun text-sm";
  }
}

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle("light");
  localStorage.setItem("codeverse_theme", isLight ? "light" : "dark");
  
  // Toggle Monaco Theme if on editor page
  if (typeof editor !== 'undefined' && editor && typeof monaco !== 'undefined') {
    monaco.editor.setTheme(isLight ? 'vs' : 'dracula');
  }
  
  if (DOM.themeIcon) {
    DOM.themeIcon.className = isLight ? "fas fa-moon text-sm" : "fas fa-sun text-sm";
  }
  
  showToast(isLight ? "Light Mode Active" : "Dracula Theme Active");

  // Show warning popup when switching on light mode (if modal is present)
  if (isLight && DOM.maintenanceModal) {
    openMaintenanceWarning();
  }
}

function openMaintenanceWarning() {
  if (DOM.maintenanceModal) {
    DOM.maintenanceModal.classList.remove("hidden");
    DOM.maintenanceModal.classList.add("flex");
  }
}

function closeMaintenanceWarning() {
  if (DOM.maintenanceModal) {
    DOM.maintenanceModal.classList.remove("flex");
    DOM.maintenanceModal.classList.add("hidden");
  }
  
  // Revert back to Dracula dark theme since light mode is under maintenance
  document.documentElement.classList.remove("light");
  localStorage.setItem("codeverse_theme", "dark");
  
  if (typeof editor !== 'undefined' && editor && typeof monaco !== 'undefined') {
    monaco.editor.setTheme('dracula');
  }
  
  if (DOM.themeIcon) {
    DOM.themeIcon.className = "fas fa-sun text-sm";
  }
  showToast("Reverted to Dracula Theme", "info");
}

// --- Authentication Management ---
function initAuth() {
  try {
    const savedUser = localStorage.getItem("codeverse_user");
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
    }
  } catch (e) {
    console.error("Error reading saved user session", e);
  }
  updateAuthUI();
}

function updateAuthUI() {
  if (currentUser) {
    // Logged in states
    if (DOM.navSigninBtn) DOM.navSigninBtn.classList.add("hidden");
    if (DOM.navUserProfile) DOM.navUserProfile.classList.remove("hidden");
    if (DOM.navUserAvatarBtn) {
      DOM.navUserAvatarBtn.textContent = (currentUser.name || "U").charAt(0).toUpperCase();
    }
    if (DOM.dropdownUserName) DOM.dropdownUserName.textContent = currentUser.name || "User";
    if (DOM.dropdownUserEmail) DOM.dropdownUserEmail.textContent = currentUser.email || "";

    // Mobile nav updates
    if (DOM.mobileSigninBtn) DOM.mobileSigninBtn.classList.add("hidden");
    if (DOM.mobileUserProfile) DOM.mobileUserProfile.classList.remove("hidden");
    if (DOM.mobileUserAvatar) {
      DOM.mobileUserAvatar.textContent = (currentUser.name || "U").charAt(0).toUpperCase();
    }
    if (DOM.mobileUserName) DOM.mobileUserName.textContent = currentUser.name || "User";
    if (DOM.mobileUserEmail) DOM.mobileUserEmail.textContent = currentUser.email || "";
  } else {
    // Logged out states
    if (DOM.navSigninBtn) DOM.navSigninBtn.classList.remove("hidden");
    if (DOM.navUserProfile) DOM.navUserProfile.classList.add("hidden");
    if (DOM.navUserDropdown) DOM.navUserDropdown.classList.add("hidden");

    // Mobile nav updates
    if (DOM.mobileSigninBtn) DOM.mobileSigninBtn.classList.remove("hidden");
    if (DOM.mobileUserProfile) DOM.mobileUserProfile.classList.add("hidden");
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("codeverse_user");
  updateAuthUI();
  showToast("Signed out successfully", "info");
  
  // If on profile page, redirect to home
  if (window.location.pathname.includes("profile.html")) {
    window.location.href = "index.html";
  }
}

// --- Toast Alerts ---
function showToast(message, type = "info") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

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
    <span class="text-slate-100">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Force reflow and animate
  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  }, 50);

  // Auto remove
  setTimeout(() => {
    toast.classList.add("translate-y-10", "opacity-0");
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// --- Shared Event Listeners ---
function registerCommonListeners() {
  // Theme Toggle
  if (DOM.themeToggleBtn) {
    DOM.themeToggleBtn.addEventListener("click", toggleTheme);
  }

  // Mobile Menu Toggling
  if (DOM.mobileMenuBtn) {
    DOM.mobileMenuBtn.addEventListener("click", () => {
      if (DOM.mobileNav) DOM.mobileNav.classList.toggle("hidden");
    });
  }

  // Profile Dropdown Toggle
  if (DOM.navUserAvatarBtn) {
    DOM.navUserAvatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (DOM.navUserDropdown) {
        DOM.navUserDropdown.classList.toggle("hidden");
        DOM.navUserDropdown.classList.toggle("flex");
      }
    });
  }

  // Close dropdown on clicking outside
  window.addEventListener("click", () => {
    if (DOM.navUserDropdown && !DOM.navUserDropdown.classList.contains("hidden")) {
      DOM.navUserDropdown.classList.add("hidden");
      DOM.navUserDropdown.classList.remove("flex");
    }
  });

  // Maintenance modal close actions
  if (DOM.closeMaintenanceBtn) {
    DOM.closeMaintenanceBtn.addEventListener("click", closeMaintenanceWarning);
  }
  if (DOM.closeMaintenanceX) {
    DOM.closeMaintenanceX.addEventListener("click", closeMaintenanceWarning);
  }
  if (DOM.maintenanceModal) {
    DOM.maintenanceModal.addEventListener("click", (e) => {
      if (e.target === DOM.maintenanceModal) closeMaintenanceWarning();
    });
  }

  // Sign out triggers
  if (DOM.dropdownSignoutBtn) {
    DOM.dropdownSignoutBtn.addEventListener("click", handleLogout);
  }
  if (DOM.mobileSignoutBtn) {
    DOM.mobileSignoutBtn.addEventListener("click", handleLogout);
  }

  // Redirect buttons
  if (DOM.navSigninBtn) {
    DOM.navSigninBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
  if (DOM.mobileSigninBtn) {
    DOM.mobileSigninBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
  if (DOM.dropdownGotoIde) {
    DOM.dropdownGotoIde.addEventListener("click", () => {
      window.location.href = "editor.html";
    });
  }

  // Back to Top Button
  window.addEventListener("scroll", () => {
    if (DOM.backToTopBtn) {
      if (window.scrollY > 400) {
        DOM.backToTopBtn.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
      } else {
        DOM.backToTopBtn.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
      }
    }
  });

  if (DOM.backToTopBtn) {
    DOM.backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

// Initialise common parameters on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAuth();
  registerCommonListeners();
});
