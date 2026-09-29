(function () {
    const { $, icon, setFieldError } = UI;
    if (Session.admin()) { location.replace("admin-dashboard.html"); return; }

    const btnToggle = document.querySelector("[data-toggle]");
    const pw = $("#password");
    btnToggle.innerHTML = icon("eye");
    btnToggle.addEventListener("click", () => {
        const show = pw.type === "password";
        pw.type = show ? "text" : "password";
        btnToggle.innerHTML = icon(show ? "eye-off" : "eye");
        btnToggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });

    const box = $("#form-error");
    $("#admin-login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        box.hidden = true;
        const email = $("#email");
        setFieldError(email, email.value.trim() ? "" : "Enter your email");
        setFieldError(pw, pw.value ? "" : "Enter your password");
        if ($(".field.invalid", e.target)) return;

        const btn = $("#submit");
        btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Signing in';
        try {
            const d = await api.post("/admin/login", { email: email.value.trim(), password: pw.value });
            Session.setAdmin(d.admin, d.token);
            location.href = "admin-dashboard.html";
        } catch (err) {
            box.textContent = err.message; box.hidden = false;
            btn.disabled = false; btn.textContent = "Sign in";
        }
    });
})();
