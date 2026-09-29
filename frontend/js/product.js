(function () {
    const { esc, icon, $, money } = UI;
    const root = $("#product-root");
    const id = Number(UI.qs("id"));
    let qty = 1;

    function render(p) {
        document.title = `${p.name} - Cartiva`;
        const out = p.stock <= 0;
        root.innerHTML = `
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span>/</span><a href="products.html">Shop</a><span>/</span>
            ${p.category_id ? `<a href="products.html?category=${p.category_id}">${esc(p.category_name)}</a><span>/</span>` : ""}
            <span>${esc(p.name)}</span></nav>
        <div class="pdp">
            <div class="pdp-media">${UI.img(p.image, p.name).replace('loading="lazy"', "")}</div>
            <div class="pdp-info">
                <span class="product-cat">${esc(p.category_name || "General")}</span>
                <h1>${esc(p.name)}</h1>
                ${UI.stockNote(p.stock)}
                <div class="pdp-price">
                    <span class="price">${money(p.final_price)}</span>
                    ${Number(p.discount) > 0 ? `<span class="price-old">${money(p.price)}</span><span class="badge badge-success">Save ${Math.round(p.discount)}%</span>` : ""}
                </div>
                <p class="muted">${esc(p.description || "No description available.")}</p>
                <div class="pdp-actions">
                    <div class="qty" role="group" aria-label="Quantity">
                        <button type="button" id="qty-minus" aria-label="Decrease quantity" ${out ? "disabled" : ""}>${icon("minus")}</button>
                        <output id="qty-val" aria-live="polite">1</output>
                        <button type="button" id="qty-plus" aria-label="Increase quantity" ${out ? "disabled" : ""}>${icon("plus")}</button>
                    </div>
                    <button class="btn btn-lg" id="add-btn" ${out ? "disabled" : ""}>${icon("cart")} ${out ? "Out of stock" : "Add to cart"}</button>
                    <button class="btn btn-lg btn-outline" id="buy-btn" ${out ? "disabled" : ""}>Buy now</button>
                </div>
                <div class="perks">
                    <div>${icon("truck")}Free delivery on orders above ₹999</div>
                    <div>${icon("refresh")}7-day easy returns</div>
                    <div>${icon("shield")}Secure checkout, cash on delivery available</div>
                </div>
            </div>
        </div>`;

        const val = $("#qty-val");
        const set = (n) => { qty = Math.min(Math.max(n, 1), Math.min(p.stock, 99)); val.textContent = qty; };
        $("#qty-minus").addEventListener("click", () => set(qty - 1));
        $("#qty-plus").addEventListener("click", () => set(qty + 1));
        $("#add-btn").addEventListener("click", (e) => UI.addToCart(p.id, qty, e.currentTarget));
        $("#buy-btn").addEventListener("click", async (e) => {
            if (await UI.addToCart(p.id, qty, e.currentTarget)) location.href = "checkout.html";
        });
    }

    if (!id) {
        root.innerHTML = UI.emptyState({ iconName: "search", title: "Product not found", text: "The link may be broken.", action: '<a class="btn" href="products.html">Browse products</a>' });
        return;
    }

    UI.bindAddToCart(document.getElementById("related"));

    api.get("/products/" + id).then((d) => {
        render(d.product);
        if (d.related.length) {
            $("#related").innerHTML = d.related.map(UI.productCard).join("");
            $("#related-section").hidden = false;
        }
    }).catch((e) => {
        root.innerHTML = UI.emptyState({
            iconName: "search", title: e.status === 404 ? "Product not found" : "Couldn't load this product",
            text: e.status === 404 ? "It may have been removed." : e.message,
            action: '<a class="btn" href="products.html">Browse products</a>'
        });
    });
})();
