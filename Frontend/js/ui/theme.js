// =============================
// THEME CONTROLLER
// =============================

document.addEventListener("DOMContentLoaded", initTheme);

const THEME_KEY = "rems_theme";

/* =============================
   INITIALIZE THEME
============================= */

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem("theme");

  const systemPrefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = savedTheme || (systemPrefersDark ? "dark" : "light");

  applyTheme(theme);
  initializeToggle();
  watchSystemTheme();
}

/* =============================
   THEME TOGGLE INITIALIZER
============================= */

function initializeToggle() {
  const bindToggle = () => {
    const toggle = document.getElementById("themeToggle");

    if (!toggle || toggle.dataset.bound === "true") return;

    toggle.dataset.bound = "true";

    toggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = current === "dark" ? "light" : "dark";

      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
      localStorage.setItem("theme", newTheme);
    });
  };

  bindToggle();

  setTimeout(bindToggle, 300);
  setTimeout(bindToggle, 800);
}

/* =============================
   APPLY THEME
============================= */

function applyTheme(theme) {
  const cleanTheme = theme === "dark" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", cleanTheme);

  const toggle = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  if (icon) {
    icon.textContent = cleanTheme === "dark" ? "☀️" : "🌙";
  }

  if (toggle) {
    toggle.setAttribute(
      "aria-label",
      cleanTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }
}

/* =============================
   SYSTEM THEME WATCHER
============================= */

function watchSystemTheme() {
  if (!window.matchMedia) return;

  const media = window.matchMedia("(prefers-color-scheme: dark)");

  media.addEventListener?.("change", (event) => {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme) return;

    applyTheme(event.matches ? "dark" : "light");
  });
}

/* expose globally */

window.initTheme = initTheme;
window.applyTheme = applyTheme;