// =============================
// MAIN ENGINE (REMS)
// =============================

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  try {
    window.showLoader?.();

    await loadPartials();

    window.initNavbar?.();
    window.initTheme?.();

    protectPageRoutes();
    protectElements();
    applyRoleVisibility();
    initBackToTop();
  } catch (error) {
    console.error("App initialization failed:", error);
    window.notify?.("App initialization failed", "error");
  } finally {
    window.hideLoader?.(true);
  }
}

async function loadPartials() {
  const partials = [
    { id: "header", url: "partials/header.html" },
    { id: "footer", url: "partials/footer.html" }
  ];

  await Promise.all(
    partials.map(async ({ id, url }) => {
      const element = document.getElementById(id);
      if (!element) return;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${url} failed`);
        element.innerHTML = await response.text();
      } catch (error) {
        console.error(`Failed to load ${url}:`, error.message);
      }
    })
  );
}

function protectPageRoutes() {
  const protectedPages = [
    "dashboard.html",
    "dashboard-properties.html",
    "add-property.html",
    "bookings.html",
    "saved-properties.html",
    "settings.html",
    "transactions.html",
    "users.html"
  ];

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (protectedPages.includes(currentPage) && !window.Storage?.isLoggedIn?.()) {
    window.location.href = "login.html";
  }
}

function applyRoleVisibility() {
  const user = window.Storage?.getUser?.();
  const role = String(user?.role || "guest").toLowerCase();

  document.body.dataset.role = role;

  document.querySelectorAll("[data-role]").forEach((el) => {
    const allowedRoles = el.dataset.role
      .split(",")
      .map((r) => r.trim().toLowerCase());

    if (!allowedRoles.includes(role)) {
      el.remove();
    }
  });

  if (role === "buyer") {
    document
      .querySelectorAll('[href="add-property.html"], #postPropertyBtn')
      .forEach((el) => el.remove());
  }

  if (role !== "admin") {
    document
      .querySelectorAll('[href="users.html"], [data-admin]')
      .forEach((el) => el.remove());
  }
}

function protectElements() {
  const token = window.Storage?.getToken?.();

  document.querySelectorAll("[data-protected]").forEach((el) => {
    if (!token) el.style.display = "none";
  });
}

function initBackToTop() {
  const topBtn = document.getElementById("topBtn");
  if (!topBtn) return;

  const toggleButton = () => {
    topBtn.classList.toggle("hidden", window.scrollY <= 300);
  };

  window.addEventListener(
    "scroll",
    window.Utils?.throttle?.(toggleButton, 200) || toggleButton
  );

  topBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

window.loadPartials = loadPartials;
window.applyRoleVisibility = applyRoleVisibility;
window.protectPageRoutes = protectPageRoutes;
window.protectElements = protectElements;