(function () {
    const { esc, icon, $, img } = UI;

    $("#benefits").innerHTML = [
        ["truck", "Free delivery", "On orders above ₹999"],
        ["refresh", "Easy returns", "7-day hassle-free returns"],
        ["shield", "Secure checkout", "Your data stays protected"],
        ["headset", "24/7 support", "We're here whenever you need"]
    ].map(([i, t, s]) => `<div class="card benefit"><span class="ico">${icon(i)}</span><div><strong>${t}</strong><span>${s}</span></div></div>`).join("");

    const featured = $("#featured");
    featured.innerHTML = UI.skeletonCards(4);
    UI.bindAddToCart(featured);

    api.get("/categories").then((d) => {
        $("#categories").innerHTML = d.categories.map((c) => `
            <a class="category-tile" href="products.html?category=${c.id}">
                ${img(c.image, c.name)}<strong>${esc(c.name)}</strong><span>${c.product_count} products</span></a>`).join("");
    }).catch(() => { $("#categories").innerHTML = ""; });

    api.get("/products?sort=discount&limit=8").then((d) => {
        featured.innerHTML = d.products.length
            ? d.products.map(UI.productCard).join("")
            : UI.emptyState({ title: "No products yet", text: "Check back soon." });
    }).catch((e) => {
        featured.innerHTML = UI.emptyState({ iconName: "alert", title: "Couldn't load products", text: e.message });
    });
})();
