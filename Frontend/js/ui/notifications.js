// =============================
// NOTIFICATION SYSTEM – PRO
// =============================

const MAX_NOTIFICATIONS = 4;

function getContainer() {
  let container = document.getElementById("notificationContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "notificationContainer";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";

    document.body.appendChild(container);
  }

  return container;
}

function notify(message, type = "success", duration = 3000) {
  const container = getContainer();

  // limit notifications
  if (container.children.length >= MAX_NOTIFICATIONS) {
    container.removeChild(container.firstChild);
  }

  const div = document.createElement("div");
  div.className = `notification ${type}`;
  div.textContent = message;

  // basic styles (fallback if CSS missing)
  div.style.padding = "10px 14px";
  div.style.borderRadius = "6px";
  div.style.color = "#fff";
  div.style.fontSize = "14px";
  div.style.cursor = "pointer";
  div.style.opacity = "0";
  div.style.transform = "translateX(20px)";
  div.style.transition = "all 0.3s ease";

  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8"
  };

  div.style.background = colors[type] || colors.success;

  container.appendChild(div);

  // animate in
  requestAnimationFrame(() => {
    div.style.opacity = "1";
    div.style.transform = "translateX(0)";
  });

  // click to dismiss
  div.addEventListener("click", () => removeNotification(div));

  // auto remove
  const timeout = setTimeout(() => {
    removeNotification(div);
  }, duration);

  function removeNotification(el) {
    clearTimeout(timeout);
    el.style.opacity = "0";
    el.style.transform = "translateX(20px)";

    setTimeout(() => el.remove(), 300);
  }
}

/* expose globally */

window.notify = notify;