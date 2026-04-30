// =============================
// NAVBAR CONTROLLER
// =============================

function initNavbar() {
  handleAuthVisibility();
  handleRoleLinks();
  handleLogout();
  handleProfileDropdown();
  handleMobileToggle();
  handleScrollEffect();
  setActiveNavLink();
  setProfileName();
}

/* =============================
   PROFILE NAME
============================= */

function setProfileName() {
  const user = window.Storage?.getUser?.();
  const profileName = document.getElementById("profileName");

  if (user && profileName) {
    profileName.textContent =
      user.name ||
      user.user_name ||
      user.email ||
      user.user_email ||
      "Account";
  }
}

/* =============================
   AUTH VISIBILITY
============================= */

function handleAuthVisibility() {
  const token = window.Storage?.getToken?.();

  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const profileMenu = document.getElementById("profileMenu");

  if (token) {
    loginBtn?.classList.add("hidden");
    registerBtn?.classList.add("hidden");
    profileMenu?.classList.remove("hidden");
  } else {
    loginBtn?.classList.remove("hidden");
    registerBtn?.classList.remove("hidden");
    profileMenu?.classList.add("hidden");
  }
}

/* =============================
   LOGOUT
============================= */

function handleLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn || logoutBtn.dataset.bound === "true") return;

  logoutBtn.dataset.bound = "true";

  logoutBtn.addEventListener("click", () => {
    window.Storage?.clear?.();
    window.notify?.("Logged out successfully", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  });
}

/* =============================
   ROLE LINKS
============================= */

function handleRoleLinks() {
  const user = window.Storage?.getUser?.();
  const token = window.Storage?.getToken?.();

  const myListingsLink = document.getElementById("myListingsLink");
  const myBookingsLink = document.getElementById("myBookingsLink");
  const savedLink = document.getElementById("savedPropertiesLink");
  const adminLink = document.getElementById("adminLink");
  const usersLink = document.getElementById("usersLink");
  const postPropertyBtn = document.getElementById("postPropertyBtn");

  [
    myListingsLink,
    myBookingsLink,
    savedLink,
    adminLink,
    usersLink,
    postPropertyBtn
  ].forEach((el) => el?.classList.add("hidden"));

  if (!user || !token) return;

  const role = String(user.role || "").toLowerCase();

  if (role === "buyer") {
    myBookingsLink?.classList.remove("hidden");
    savedLink?.classList.remove("hidden");
  }

  if (role === "seller" || role === "agent") {
    myListingsLink?.classList.remove("hidden");
    postPropertyBtn?.classList.remove("hidden");
  }

  if (role === "admin") {
    adminLink?.classList.remove("hidden");
    usersLink?.classList.remove("hidden");
    myListingsLink?.classList.remove("hidden");
    postPropertyBtn?.classList.remove("hidden");
  }
}

/* =============================
   PROFILE DROPDOWN
============================= */

function handleProfileDropdown() {
  const toggle = document.getElementById("profileToggle");
  const menu = document.getElementById("dropdownMenu");

  if (!toggle || !menu || toggle.dataset.bound === "true") return;

  toggle.dataset.bound = "true";

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== toggle) {
      menu.classList.remove("open");
    }
  });
}

/* =============================
   MOBILE NAV
============================= */

function handleMobileToggle() {
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  if (!navToggle || !mainNav || navToggle.dataset.bound === "true") return;

  navToggle.dataset.bound = "true";

  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("nav--open");
    navToggle.classList.toggle("active");
  });
}

/* =============================
   SCROLL EFFECT
============================= */

function handleScrollEffect() {
  const header = document.querySelector(".app-header");
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
  };

  updateHeader();

  window.addEventListener(
    "scroll",
    window.Utils?.throttle?.(updateHeader, 150) || updateHeader
  );
}

/* =============================
   ACTIVE LINK
============================= */

function setActiveNavLink() {
  const links = document.querySelectorAll(".nav a, .main-nav a");
  const current = window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href) return;

    const cleanHref = href.split("?")[0];

    if (cleanHref === current) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/* expose globally */

window.initNavbar = initNavbar;