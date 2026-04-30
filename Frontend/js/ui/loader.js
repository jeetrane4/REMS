// =============================
// GLOBAL LOADER SYSTEM
// =============================

let loaderElement = null;
let loaderCount = 0;

function createLoader() {
  if (loaderElement) return loaderElement;

  loaderElement = document.createElement("div");
  loaderElement.className = "app-loader";
  loaderElement.innerHTML = `
    <div class="loader-spinner" aria-label="Loading"></div>
  `;

  document.body.appendChild(loaderElement);
  return loaderElement;
}

function showLoader() {
  createLoader();

  loaderCount += 1;

  loaderElement.classList.add("active");
  document.body.style.overflow = "hidden";
}

function hideLoader(force = false) {
  if (!loaderElement) return;

  if (force) {
    loaderCount = 0;
  } else {
    loaderCount = Math.max(0, loaderCount - 1);
  }

  if (loaderCount > 0) return;

  loaderElement.classList.remove("active");

  setTimeout(() => {
    if (loaderCount === 0) {
      document.body.style.overflow = "";
    }
  }, 300);
}

window.addEventListener("load", () => {
  hideLoader(true);
});

window.showLoader = showLoader;
window.hideLoader = hideLoader;