// =============================
// REMS API CLIENT
// =============================

const API_BASE = window.API_BASE || "http://localhost:5000/api";

/* =============================
   CORE REQUEST ENGINE
============================= */

async function apiRequest(endpoint, method = "GET", body = null, retries = 0) {
  const token = window.Storage?.getToken?.();

  const headers = {};

  const isFormData = body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
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
        window.Storage?.clear?.();

        window.notify?.("Session expired. Please login again.", "error");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 700);
      }

      throw new Error(data?.message || `API error (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", error);

    if (retries > 0) {
      return apiRequest(endpoint, method, body, retries - 1);
    }

    window.notify?.(error.message || "Network error", "error");
    throw error;
  }
}

/* =============================
   API SHORTCUTS
============================= */

const API = {
  get: (url) => apiRequest(url, "GET"),
  post: (url, data) => apiRequest(url, "POST", data),
  put: (url, data) => apiRequest(url, "PUT", data),
  patch: (url, data) => apiRequest(url, "PATCH", data),
  delete: (url) => apiRequest(url, "DELETE"),
  upload: (url, formData) => apiRequest(url, "POST", formData)
};

window.API_BASE = API_BASE;
window.apiRequest = apiRequest;
window.API = API;