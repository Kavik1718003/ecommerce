(function () {
    const { esc, icon, $, money } = UI;
    const main = Shell.adminShell("products", "Products",
        `<button class="btn" id="add-product">${icon("plus", "icon-sm")} Add product</button>`);
    if (!main) return;

    let categories = [];
    let page = 1;
    const filters = { search: "", category: "" };

    main.innerHTML = `
        <div class="filter-bar">
            <input class="input grow" id="search" type="search" placeholder="Search products" aria-label="Search products">
            <select class="select" id="cat" aria-label="Filter by category"><option value="">All categories</option></select>
        </div>
        <div class="table-wrap"><table>
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Discount</th><th>Stock</th><th class="text-right">Actions</th></tr></thead>
            <tbody id="rows"><tr><td colspan="6"><div class="skeleton" style="height:120px"></div></td></tr></tbody>
        </table></div>
        <nav class="pagination" id="pagination" aria-label="Pagination"></nav>`;

    async function load() {
        const q = new URLSearchParams({ page, limit: 10, sort: "newest" });
        if (filters.search) q.set("search", filters.search);
        if (filters.category) q.set("category", filters.category);
        try {
            const d = await api.get("/products?" + q);
            $("#rows").innerHTML = d.products.length ? d.products.map((p) => `
                <tr data-id="${p.id}">
                    <td><div class="cell-product">${UI.img(p.image, p.name)}<div><strong>${esc(p.name)}</strong><span class="muted">#${p.id}</span></div></div></td>
                    <td>${esc(p.category_name || "—")}</td>
                    <td>${money(p.final_price)}${Number(p.discount) > 0 ? ` <span class="price-old">${money(p.price)}</span>` : ""}</td>
                    <td>${Number(p.discount) > 0 ? Math.round(p.discount) + "%" : "—"}</td>
                    <td><span class="badge ${p.stock === 0 ? "badge-danger" : p.stock <= CARTIVA.LOW_STOCK ? "badge-warning" : "badge-success"}">${p.stock}</span></td>
                    <td class="text-right"><button class="btn btn-ghost btn-sm" data-edit="${p.id}">${icon("edit", "icon-sm")} Edit</button>
                        <button class="btn btn-danger-outline btn-sm" data-del="${p.id}" data-name="${esc(p.name)}">${icon("trash", "icon-sm")}<span class="sr-only">Delete</span></button></td>
                </tr>`).join("") : `<tr><td colspan="6">${UI.emptyState({ title: "No products found", text: "Try a different search or add a new product." })}</td></tr>`;
            UI.renderPagination($("#pagination"), d, (p) => { page = p; load(); });
            main.dataset.products = JSON.stringify(d.products);
        } catch (e) {
            $("#rows").innerHTML = `<tr><td colspan="6">${UI.emptyState({ iconName: "alert", title: "Couldn't load products", text: e.message })}</td></tr>`;
        }
    }

    function formHtml(p) {
        const v = p || { name: "", category_id: "", description: "", price: "", discount: 0, stock: 0, image: "" };
        return `<form id="product-form" novalidate>
            <div class="form-grid">
                <div class="field full"><label for="f-name">Name</label><input class="input" id="f-name" value="${esc(v.name)}" required></div>
                <div class="field"><label for="f-cat">Category</label>
                    <select class="select" id="f-cat"><option value="">Uncategorised</option>
                    ${categories.map((c) => `<option value="${c.id}" ${String(c.id) === String(v.category_id) ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>
                <div class="field"><label for="f-price">Price (₹)</label><input class="input" id="f-price" type="number" min="0" step="0.01" value="${esc(v.price)}" required></div>
                <div class="field"><label for="f-discount">Discount (%)</label><input class="input" id="f-discount" type="number" min="0" max="90" step="1" value="${esc(v.discount)}"></div>
                <div class="field"><label for="f-stock">Stock</label><input class="input" id="f-stock" type="number" min="0" step="1" value="${esc(v.stock)}" required></div>
                <div class="field full"><label for="f-desc">Description</label><textarea class="textarea" id="f-desc">${esc(v.description)}</textarea></div>
                <div class="field full"><label for="f-image">Image path or URL</label>
                    <div class="row" style="flex-wrap:nowrap"><input class="input" id="f-image" placeholder="image/products/my-product.svg" value="${esc(v.image)}">
                    <img class="img-preview" id="f-preview" alt="Image preview" src="${esc(v.image || "image/product-placeholder.svg")}"></div>
                    <span class="hint">Use a file under frontend/image/ or a full https:// URL.</span></div>
            </div>
            <div id="f-error" class="alert alert-error" role="alert" hidden></div>
        </form>`;
    }

    async function openForm(p) {
        await UI.openModal({
            title: p ? "Edit product" : "Add product", wide: true, body: formHtml(p),
            footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn" id="f-save">${p ? "Save changes" : "Add product"}</button>`,
            onOpen: (root, close) => {
                const img = $("#f-image", root), prev = $("#f-preview", root);
                img.addEventListener("input", () => { prev.src = img.value.trim() || "image/product-placeholder.svg"; });
                prev.addEventListener("error", () => { prev.src = "image/product-placeholder.svg"; }, { once: false });
                const save = $("#f-save", root), err = $("#f-error", root);
                save.addEventListener("click", async () => {
                    err.hidden = true;
                    const body = {
                        name: $("#f-name", root).value.trim(), category_id: $("#f-cat", root).value,
                        price: $("#f-price", root).value, discount: $("#f-discount", root).value || 0,
                        stock: $("#f-stock", root).value, description: $("#f-desc", root).value.trim(), image: img.value.trim()
                    };
                    save.disabled = true;
                    try {
                        if (p) await api.put("/products/" + p.id, body); else await api.post("/products", body);
                        UI.toast(p ? "Product updated" : "Product added", "success");
                        close(true); load();
                    } catch (e) { err.textContent = e.message; err.hidden = false; save.disabled = false; }
                });
            }
        });
    }

    main.addEventListener("click", async (e) => {
        const edit = e.target.closest("[data-edit]");
        if (edit) {
            const p = JSON.parse(main.dataset.products).find((x) => x.id === Number(edit.dataset.edit));
            return openForm(p);
        }
        const del = e.target.closest("[data-del]");
        if (del && await UI.confirmDialog(`Delete “${del.dataset.name}”? This can't be undone.`, { title: "Delete product", confirmText: "Delete", danger: true })) {
            try { await api.del("/products/" + del.dataset.del); UI.toast("Product deleted", "success"); load(); }
            catch (err) { UI.toast(err.message, "error"); }
        }
    });
    $("#add-product").addEventListener("click", () => openForm(null));
    $("#search").addEventListener("input", UI.debounce((e) => { filters.search = e.target.value.trim(); page = 1; load(); }));
    $("#cat").addEventListener("change", (e) => { filters.category = e.target.value; page = 1; load(); });

    api.get("/categories").then((d) => {
        categories = d.categories;
        $("#cat").insertAdjacentHTML("beforeend", categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join(""));
    }).catch(() => {}).finally(load);
})();
