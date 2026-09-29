(function () {
    const { esc, $, money } = UI;
    const main = Shell.adminShell("users", "Customers");
    if (!main) return;

    main.innerHTML = `
        <div class="filter-bar"><input class="input grow" id="search" type="search" placeholder="Search by name or email" aria-label="Search customers"></div>
        <div class="table-wrap"><table>
            <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Orders</th><th class="text-right">Total spent</th></tr></thead>
            <tbody id="rows"><tr><td colspan="5"><div class="skeleton" style="height:120px"></div></td></tr></tbody>
        </table></div>`;

    async function load(search = "") {
        try {
            const d = await api.get("/admin/users" + (search ? "?search=" + encodeURIComponent(search) : ""));
            $("#rows").innerHTML = d.customers.length ? d.customers.map((c) => `
                <tr><td><strong>${esc(c.name)}</strong><span class="muted" style="display:block;font-size:.85rem">${esc(c.email)}</span></td>
                    <td>${esc(c.phone || "—")}</td><td>${UI.formatDate(c.created_at)}</td><td>${c.order_count}</td>
                    <td class="text-right"><strong>${money(c.total_spent)}</strong></td></tr>`).join("")
                : `<tr><td colspan="5">${UI.emptyState({ iconName: "users", title: "No customers found", text: "Registered customers will appear here." })}</td></tr>`;
        } catch (e) {
            $("#rows").innerHTML = `<tr><td colspan="5">${UI.emptyState({ iconName: "alert", title: "Couldn't load customers", text: e.message })}</td></tr>`;
        }
    }
    $("#search").addEventListener("input", UI.debounce((e) => load(e.target.value.trim())));
    load();
})();
