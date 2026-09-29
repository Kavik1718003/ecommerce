(function () {
    const { esc, icon, money } = UI;
    const main = Shell.adminShell("dashboard", "Dashboard");
    if (!main) return;

    main.innerHTML = `<div class="kpis">${'<div class="card kpi"><div class="skeleton" style="width:100%;height:50px"></div></div>'.repeat(4)}</div>`;

    const kpi = (ico, tone, label, value) =>
        `<div class="card kpi"><span class="ico ${tone}">${icon(ico)}</span><div><span>${label}</span><strong>${value}</strong></div></div>`;

    function render(d) {
        const s = d.stats;
        const maxStatus = Math.max(1, ...d.ordersByStatus.map((x) => x.count));
        main.innerHTML = `
        <div class="kpis">
            ${kpi("rupee", "", "Revenue", money(s.revenue))}
            ${kpi("bag", "blue", "Total orders", s.orders)}
            ${kpi("clock", "amber", "Pending orders", s.pendingOrders)}
            ${kpi("users", "", "Customers", s.customers)}
        </div>
        <div class="kpis" style="grid-template-columns:repeat(2,1fr)">
            ${kpi("package", "blue", "Products", s.products)}
            ${kpi("alert", s.lowStock ? "red" : "", `Low stock (≤ ${s.lowStockThreshold})`, s.lowStock)}
        </div>
        <div class="dash-grid">
            <section class="card">
                <div class="panel-head"><h2>Recent orders</h2><a class="btn btn-ghost btn-sm" href="admin-orders.html">View all</a></div>
                ${d.recentOrders.length ? `<div class="table-wrap" style="border:0;border-radius:0"><table>
                    <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>${d.recentOrders.map((o) => `<tr><td>#${o.id}</td><td>${esc(o.customer_name)}</td><td>${money(o.total_amount)}</td><td>${UI.statusBadge(o.status)}</td><td>${UI.formatDate(o.created_at)}</td></tr>`).join("")}</tbody>
                </table></div>` : UI.emptyState({ title: "No orders yet", text: "New orders will appear here." })}
            </section>
            <div class="stack">
                <section class="card">
                    <div class="panel-head"><h2>Orders by status</h2></div>
                    ${d.ordersByStatus.length ? `<div class="bars">${d.ordersByStatus.map((x) => `
                        <div class="bar-row"><span>${esc(x.status)}</span><div class="bar-track"><div class="bar-fill" style="width:${(x.count / maxStatus) * 100}%"></div></div><strong>${x.count}</strong></div>`).join("")}</div>`
                        : '<p class="muted" style="padding:20px">No orders yet.</p>'}
                </section>
                <section class="card">
                    <div class="panel-head"><h2>Low stock</h2><a class="btn btn-ghost btn-sm" href="admin-inventory.html?low=1">Manage</a></div>
                    ${d.lowStock.length ? d.lowStock.map((p) => `<div class="list-row">${UI.img(p.image, p.name)}
                        <div class="grow"><strong>${esc(p.name)}</strong></div>
                        <span class="badge ${p.stock === 0 ? "badge-danger" : "badge-warning"}">${p.stock === 0 ? "Out of stock" : p.stock + " left"}</span></div>`).join("")
                        : '<p class="muted" style="padding:20px">All products are well stocked.</p>'}
                </section>
            </div>
        </div>`;
    }

    api.get("/admin/stats").then(render).catch((e) => {
        main.innerHTML = UI.emptyState({ iconName: "alert", title: "Couldn't load the dashboard", text: e.message });
    });
})();
