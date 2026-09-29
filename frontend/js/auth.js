/* Login + register (same script, detects which form is on the page) */
(function () {
    const { $, icon, setFieldError } = UI;

    // Only allow redirecting to our own pages after login
    const safeNext = () => {
        const n = UI.qs("next") || "";
        return /^[a-z0-9-]+\.html(\?[^\s]*)?$/i.test(n) ? n : "products.html";
    };

    if (Session.user()) { location.replace(safeNext() === "products.html" ? "index.html" : safeNext()); return; }

    // Show / hide password toggle
    document.querySelectorAll("[data-toggle]").forEach((btn) => {
        const input = document.getElementById(btn.dataset.toggle);
        btn.innerHTML = icon("eye");
        btn.addEventListener("click", () => {
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            btn.innerHTML = icon(show ? "eye-off" : "eye");
            btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        });
    });

    const loginForm = $("#login-form");
    const registerForm = $("#register-form");
    const errorBox = $("#form-error");

    const busy = (btn, on, label) => {
        btn.disabled = on;
        btn.innerHTML = on ? `<span class="spinner"></span> ${label}` : label;
    };
    const showError = (msg) => { errorBox.textContent = msg; errorBox.hidden = !msg; };

    // Live-clear field errors
    document.querySelectorAll(".input").forEach((i) => i.addEventListener("input", () => setFieldError(i, "")));

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            showError("");
            const email = $("#email"), password = $("#password");
            setFieldError(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) ? "" : "Enter a valid email address");
            setFieldError(password, password.value ? "" : "Enter your password");
            if ($(".field.invalid", loginForm)) return;

            const btn = $("#submit");
            busy(btn, true, "Logging in");
            try {
                const d = await api.post("/auth/login", { email: email.value.trim(), password: password.value });
                Session.setUser(d.user, d.token);
                location.href = safeNext();
            } catch (err) {
                showError(err.message);
                busy(btn, false, "Log in");
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            showError("");
            const f = (id) => $("#" + id);
            setFieldError(f("name"), f("name").value.trim().length >= 2 ? "" : "Please enter your full name");
            setFieldError(f("email"), /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f("email").value.trim()) ? "" : "Enter a valid email address");
            setFieldError(f("phone"), /^[0-9+\-\s]{7,15}$/.test(f("phone").value.trim()) ? "" : "Enter a valid phone number");
            setFieldError(f("password"), f("password").value.length >= 8 ? "" : "Use at least 8 characters");
            setFieldError(f("confirm"), f("confirm").value === f("password").value ? "" : "Passwords don't match");
            if ($(".field.invalid", registerForm)) return;

            const btn = $("#submit");
            busy(btn, true, "Creating account");
            try {
                await api.post("/auth/register", {
                    name: f("name").value.trim(), email: f("email").value.trim(),
                    phone: f("phone").value.trim(), password: f("password").value
                });
                // Log the new customer straight in
                const d = await api.post("/auth/login", { email: f("email").value.trim(), password: f("password").value });
                Session.setUser(d.user, d.token);
                UI.toast("Welcome to Cartiva!", "success");
                setTimeout(() => (location.href = safeNext()), 600);
            } catch (err) {
                showError(err.message);
                busy(btn, false, "Create account");
            }
        });
    }
})();
