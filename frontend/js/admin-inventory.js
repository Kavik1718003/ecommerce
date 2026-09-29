(function () {
    const { esc, $, $$ } = UI;
    const main = Shell.adminShell("inventory", "Inventory");
    if (!main) return;

    let threshold = CARTIVA.LOW_STOCK;
    const filters = { search: "", low: UI.qs("low") === "1" };

    main.innerHTML = `
        <div class="filter-bar">
            <input class="input grow" id="search" type="search" placeholder="Search products" aria-label="Search products">
            <label class="row" style="gap:8px"><input type="checkbox" id="low" ${filters.low ? "checked" : ""} style="width:18px;height:18px;accent-color:var(--primary)"> Low stock only</label>
        </div>
        <div class="table-wrap"><table>
            <thead><tr><th>Product</th><th>Category</th><th>Status</th><th>Stock</th><th class="text-right">Update</th></tr></thead>
            <tbody id="rows"><tr><td colspan="5"><div class="skeleton" style="height:120px"></div></td></tr></tbody>
        </table></div>`;

    const badge = (s) => s === 0 ? '<span class="badge badge-danger">Out of stock</span>'
        : s <= threshold ? '<span class="badge badge-warning">Low stock</span>' : '<span class="badge badge-success">In stock</span>';

    async function load() {
        const q = new URLSearchParams();
        if (filters.search) q.set("search", filters.search);
        if (filters.low) q.set("low", "1");
        try {
            const d = await api.get("/admin/inventory?" + q);
            threshold = d.lowStockThreshold;
            $("#rows").innerHTML = d.inventory.length ? d.inventory.map((p) => `
                <tr data-id="${p.id}">
                    <td><div class="cell-product">${UI.img(p.image, p.name)}<div><strong>${esc(p.name)}</strong><span class="muted">#${p.id}</span></div></div></td>
                    <td>${esc(p.category_name || "—")}</td><td class="status-cell">${badge(p.stock)}</td>
                    <td><input class="input stock-input" type="number" min="0" step="1" value="${p.stock}" aria-label="Stock for ${esc(p.name)}"></td>
                    <td class="text-right"><button class="btn btn-sm" data-save="${p.id}">Save</button></td>
                </tr>`).join("") : `<tr><td colspan="5">${UI.emptyState({ title: "Nothing to show", text: filters.low ? "No products are running low." : "No products match your search." })}</td></tr>`;
        } catch (e) {
            $("#rows").innerHTML = `<tr><td colspan="5">${UI.emptyState({ iconName: "alert", title: "Couldn't load inventory", text: e.message })}</td></tr>`;
        }
    }

    main.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-save]");
        if (!btn) return;
        const row = btn.closest("tr");
        const input = $(".stock-input", row);
        const stock = Number(input.value);
        if (input.value === "" || !Number.isInteger(stock) || stock < 0) { input.focus(); return UI.toast("Enter a whole number, 0 or more", "error"); }
        btn.disabled = true;
        try {
            await api.put("/admin/inventory/" + btn.dataset.save, { stock });
            $(".status-cell", row).innerHTML = badge(stock);
            UI.toast("Stock updated", "success");
        } catch (err) { UI.toast(err.message, "error"); } finally { btn.disabled = false; }
    });
    $("#search").addEventListener("input", UI.debounce((e) => { filters.search = e.target.value.trim(); load(); }));
    $("#low").addEventListener("change", (e) => { filters.low = e.target.checked; load(); });
    load();
})();
