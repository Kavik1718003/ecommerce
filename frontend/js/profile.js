(function () {
    const { esc, icon, $, setFieldError } = UI;
    const root = $("#profile-root");

    if (!Session.user()) { location.replace("login.html?next=profile.html"); return; }

    function render(u) {
        root.innerHTML = `
        <div class="profile-layout">
            <aside class="card card-pad">
                <div class="avatar" aria-hidden="true">${esc(u.name.charAt(0).toUpperCase())}</div>
                <h2 style="margin-bottom:2px">${esc(u.name)}</h2>
                <p class="muted" style="word-break:break-all">${esc(u.email)}</p>
                <div class="stack" style="margin-top:20px;gap:8px">
                    <a class="btn btn-ghost" href="orders.html">${icon("package", "icon-sm")} My orders</a>
                    <a class="btn btn-ghost" href="cart.html">${icon("cart", "icon-sm")} My cart</a>
                    <button class="btn btn-danger-outline" id="logout">${icon("logout", "icon-sm")} Log out</button>
                </div>
            </aside>
            <div class="stack" style="gap:24px">
                <form class="card card-pad" id="details-form" novalidate>
                    <h2>Personal details</h2>
                    <div class="form-grid">
                        <div class="field"><label for="name">Full name</label><input class="input" id="name" value="${esc(u.name)}" autocomplete="name" required></div>
                        <div class="field"><label for="phone">Phone</label><input class="input" id="phone" value="${esc(u.phone)}" autocomplete="tel" required></div>
                        <div class="field full"><label for="email">Email</label><input class="input" id="email" value="${esc(u.email)}" disabled><span class="hint">Email can't be changed.</span></div>
                    </div>
                    <h2 style="margin-top:8px">Saved address</h2>
                    <div class="form-grid">
                        <div class="field full"><label for="address">Address</label><input class="input" id="address" value="${esc(u.address)}" autocomplete="street-address"></div>
                        <div class="field"><label for="city">City</label><input class="input" id="city" value="${esc(u.city)}"></div>
                        <div class="field"><label for="state">State</label><input class="input" id="state" value="${esc(u.state)}"></div>
                        <div class="field"><label for="pincode">Pincode</label><input class="input" id="pincode" value="${esc(u.pincode)}" inputmode="numeric" maxlength="8"></div>
                    </div>
                    <button class="btn" type="submit">Save changes</button>
                </form>

                <form class="card card-pad" id="password-form" novalidate>
                    <h2>Change password</h2>
                    <div class="form-grid">
                        <div class="field full"><label for="current">Current password</label><input class="input" id="current" type="password" autocomplete="current-password"></div>
                        <div class="field"><label for="next">New password</label><input class="input" id="next" type="password" autocomplete="new-password"><span class="hint">At least 8 characters.</span></div>
                        <div class="field"><label for="confirm">Confirm new password</label><input class="input" id="confirm" type="password" autocomplete="new-password"></div>
                    </div>
                    <button class="btn" type="submit">Update password</button>
                </form>
            </div>
        </div>`;

        $("#logout").addEventListener("click", logout);

        $("#details-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = $("#name"), phone = $("#phone"), pin = $("#pincode");
            setFieldError(name, name.value.trim().length < 2 ? "Please enter your full name" : "");
            setFieldError(phone, /^[0-9+\-\s]{7,15}$/.test(phone.value.trim()) ? "" : "Enter a valid phone number");
            setFieldError(pin, !pin.value.trim() || /^[0-9]{5,8}$/.test(pin.value.trim()) ? "" : "Enter a valid pincode");
            if ($(".field.invalid", e.target)) return;

            const btn = e.submitter; btn.disabled = true;
            try {
                const d = await api.put("/auth/me", {
                    name: name.value, phone: phone.value, address: $("#address").value,
                    city: $("#city").value, state: $("#state").value, pincode: pin.value
                });
                Session.setUser(d.user);
                UI.toast("Profile updated", "success");
                setTimeout(() => location.reload(), 600);
            } catch (err) { UI.toast(err.message, "error"); btn.disabled = false; }
        });

        $("#password-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const cur = $("#current"), next = $("#next"), conf = $("#confirm");
            setFieldError(cur, cur.value ? "" : "Enter your current password");
            setFieldError(next, next.value.length >= 8 ? "" : "Use at least 8 characters");
            setFieldError(conf, conf.value === next.value ? "" : "Passwords don't match");
            if ($(".field.invalid", e.target)) return;

            const btn = e.submitter; btn.disabled = true;
            try {
                await api.put("/auth/password", { currentPassword: cur.value, newPassword: next.value });
                UI.toast("Password updated", "success");
                e.target.reset();
            } catch (err) { setFieldError(cur, err.message); } finally { btn.disabled = false; }
        });
    }

    api.get("/auth/me").then((d) => render(d.user)).catch((e) => {
        root.innerHTML = UI.emptyState({ iconName: "alert", title: "Couldn't load your profile", text: e.message });
    });
})();
