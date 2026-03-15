// =============================
// REMS API CLIENT (UPGRADED)
// =============================

const API_BASE = window.API_BASE || "http://localhost:5000/api";

/* =============================
CORE REQUEST ENGINE
============================= */

async function apiRequest(endpoint, method = "GET", body = null, retries = 1) {

  const token = Storage?.getToken?.();

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
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {

      if (response.status === 401) {

        Storage?.clear?.();

        notify?.("Session expired. Please login again.", "error");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1000);
      }

      throw new Error(data?.message || `API error (${response.status})`);
    }

    return data;

  } catch (error) {

    console.error("API ERROR:", error);

    if (retries > 0) {
      return apiRequest(endpoint, method, body, retries - 1);
    }

    notify?.(error.message || "Network error", "error");

    throw error;
  }
}

/* =============================
API SHORTCUTS
============================= */

const API = {

  get: (url) => apiRequest(url),

  post: (url, data) => apiRequest(url, "POST", data),

  put: (url, data) => apiRequest(url, "PUT", data),

  delete: (url) => apiRequest(url, "DELETE")

};

/* expose globally */

window.apiRequest = apiRequest;
window.API = API;