(function () {
    const { esc, icon, $, money } = UI;
    const root = $("#cart-root");

    if (!Session.user()) {
        location.replace("login.html?next=cart.html");
        return;
    }

    function line(i) {
        return `<div class="cart-line" data-id="${i.cart_item_id}">
            <a href="product-details.html?id=${i.product_id}">${UI.img(i.image, i.name)}</a>
            <div>
                <h3><a href="product-details.html?id=${i.product_id}">${esc(i.name)}</a></h3>
                <div class="muted">${money(i.final_price)}${i.discount > 0 ? ` <span class="price-old">${money(i.price)}</span>` : ""} each</div>
                ${i.quantity >= i.stock ? `<div class="stock-note stock-low">Max available: ${i.stock}</div>` : ""}
                <div class="line-controls">
                    <div class="qty" role="group" aria-label="Quantity for ${esc(i.name)}">
                        <button type="button" data-act="dec" aria-label="Decrease quantity" ${i.quantity <= 1 ? "disabled" : ""}>${icon("minus")}</button>
                        <output>${i.quantity}</output>
                        <button type="button" data-act="inc" aria-label="Increase quantity" ${i.quantity >= i.stock ? "disabled" : ""}>${icon("plus")}</button>
                    </div>
                    <button class="link-btn" data-act="remove">${icon("trash", "icon-sm")} Remove</button>
                </div>
            </div>
            <div class="line-total">${money(i.line_total)}</div>
        </div>`;
    }

    function render(data) {
        const { cart, summary } = data;
        if (!cart.length) {
            root.innerHTML = UI.emptyState({ iconName: "cart", title: "Your cart is empty", text: "Looks like you haven't added anything yet.", action: '<a class="btn btn-lg" href="products.html">Start shopping</a>' });
            return;
        }
        root.innerHTML = `
        <div class="cart-layout">
            <section class="card" aria-label="Cart items">
                ${cart.map(line).join("")}
                <div class="row row-between" style="padding:16px 18px;border-top:1px solid var(--border)">
                    <a class="btn btn-ghost btn-sm" href="products.html">← Continue shopping</a>
                    <button class="btn btn-danger-outline btn-sm" data-act="clear">Clear cart</button>
                </div>
            </section>
            <aside class="card summary" aria-label="Order summary">
                <h2>Order summary</h2>
                <div class="summary-row"><span>Subtotal (${summary.items} item${summary.items === 1 ? "" : "s"})</span><span>${money(summary.subtotal)}</span></div>
                ${summary.savings > 0 ? `<div class="summary-row"><span>Discount</span><span class="save">− ${money(summary.savings)}</span></div>` : ""}
                <div class="summary-row"><span>Delivery</span><span>${summary.shipping ? money(summary.shipping) : "Free"}</span></div>
                ${summary.shipping ? `<p class="muted" style="font-size:.85rem">Add ${money(999 - summary.total)} more for free delivery.</p>` : ""}
                <div class="summary-row total"><span>Total</span><span>${money(summary.grandTotal)}</span></div>
                <a class="btn btn-lg btn-block" href="checkout.html" style="margin-top:16px">Proceed to checkout</a>
                <p class="muted row" style="font-size:.85rem;margin-top:12px;justify-content:center;gap:6px">${icon("shield", "icon-sm")} Secure checkout</p>
            </aside>
        </div>`;
    }

    function apply(data) {
        Session.setCartCount(data.summary.items);
        render(data);
    }

    root.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const act = btn.dataset.act;
        const row = btn.closest(".cart-line");
        const id = row && row.dataset.id;
        try {
            if (act === "clear") {
                if (!(await UI.confirmDialog("Remove all items from your cart?", { title: "Clear cart", confirmText: "Clear cart", danger: true }))) return;
                apply(await api.del("/cart"));
            } else if (act === "remove") {
                apply(await api.del("/cart/items/" + id));
                UI.toast("Item removed");
            } else {
                const current = Number($("output", row).textContent);
                btn.disabled = true;
                apply(await api.put("/cart/items/" + id, { quantity: current + (act === "inc" ? 1 : -1) }));
            }
        } catch (err) {
            UI.toast(err.message, "error");
            btn.disabled = false;
        }
    });

    api.get("/cart").then(apply).catch((e) => {
        root.innerHTML = UI.emptyState({ iconName: "alert", title: "Couldn't load your cart", text: e.message });
    });
})();
