// =============================
// MAIN ENGINE (REMS)
// =============================

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {

  try {

    showLoader?.();

    await loadPartials();

    if (typeof initNavbar === "function") {
      initNavbar();
    }

    applyRoleVisibility();

    protectRoutes();

    initBackToTop();

  } catch (error) {

    console.error("App initialization failed:", error);

  } finally {

    hideLoader?.();

  }
}


/* =============================
LOAD HEADER + FOOTER
============================= */

async function loadPartials() {

  const headerEl = document.getElementById("header");
  const footerEl = document.getElementById("footer");

  const requests = [];

  if (headerEl) {
    requests.push(fetch("partials/header.html"));
  }

  if (footerEl) {
    requests.push(fetch("partials/footer.html"));
  }

  const responses = await Promise.all(requests);

  let index = 0;

  if (headerEl && responses[index]?.ok) {
    headerEl.innerHTML = await responses[index].text();
    index++;
  }

  if (footerEl && responses[index]?.ok) {
    footerEl.innerHTML = await responses[index].text();
  }

}


/* =============================
ROLE BASED UI CONTROL
============================= */

function applyRoleVisibility(){

  const user = Storage?.getUser?.();

  if(!user) return;

  if(user.role === "buyer"){

    document
      .querySelectorAll('[href="add-property.html"]')
      .forEach(btn => btn.remove());

    const postBtn = document.getElementById("postPropertyBtn");
    if(postBtn) postBtn.remove();

  }

}


/* =============================
ROUTE PROTECTION
============================= */

function protectRoutes(){

  const token = Storage?.getToken?.();

  const protectedElements = document.querySelectorAll("[data-protected]");

  protectedElements.forEach(el => {

    if(!token){
      el.style.display = "none";
    }

  });

}


/* =============================
BACK TO TOP BUTTON
============================= */

function initBackToTop(){

  const topBtn = document.getElementById("topBtn");

  if(!topBtn) return;

  window.addEventListener("scroll", () => {

    if(window.scrollY > 300){
      topBtn.classList.remove("hidden");
    }else{
      topBtn.classList.add("hidden");
    }

  });

  topBtn.addEventListener("click", () => {

    window.scrollTo({
      top:0,
      behavior:"smooth"
    });

  });

}