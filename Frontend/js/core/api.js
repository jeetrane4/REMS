// =============================
// REMS API CLIENT (STABLE)
// =============================

const API_BASE = "https://rems-wha0.onrender.com/api";

async function apiRequest(endpoint, method = "GET", body = null) {

  const token = Storage?.getToken ? Storage.getToken() : null;

  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    let data = null;

    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {

      if (response.status === 401) {

        Storage?.clear?.();

        notify?.("Session expired. Please login again.", "error");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);

      }

      throw new Error(data?.message || `Request failed (${response.status})`);
    }

    return data;

  } catch (error) {

    console.error("API ERROR:", error);

    if (typeof notify === "function") {
      notify(error.message || "Network error", "error");
    }

    throw error;
  }
}