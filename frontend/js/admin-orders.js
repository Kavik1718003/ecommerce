(function () {
    const { esc, icon, $, money } = UI;
    const main = Shell.adminShell("orders", "Orders");
    if (!main) return;

    const STATUSES = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
    let page = 1;
    let transitions = {};
    const filters = { status: "", search: "" };

    main.innerHTML = `
        <div class="filter-bar">
            <input class="input grow" id="search" type="search" placeholder="Search by order #, customer name or email" aria-label="Search orders">
            <select class="select" id="status" aria-label="Filter by status"><option value="">All statuses</option>
                ${STATUSES.map((s) => `<option>${s}</option>`).join("")}</select>
        </div>
        <div class="table-wrap"><table>
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th><th class="text-right">Actions</th></tr></thead>
            <tbody id="rows"><tr><td colspan="7"><div class="skeleton" style="height:120px"></div></td></tr></tbody>
        </table></div>
        <nav class="pagination" id="pagination" aria-label="Pagination"></nav>`;

    async function load() {
        const q = new URLSearchParams({ page, limit: 10 });
        if (filters.status) q.set("status", filters.status);
        if (filters.search) q.set("search", filters.search);
        try {
            const d = await api.get("/admin/orders?" + q);
            transitions = d.nextStatuses;
            $("#rows").innerHTML = d.orders.length ? d.orders.map((o) => `
                <tr><td><strong>#${o.id}</strong></td>
                    <td><strong>${esc(o.customer_name)}</strong><span class="muted" style="display:block;font-size:.85rem">${esc(o.customer_email)}</span></td>
                    <td>${UI.formatDate(o.created_at)}</td><td>${money(o.total_amount)}</td><td>${esc(o.payment_method)}</td>
                    <td>${UI.statusBadge(o.status)}</td>
                    <td class="text-right"><button class="btn btn-ghost btn-sm" data-view="${o.id}">${icon("eye", "icon-sm")} View</button></td></tr>`).join("")
                : `<tr><td colspan="7">${UI.emptyState({ iconName: "bag", title: "No orders found", text: "Orders matching these filters will appear here." })}</td></tr>`;
            UI.renderPagination($("#pagination"), d, (p) => { page = p; load(); });
        } catch (e) {
            $("#rows").innerHTML = `<tr><td colspan="7">${UI.emptyState({ iconName: "alert", title: "Couldn't load orders", text: e.message })}</td></tr>`;
        }
    }

    async function view(id) {
        let d;
        try { d = await api.get("/admin/orders/" + id); } catch (e) { return UI.toast(e.message, "error"); }
        const o = d.order;
        const next = d.nextStatuses;
        await UI.openModal({
            title: `Order #${o.id}`, wide: true,
            body: `
            <div class="drawer-grid">
                <dl><dt>Customer</dt><dd>${esc(o.customer_name)}</dd><dt>Email</dt><dd>${esc(o.customer_email)}</dd><dt>Phone</dt><dd>${esc(o.customer_phone || "—")}</dd></dl>
                <dl><dt>Placed</dt><dd>${UI.formatDateTime(o.created_at)}</dd><dt>Payment</dt><dd>${esc(o.payment_method)}</dd><dt>Status</dt><dd>${UI.statusBadge(o.status)}</dd></dl>
                <dl class="full" style="grid-column:1/-1"><dt>Delivery address</dt><dd>${esc(o.address)}, ${esc(o.city)}, ${esc(o.state)} ${esc(o.pincode)}</dd></dl>
            </div>
            <div class="table-wrap"><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th class="text-right">Total</th></tr></thead><tbody>
                ${o.items.map((i) => `<tr><td><div class="cell-product">${UI.img(i.image, i.name)}<strong>${esc(i.name)}</strong></div></td><td>${i.quantity}</td><td>${money(i.price)}</td><td class="text-right">${money(i.price * i.quantity)}</td></tr>`).join("")}
                <tr><td colspan="3" class="text-right"><strong>Order total (incl. delivery)</strong></td><td class="text-right"><strong>${money(o.total_amount)}</strong></td></tr>
            </tbody></table></div>
            ${next.length ? `<div class="field" style="margin-top:20px"><label for="new-status">Update status</label>
                <div class="row"><select class="select" id="new-status" style="width:auto">${next.map((s) => `<option>${s}</option>`).join("")}</select>
                <button class="btn" id="apply-status">Update</button></div>
                <span class="hint">Cancelling returns the items to stock.</span></div>`
                : '<p class="muted" style="margin-top:16px">This order is final and can no longer be changed.</p>'}`,
            onOpen: (root, close) => {
                const apply = $("#apply-status", root);
                if (!apply) return;
                apply.addEventListener("click", async () => {
                    const status = $("#new-status", root).value;
                    if (status === "Cancelled" && !(await UI.confirmDialog(`Cancel order #${o.id}? Items will be returned to stock.`, { title: "Cancel order", confirmText: "Cancel order", danger: true }))) return;
                    apply.disabled = true;
                    try { await api.put(`/admin/orders/${o.id}/status`, { status }); UI.toast("Order updated", "success"); close(true); load(); }
                    catch (e) { UI.toast(e.message, "error"); apply.disabled = false; }
                });
            }
        });
    }

    main.addEventListener("click", (e) => { const v = e.target.closest("[data-view]"); if (v) view(v.dataset.view); });
    $("#search").addEventListener("input", UI.debounce((e) => { filters.search = e.target.value.trim(); page = 1; load(); }));
    $("#status").addEventListener("change", (e) => { filters.status = e.target.value; page = 1; load(); });
    load();
})();
