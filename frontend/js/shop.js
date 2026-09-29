/* Shop page: server-side search / filter / sort / pagination.
   State lives in the URL so results are shareable and Back works. */
(function () {
    const { esc, $, icon, debounce } = UI;
    const grid = $("#grid");
    let categories = [];

    const state = () => {
        const p = new URLSearchParams(location.search);
        return {
            search: p.get("search") || "", category: p.get("category") || "",
            min: p.get("min") || "", max: p.get("max") || "", inStock: p.get("inStock") === "1",
            sort: p.get("sort") || "newest", page: Number(p.get("page")) || 1
        };
    };

    function push(next, replace) {
        const p = new URLSearchParams();
        Object.entries(next).forEach(([k, v]) => {
            if (v === "" || v === false || v === null || (k === "sort" && v === "newest") || (k === "page" && v === 1)) return;
            p.set(k, v === true ? "1" : v);
        });
        const url = location.pathname + (p.toString() ? "?" + p : "");
        history[replace ? "replaceState" : "pushState"]({}, "", url);
        load();
    }

    function renderFilters(s) {
        $("#category-list").innerHTML =
            `<label><input type="radio" name="cat" value="" ${!s.category ? "checked" : ""}> All categories</label>` +
            categories.map((c) => `<label><input type="radio" name="cat" value="${c.id}" ${String(c.id) === s.category ? "checked" : ""}> ${esc(c.name)}<span class="count">${c.product_count}</span></label>`).join("");
        $("#min").value = s.min; $("#max").value = s.max;
        $("#in-stock").checked = s.inStock; $("#sort").value = s.sort;
        const hq = document.getElementById("header-q"); if (hq) hq.value = s.search;

        const chips = [];
        const cat = categories.find((c) => String(c.id) === s.category);
        if (s.search) chips.push(["search", `“${s.search}”`]);
        if (cat) chips.push(["category", cat.name]);
        if (s.min) chips.push(["min", `Min ₹${s.min}`]);
        if (s.max) chips.push(["max", `Max ₹${s.max}`]);
        if (s.inStock) chips.push(["inStock", "In stock"]);
        $("#chips").innerHTML = chips.map(([k, l]) => `<span class="chip">${esc(l)}<button data-clear="${k}" aria-label="Remove filter ${esc(l)}">${icon("x", "icon-sm")}</button></span>`).join("");
        $("#shop-title").textContent = cat ? cat.name : s.search ? "Search results" : "All products";
        $("#filter-toggle").innerHTML = `${icon("filter", "icon-sm")} Filters${chips.length ? ` (${chips.length})` : ""}`;
    }

    async function load() {
        const s = state();
        renderFilters(s);
        grid.innerHTML = UI.skeletonCards(8);

        const q = new URLSearchParams({ sort: s.sort, page: s.page, limit: 12 });
        if (s.search) q.set("search", s.search);
        if (s.category) q.set("category", s.category);
        if (s.min) q.set("min", s.min);
        if (s.max) q.set("max", s.max);
        if (s.inStock) q.set("inStock", "1");

        try {
            const d = await api.get("/products?" + q);
            $("#shop-count").textContent = d.total ? `${d.total} product${d.total === 1 ? "" : "s"} found` : "No products found";
            grid.innerHTML = d.products.length
                ? d.products.map(UI.productCard).join("")
                : `<div style="grid-column:1/-1">${UI.emptyState({ iconName: "search", title: "No products match your filters", text: "Try removing a filter or searching for something else.", action: '<button class="btn" id="empty-clear">Clear filters</button>' })}</div>`;
            UI.renderPagination($("#pagination"), d, (p) => { push({ ...state(), page: p }); window.scrollTo({ top: 0, behavior: "smooth" }); });
        } catch (e) {
            grid.innerHTML = `<div style="grid-column:1/-1">${UI.emptyState({ iconName: "alert", title: "Couldn't load products", text: e.message, action: '<button class="btn" id="retry">Try again</button>' })}</div>`;
        }
    }

    UI.bindAddToCart(grid);

    document.addEventListener("click", (e) => {
        if (e.target.closest("#clear-filters, #empty-clear")) return push({}, false);
        if (e.target.closest("#retry")) return load();
        const c = e.target.closest("[data-clear]");
        if (c) { const s = state(); s[c.dataset.clear] = c.dataset.clear === "inStock" ? false : ""; s.page = 1; push(s); }
    });
    $("#category-list").addEventListener("change", (e) => { push({ ...state(), category: e.target.value, page: 1 }); });
    $("#sort").addEventListener("change", (e) => push({ ...state(), sort: e.target.value, page: 1 }));
    $("#in-stock").addEventListener("change", (e) => push({ ...state(), inStock: e.target.checked, page: 1 }));
    const onPrice = debounce(() => push({ ...state(), min: $("#min").value, max: $("#max").value, page: 1 }, true), 500);
    $("#min").addEventListener("input", onPrice);
    $("#max").addEventListener("input", onPrice);
    $("#filter-toggle").addEventListener("click", (e) => {
        const open = $("#filters").classList.toggle("open");
        e.currentTarget.setAttribute("aria-expanded", open);
    });
    window.addEventListener("popstate", load);

    // Header search on this page filters in place
    document.addEventListener("submit", (e) => {
        if (e.target.id !== "header-search") return;
        e.preventDefault(); e.stopImmediatePropagation();
        push({ ...state(), search: $("#header-q").value.trim(), page: 1 });
    }, true);

    api.get("/categories").then((d) => { categories = d.categories; }).catch(() => {}).finally(load);
})();
