// =============================
// MODAL SYSTEM (IMPROVED)
// =============================

document.addEventListener("DOMContentLoaded", initModals);

function initModals() {
  bindModalTriggers();
  bindModalClose();
  bindOverlayClose();
  bindEscapeClose();
}

/* =============================
   OPEN MODAL
============================= */

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

/* =============================
   CLOSE MODAL
============================= */

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove("active");
  document.body.style.overflow = "";
}

/* =============================
   TRIGGERS
============================= */

function bindModalTriggers() {
  document.querySelectorAll("[data-modal-target]").forEach((trigger) => {
    if (trigger.dataset.bound === "true") return;

    trigger.dataset.bound = "true";

    trigger.addEventListener("click", () => {
      const target = trigger.getAttribute("data-modal-target");
      openModal(target);
    });
  });
}

/* =============================
   CLOSE BUTTONS
============================= */

function bindModalClose() {
  document.querySelectorAll("[data-modal-close]").forEach((btn) => {
    if (btn.dataset.bound === "true") return;

    btn.dataset.bound = "true";

    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      closeModal(modal);
    });
  });
}

/* =============================
   OVERLAY CLICK CLOSE
============================= */

function bindOverlayClose() {
  document.querySelectorAll(".modal").forEach((modal) => {
    if (modal.dataset.bound === "true") return;

    modal.dataset.bound = "true";

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
}

/* =============================
   ESC KEY CLOSE
============================= */

function bindEscapeClose() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.active").forEach((modal) => {
        closeModal(modal);
      });
    }
  });
}

/* =============================
   GLOBAL ACCESS
============================= */

window.openModal = openModal;
window.closeModal = closeModal;