(function () {
    const { esc, $, money, icon } = UI;
    const root = $("#orders-root");
    const STEPS = ["Order Placed", "Processing", "Shipped", "Delivered"];

    if (!Session.user()) { location.replace("login.html?next=orders.html"); return; }

    function timeline(status) {
        if (status === "Cancelled") return "";
        const reached = STEPS.indexOf(status);
        return `<div class="timeline" aria-label="Order progress">${STEPS.map((s, i) =>
            `<div class="step ${i <= reached ? "done" : ""}">${s === "Order Placed" ? "Placed" : s}</div>`).join("")}</div>`;
    }

    function card(o) {
        const itemsTotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const shipping = Math.max(0, Number(o.total_amount) - itemsTotal);
        const cancellable = ["Order Placed", "Processing"].includes(o.status);
        return `<article class="card order-card" data-id="${o.id}">
            <dl class="order-head">
                <div><dt>Order</dt><dd>#${o.id}</dd></div>
                <div><dt>Placed on</dt><dd>${UI.formatDate(o.created_at)}</dd></div>
                <div><dt>Total</dt><dd>${money(o.total_amount)}</dd></div>
                <div><dt>Payment</dt><dd>${esc(o.payment_method)}</dd></div>
                <div>${UI.statusBadge(o.status)}</div>
            </dl>
            <div class="order-body">
                ${timeline(o.status)}
                ${o.items.map((i) => `<div class="mini-line">
                    <a href="product-details.html?id=${i.product_id}">${UI.img(i.image, i.name)}</a>
                    <div><strong><a href="product-details.html?id=${i.product_id}">${esc(i.name)}</a></strong><span>Qty ${i.quantity} × ${money(i.price)}</span></div>
                    <strong>${money(i.price * i.quantity)}</strong></div>`).join("")}
                <div class="order-foot">
                    <div class="muted" style="font-size:.9rem">
                        Delivering to ${esc(o.address)}, ${esc(o.city)}, ${esc(o.state)} ${esc(o.pincode)}
                        ${shipping ? ` · includes ${money(shipping)} delivery` : ""}</div>
                    ${cancellable ? `<button class="btn btn-danger-outline btn-sm" data-cancel="${o.id}">Cancel order</button>` : ""}
                </div>
            </div></article>`;
    }

    async function load() {
        try {
            const d = await api.get("/orders");
            root.innerHTML = d.orders.length
                ? d.orders.map(card).join("")
                : UI.emptyState({ iconName: "package", title: "No orders yet", text: "When you place an order it will show up here.", action: '<a class="btn btn-lg" href="products.html">Start shopping</a>' });
        } catch (e) {
            root.innerHTML = UI.emptyState({ iconName: "alert", title: "Couldn't load your orders", text: e.message, action: '<button class="btn" id="retry">Try again</button>' });
        }
    }

    root.addEventListener("click", async (e) => {
        if (e.target.closest("#retry")) return load();
        const btn = e.target.closest("[data-cancel]");
        if (!btn) return;
        if (!(await UI.confirmDialog("This will cancel the order and return the items to stock.", { title: `Cancel order #${btn.dataset.cancel}?`, confirmText: "Yes, cancel order", danger: true }))) return;
        btn.disabled = true;
        try {
            await api.put(`/orders/${btn.dataset.cancel}/cancel`);
            UI.toast("Order cancelled", "success");
            load();
        } catch (err) {
            UI.toast(err.message, "error");
            btn.disabled = false;
        }
    });

    load();
})();
