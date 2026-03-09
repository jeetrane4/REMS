// =============================
// GLOBAL LOADER SYSTEM – PRODUCTION READY
// =============================

let loaderElement = null;

// =============================
// CREATE LOADER
// =============================

function createLoader() {
  if (loaderElement) return;

  loaderElement = document.createElement("div");
  loaderElement.className = "app-loader";
  loaderElement.innerHTML = `
    <div class="loader-spinner"></div>
  `;

  document.body.appendChild(loaderElement);
}

// =============================
// SHOW LOADER
// =============================

function showLoader() {
  createLoader();
  loaderElement.classList.add("active");
  document.body.style.overflow = "hidden";
}

// =============================
// HIDE LOADER
// =============================

function hideLoader() {
  if (!loaderElement) return;

  loaderElement.classList.remove("active");

  setTimeout(() => {
    document.body.style.overflow = "";
  }, 300);
}

// =============================
// AUTO HIDE AFTER PAGE LOAD
// =============================

window.addEventListener("load", () => {
  hideLoader();
});