// =============================
// THEME CONTROLLER – PRODUCTION READY
// =============================

document.addEventListener("DOMContentLoaded", () => {

initTheme();

});

/* =============================
INITIALIZE THEME
============================= */

function initTheme(){

const savedTheme = localStorage.getItem("theme");

const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

const theme = savedTheme || (systemPrefersDark ? "dark" : "light");

applyTheme(theme);

initializeToggle();

}

/* =============================
THEME TOGGLE INITIALIZER
============================= */

function initializeToggle(){

// Navbar may load dynamically, so wait a bit
setTimeout(() => {

const toggle = document.getElementById("themeToggle");
const icon = document.getElementById("themeIcon");

if(!toggle) return;

toggle.addEventListener("click", () => {

const current = document.documentElement.getAttribute("data-theme");

const newTheme = current === "dark" ? "light" : "dark";

applyTheme(newTheme);

localStorage.setItem("theme", newTheme);

});

},200);

}

/* =============================
APPLY THEME
============================= */

function applyTheme(theme){

const toggle = document.getElementById("themeToggle");
const icon = document.getElementById("themeIcon");

document.documentElement.setAttribute("data-theme", theme);

if(icon){

icon.textContent = theme === "dark" ? "☀️" : "🌙";

}

if(toggle){

toggle.setAttribute(
"aria-label",
theme === "dark"
? "Switch to light mode"
: "Switch to dark mode"
);

}

}