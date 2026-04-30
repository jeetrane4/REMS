document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggle();
  initLogin();
  initRegister();
  initPasswordStrength();
});

function initPasswordToggle() {
  document.querySelectorAll(".password-toggle").forEach((btn) => {
    if (btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.textContent = isPassword ? "🙈" : "👁";
    });
  });
}

function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form || form.dataset.bound === "true") return;

  form.dataset.bound = "true";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button[type='submit']");
    if (btn) btn.disabled = true;

    const data = Object.fromEntries(new FormData(form));
    data.email = data.email?.trim();
    data.password = data.password?.trim();

    try {
      window.showLoader?.();

      const res = await window.API.post("/auth/login", data);

      if (!res?.token || !res?.user) {
        throw new Error("Login failed");
      }

      window.Storage.setToken(res.token);
      window.Storage.setUser(res.user);

      window.notify?.("Login successful", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    } catch (err) {
      console.error(err);
      window.notify?.(err.message || "Login failed", "error");
    } finally {
      window.hideLoader?.();
      if (btn) btn.disabled = false;
    }
  });
}

function initRegister() {
  const form = document.getElementById("registerForm");
  if (!form || form.dataset.bound === "true") return;

  form.dataset.bound = "true";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button[type='submit']");
    if (btn) btn.disabled = true;

    const data = Object.fromEntries(new FormData(form));

    data.name = data.name?.trim();
    data.email = data.email?.trim();
    data.mobile = data.mobile?.trim();
    data.password = data.password?.trim();

    if (data.password !== data.confirmPassword) {
      if (btn) btn.disabled = false;
      return window.notify?.("Passwords do not match", "error");
    }

    if (!document.getElementById("termsCheck")?.checked) {
      if (btn) btn.disabled = false;
      return window.notify?.("You must accept Terms", "error");
    }

    delete data.confirmPassword;
    delete data.termsCheck;

    if (!data.role) data.role = "buyer";

    try {
      window.showLoader?.();

      const res = await window.API.post("/auth/register", data);

      if (res?.token) {
        window.Storage.setToken(res.token);

        if (res?.user) {
          window.Storage.setUser(res.user);
        } else {
          const me = await window.API.get("/auth/me");
          if (me?.user) window.Storage.setUser(me.user);
        }

        window.notify?.("Registration successful", "success");

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 700);
      } else {
        window.notify?.("Registration successful. Please login.", "success");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 700);
      }
    } catch (err) {
      console.error(err);
      window.notify?.(err.message || "Registration failed", "error");
    } finally {
      window.hideLoader?.();
      if (btn) btn.disabled = false;
    }
  });
}

function initPasswordStrength() {
  const input = document.getElementById("password");
  const indicator = document.getElementById("passwordStrength");

  if (!input || !indicator) return;

  input.addEventListener("input", () => {
    const val = input.value;

    let strength = "Weak";
    let className = "text-error";

    if (
      val.length >= 8 &&
      /[A-Z]/.test(val) &&
      /[a-z]/.test(val) &&
      /[0-9]/.test(val)
    ) {
      strength = "Strong";
      className = "text-success";
    } else if (val.length >= 6) {
      strength = "Medium";
      className = "text-warning";
    }

    indicator.textContent = `Password strength: ${strength}`;
    indicator.className = className;
  });
}

window.initPasswordToggle = initPasswordToggle;
window.initLogin = initLogin;
window.initRegister = initRegister;
window.initPasswordStrength = initPasswordStrength;