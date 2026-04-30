// =============================
// STORAGE MANAGER – PRO VERSION
// =============================

const STORAGE_PREFIX = "rems_";

const Storage = {

  /* =========================
     INTERNAL HELPERS
  ========================= */

  _set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch (e) {
      console.error("Storage set error:", e);
    }
  },

  _get(key) {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key);
    } catch (e) {
      console.error("Storage get error:", e);
      return null;
    }
  },

  _remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (e) {
      console.error("Storage remove error:", e);
    }
  },

  /* =========================
     TOKEN
  ========================= */

  setToken(token) {
    if (!token) return;
    this._set("token", token);
  },

  getToken() {
    return this._get("token");
  },

  removeToken() {
    this._remove("token");
  },

  /* =========================
     USER
  ========================= */

  setUser(user) {
    if (!user) return;
    this._set("user", JSON.stringify(user));
  },

  getUser() {
    try {
      const user = this._get("user");
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error("User parse error:", e);
      this._remove("user");
      return null;
    }
  },

  getUserRole() {
    return this.getUser()?.role || null;
  },

  /* =========================
     AUTH STATE
  ========================= */

  isLoggedIn() {
    return !!this.getToken();
  },

  logout() {
    this.clear();
    window.location.href = "login.html";
  },

  /* =========================
     CLEAR ALL
  ========================= */

  clear() {
    this._remove("token");
    this._remove("user");
  }

};

/* =========================
   SYNC LOGOUT ACROSS TABS
========================= */

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_PREFIX + "token" && !event.newValue) {
    window.location.href = "login.html";
  }
});

/* expose globally */

window.Storage = Storage;