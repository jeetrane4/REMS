// =============================
// UTILITIES – PRO VERSION
// =============================

/* =========================
   FORMATTERS
========================= */

function formatCurrency(amount) {
  const value = Number(amount);

  if (isNaN(value)) return "₹0";

  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;
}

function formatDate(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d)) return "-";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* =========================
   PERFORMANCE
========================= */

function debounce(fn, delay = 300) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, limit = 300) {
  let lastCall = 0;

  return (...args) => {
    const now = Date.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/* =========================
   DOM HELPERS
========================= */

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
  return scope.querySelectorAll(selector);
}

function createElement(tag, className = "", html = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html) el.innerHTML = html;
  return el;
}

/* =========================
   URL HELPERS
========================= */

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function setQueryParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.replaceState({}, "", url);
}

/* =========================
   NUMBER HELPERS
========================= */

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

/* =========================
   SAFE ACCESS
========================= */

function safe(fn, fallback = null) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/* expose globally */

window.Utils = {
  formatCurrency,
  formatDate,
  capitalize,
  debounce,
  throttle,
  qs,
  qsa,
  createElement,
  getQueryParam,
  setQueryParam,
  toNumber,
  safe
};