document.addEventListener("DOMContentLoaded", () => {

initPasswordToggle();
initLogin();
initRegister();
initPasswordStrength();

});


/* =========================
PASSWORD TOGGLE
========================= */

function initPasswordToggle(){

const toggles = document.querySelectorAll(".password-toggle");

toggles.forEach(btn => {

btn.addEventListener("click",()=>{

const input = document.getElementById(btn.dataset.target);

if(!input) return;

const isPassword = input.type === "password";

input.type = isPassword ? "text" : "password";

/* change icon */
btn.textContent = isPassword ? "🙈" : "👁";

});

});

}



/* =========================
LOGIN
========================= */

function initLogin(){

const form = document.getElementById("loginForm");

if(!form) return;

form.addEventListener("submit", async e=>{

e.preventDefault();

const btn = form.querySelector("button[type='submit']");
btn.disabled = true;

const data = Object.fromEntries(new FormData(form));

data.email = data.email?.trim();
data.password = data.password?.trim();

try{

showLoader();

const res = await apiRequest("/auth/login","POST",data);

if(!res|| !res.token){
throw new Error("Login Failed");
}

Storage.setToken(res.token);
Storage.setUser(res.user);

notify("Login successful","success");

setTimeout(()=>{

window.location.href = "dashboard.html";

},800);

}catch(err){

console.error(err);

notify(err.message || "Login failed","error");

}finally{

hideLoader();
btn.disabled = false;

}

});

}



/* =========================
REGISTER
========================= */

function initRegister(){

const form = document.getElementById("registerForm");

if(!form) return;

form.addEventListener("submit", async e=>{

e.preventDefault();

const btn = form.querySelector("button[type='submit']");
btn.disabled = true;

const data = Object.fromEntries(new FormData(form));

data.name = data.name?.trim();
data.email = data.email?.trim();

/* password match */

if(data.password !== data.confirmPassword){
btn.disabled=false;
return notify("Passwords do not match","error");
}

/* terms */

if(!document.getElementById("termsCheck")?.checked){
btn.disabled=false;
return notify("You must accept Terms","error");
}

/* remove confirmPassword before sending */

delete data.confirmPassword;

try{

showLoader();

await apiRequest("/auth/register","POST",data);

notify("Registration successful","success");

setTimeout(()=>{

window.location.href = "login.html";

},800);

}catch(err){

console.error(err);

notify(err.message || "Registration failed","error");

}finally{

hideLoader();
btn.disabled = false;

}

});

}



/* =========================
PASSWORD STRENGTH
========================= */

function initPasswordStrength(){

const input = document.getElementById("password");
const indicator = document.getElementById("passwordStrength");

if(!input || !indicator) return;

input.addEventListener("input",()=>{

const val = input.value;

let strength = "Weak";
let color = "var(--color-error)";

if(val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)){
strength = "Strong";
color = "var(--color-success)";
}
else if(val.length >=6){
strength = "Medium";
color = "var(--color-warning)";
}

indicator.textContent = `Password strength: ${strength}`;
indicator.style.color = color;

});

}