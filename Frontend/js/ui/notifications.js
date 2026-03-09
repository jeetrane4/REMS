// =============================
// NOTIFICATION SYSTEM
// =============================

function notify(message, type = "success") {
  const div = document.createElement("div");
  div.className = `notification ${type}`;
  div.innerText = message;

  document.body.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}