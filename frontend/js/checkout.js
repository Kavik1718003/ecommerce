(function () {
    const { esc, icon, $, money, setFieldError } = UI;
    const root = $("#checkout-root");

    if (!Session.user()) { location.replace("login.html?next=checkout.html"); return; }

    const PAYMENTS = [
        ["Cash on Delivery", "Pay when your order arrives"],
        ["UPI", "Pay instantly with any UPI app"],
        ["Card", "Credit or debit card"]
    ];

    function render(cart, me) {
        const { summary } = cart;
        root.innerHTML = `
        <form class="cart-layout" id="checkout-form" novalidate>
            <div class="stack">
                <section class="card card-pad">
                    <h2>Delivery address</h2>
                    <div class="form-grid">
                        <div class="field full"><label for="address">Address</label>
                            <input class="input" id="address" name="address" autocomplete="street-address" placeholder="House no., street, area" value="${esc(me.address)}" required></div>
                        <div class="field"><label for="city">City</label>
                            <input class="input" id="city" autocomplete="address-level2" value="${esc(me.city)}" required></div>
                        <div class="field"><label for="state">State</label>
                            <input class="input" id="state" autocomplete="address-level1" value="${esc(me.state)}" required></div>
                        <div class="field"><label for="pincode">Pincode</label>
                            <input class="input" id="pincode" inputmode="numeric" maxlength="8" autocomplete="postal-code" value="${esc(me.pincode)}" required></div>
                    </div>
                </section>
                <section class="card card-pad">
                    <h2>Payment method</h2>
                    <div class="pay-options" role="radiogroup" aria-label="Payment method">
                        ${PAYMENTS.map(([v, d], i) => `<label class="pay-option"><input type="radio" name="pay" value="${v}" ${i === 0 ? "checked" : ""}>
                            <div><strong>${v}</strong><span>${d}</span></div></label>`).join("")}
                    </div>
                </section>
            </div>
            <aside class="card summary" aria-label="Order summary">
                <h2>Order summary</h2>
                ${cart.cart.map((i) => `<div class="mini-line">${UI.img(i.image, i.name)}
                    <div><strong>${esc(i.name)}</strong><span>Qty ${i.quantity}</span></div><span>${money(i.line_total)}</span></div>`).join("")}
                <div class="summary-row" style="margin-top:8px"><span>Subtotal</span><span>${money(summary.subtotal)}</span></div>
                ${summary.savings > 0 ? `<div class="summary-row"><span>Discount</span><span class="save">− ${money(summary.savings)}</span></div>` : ""}
                <div class="summary-row"><span>Delivery</span><span>${summary.shipping ? money(summary.shipping) : "Free"}</span></div>
                <div class="summary-row total"><span>Total</span><span>${money(summary.grandTotal)}</span></div>
                <div id="form-error" class="alert alert-error" role="alert" hidden style="margin-top:12px"></div>
                <button class="btn btn-lg btn-block" id="place-btn" type="submit" style="margin-top:16px">Place order</button>
                <a class="btn btn-ghost btn-block" href="cart.html" style="margin-top:8px">Back to cart</a>
            </aside>
        </form>`;

        $("#checkout-form").addEventListener("submit", submit);
        ["address", "city", "state", "pincode"].forEach((id) =>
            $("#" + id).addEventListener("input", (e) => setFieldError(e.target, "")));
    }

    function validate() {
        let ok = true;
        const rules = {
            address: (v) => (v.length < 5 ? "Please enter your full address" : ""),
            city: (v) => (!v ? "City is required" : ""),
            state: (v) => (!v ? "State is required" : ""),
            pincode: (v) => (/^[0-9]{5,8}$/.test(v) ? "" : "Enter a valid pincode")
        };
        Object.entries(rules).forEach(([id, rule]) => {
            const input = $("#" + id);
            const msg = rule(input.value.trim());
            setFieldError(input, msg);
            if (msg && ok) { input.focus(); }
            if (msg) ok = false;
        });
        return ok;
    }

    async function submit(e) {
        e.preventDefault();
        const err = $("#form-error");
        err.hidden = true;
        if (!validate()) return;

        const btn = $("#place-btn");
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Placing order';

        try {
            const order = await api.post("/orders", {
                address: $("#address").value.trim(), city: $("#city").value.trim(),
                state: $("#state").value.trim(), pincode: $("#pincode").value.trim(),
                paymentMethod: document.querySelector('input[name="pay"]:checked').value
            });
            Session.setCartCount(0);
            root.innerHTML = `<div class="card success-card">
                <div class="tick">${icon("check")}</div>
                <h2>Thank you! Your order is placed.</h2>
                <p class="muted" style="margin:8px 0 4px">Order #${order.orderId} · ${money(order.totalAmount)}</p>
                <p class="muted">We'll keep you updated as it ships.</p>
                <div class="row" style="justify-content:center;margin-top:24px">
                    <a class="btn" href="orders.html">View my orders</a>
                    <a class="btn btn-ghost" href="products.html">Continue shopping</a>
                </div></div>`;
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (ex) {
            err.textContent = ex.message;
            err.hidden = false;
            btn.disabled = false;
            btn.textContent = "Place order";
        }
    }

    Promise.all([api.get("/cart"), api.get("/auth/me")]).then(([cart, me]) => {
        if (!cart.cart.length) {
            root.innerHTML = UI.emptyState({ iconName: "cart", title: "Your cart is empty", text: "Add something before checking out.", action: '<a class="btn btn-lg" href="products.html">Start shopping</a>' });
            return;
        }
        render(cart, me.user);
    }).catch((e) => {
        root.innerHTML = UI.emptyState({ iconName: "alert", title: "Couldn't load checkout", text: e.message });
    });
})();
