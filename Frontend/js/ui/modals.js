// =============================
// MODAL SYSTEM
// =============================

document.addEventListener("DOMContentLoaded", () => {

  const modalTriggers = document.querySelectorAll("[data-modal-target]");
  const closeButtons = document.querySelectorAll("[data-modal-close]");
  const modals = document.querySelectorAll(".modal");

  // Open modal
  modalTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const target = trigger.getAttribute("data-modal-target");
      const modal = document.getElementById(target);
      if (modal) modal.classList.add("active");
    });
  });

  // Close modal via close button
  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".modal").classList.remove("active");
    });
  });

  // Close when clicking outside modal content
  modals.forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  // Close on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modals.forEach(modal => modal.classList.remove("active"));
    }
  });

});