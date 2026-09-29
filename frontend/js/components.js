/* =====================================================
   CARTIVA - SHARED PAGE SHELL
   Storefront: header + footer.  Admin: sidebar + topbar.
   Pages provide <div id="site-header"> / <div id="site-footer">
   (storefront) or <div id="admin-root"> (admin).
===================================================== */
(function () {
    const { esc, icon, $, $$ } = UI;

    function logoutUser() {
        Session.clearUser();
        location.href = "index.html";
    }
    window.logout = logoutUser;

    // ---------- Storefront ----------
    const NAV = [
        { key: "home", href: "index.html", label: "Home" },
        { key: "products", href: "products.html", label: "Shop" },
        { key: "orders", href: "orders.html", label: "My orders" }
    ];

    function renderHeader() {
        const host = document.getElementById("site-header");
        if (!host) return;
        const page = document.body.dataset.page;
        const user = Session.user();
        const count = Session.cartCount();

        host.innerHTML = `
        <a class="skip-link" href="#main">Skip to content</a>
        <div class="topbar">Free delivery on orders above ₹999 · Easy 7-day returns</div>
        <header class="site-header">
            <div class="container">
                <a class="brand" href="index.html" aria-label="Cartiva home">
                    <span class="brand-mark">${icon("bag")}</span>Cartiva</a>
                <nav class="main-nav" id="main-nav" aria-label="Main">
                    ${NAV.map((n) => `<a href="${n.href}" ${n.key === page ? 'aria-current="page"' : ""}>${n.label}</a>`).join("")}
                </nav>
                <form class="header-search" role="search" id="header-search">
                    ${icon("search")}
                    <label class="sr-only" for="header-q">Search products</label>
                    <input class="input" id="header-q" type="search" placeholder="Search products" autocomplete="off">
                </form>
                <div class="header-actions">
                    <a class="btn btn-icon cart-link" href="cart.html" aria-label="Cart">
                        ${icon("cart")}<span class="cart-badge" id="cart-badge" ${count ? "" : "hidden"}>${count}</span></a>
                    ${user ? `
                    <div class="user-menu">
                        <button class="btn btn-icon" id="user-btn" aria-haspopup="true" aria-expanded="false" aria-label="Account menu">${icon("user")}</button>
                        <div class="user-menu-panel" id="user-panel" hidden>
                            <div class="who"><strong>${esc(user.name)}</strong><span>${esc(user.email)}</span></div>
                            <a href="profile.html">${icon("user", "icon-sm")} My profile</a>
                            <a href="orders.html">${icon("package", "icon-sm")} My orders</a>
                            <button id="logout-btn">${icon("logout", "icon-sm")} Log out</button>
                        </div>
                    </div>` : `
                    <a class="btn btn-ghost btn-sm" href="login.html">Log in</a>
                    <a class="btn btn-sm" href="register.html">Sign up</a>`}
                    <button class="btn btn-icon menu-toggle" id="menu-toggle" aria-label="Menu" aria-expanded="false">${icon("menu")}</button>
                </div>
            </div>
        </header>`;

        const q = UI.qs("search");
        if (q) $("#header-q").value = q;
        $("#header-search").addEventListener("submit", (e) => {
            e.preventDefault();
            const v = $("#header-q").value.trim();
            location.href = "products.html" + (v ? "?search=" + encodeURIComponent(v) : "");
        });

        const toggle = $("#menu-toggle");
        toggle.addEventListener("click", () => {
            const open = $("#main-nav").classList.toggle("open");
            toggle.setAttribute("aria-expanded", open);
        });

        if (user) {
            const btn = $("#user-btn"), panel = $("#user-panel");
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                panel.hidden = !panel.hidden;
                btn.setAttribute("aria-expanded", String(!panel.hidden));
            });
            document.addEventListener("click", (e) => { if (!panel.contains(e.target)) panel.hidden = true; });
            document.addEventListener("keydown", (e) => { if (e.key === "Escape") panel.hidden = true; });
            $("#logout-btn").addEventListener("click", logoutUser);
            // refresh the cart badge from the server
            api.get("/cart").then((d) => Session.setCartCount(d.summary.items)).catch(() => {});
        }

        document.addEventListener("cart:count", (e) => {
            const badge = $("#cart-badge");
            if (!badge) return;
            badge.textContent = e.detail;
            badge.hidden = !e.detail;
        });
    }

    function renderFooter() {
        const host = document.getElementById("site-footer");
        if (!host) return;
        host.innerHTML = `
        <footer class="site-footer">
            <div class="container">
                <div class="footer-grid">
                    <div>
                        <div class="brand"><span class="brand-mark">${icon("bag")}</span>Cartiva</div>
                        <p>Quality products, honest prices and fast delivery. Everything you need, in one place.</p>
                    </div>
                    <div><h4>Shop</h4>
                        <a href="products.html">All products</a>
                        <a href="products.html?sort=discount">Best deals</a>
                        <a href="products.html?sort=newest">New arrivals</a></div>
                    <div><h4>Account</h4>
                        <a href="profile.html">My profile</a>
                        <a href="orders.html">My orders</a>
                        <a href="cart.html">Cart</a></div>
                    <div><h4>Company</h4>
                        <a href="admin-login.html">Admin portal</a>
                        <a href="index.html">About Cartiva</a>
                        <a href="credits.html">Photo credits</a></div>
                </div>
                <div class="footer-bottom">
                    <span>© ${new Date().getFullYear()} Cartiva. All rights reserved.</span>
                    <span>Secure checkout · Cash on delivery available</span>
                </div>
            </div>
        </footer>`;
    }

    // ---------- Admin shell ----------
    const ADMIN_NAV = [
        { key: "dashboard", href: "admin-dashboard.html", label: "Dashboard", icon: "chart" },
        { key: "products", href: "admin-products.html", label: "Products", icon: "package" },
        { key: "orders", href: "admin-orders.html", label: "Orders", icon: "bag" },
        { key: "inventory", href: "admin-inventory.html", label: "Inventory", icon: "box" },
        { key: "users", href: "admin-users.html", label: "Customers", icon: "users" }
    ];

    // Returns the <div id="admin-content"> to render into, or null (redirected)
    function adminShell(activeKey, title, actionsHtml = "") {
        const admin = Session.admin();
        if (!admin) { location.replace("admin-login.html"); return null; }

        const root = document.getElementById("admin-root");
        root.className = "admin-shell";
        root.innerHTML = `
        <aside class="admin-side" id="admin-side" aria-label="Admin navigation">
            <a class="brand" href="admin-dashboard.html"><span class="brand-mark">${icon("bag")}</span>Cartiva</a>
            <span class="label">Manage</span>
            ${ADMIN_NAV.map((n) => `<a href="${n.href}" ${n.key === activeKey ? 'aria-current="page"' : ""}>${icon(n.icon)}${n.label}</a>`).join("")}
            <span class="label">Store</span>
            <a href="index.html" target="_blank" rel="noopener">${icon("home")}View storefront</a>
            <span class="spacer"></span>
            <button class="navlike" id="admin-logout">${icon("logout")}Log out</button>
        </aside>
        <div class="admin-main">
            <header class="admin-top">
                <div class="row">
                    <button class="btn btn-icon admin-menu-btn" id="admin-menu" aria-label="Open menu">${icon("menu")}</button>
                    <h1>${esc(title)}</h1>
                </div>
                <div class="row">
                    ${actionsHtml}
                    <div class="who"><span class="avatar" aria-hidden="true">${esc(admin.name.charAt(0).toUpperCase())}</span><span>${esc(admin.name)}</span></div>
                </div>
            </header>
            <main class="admin-content" id="admin-content"></main>
        </div>`;

        $("#admin-menu").addEventListener("click", () => $("#admin-side").classList.toggle("open"));
        $("#admin-logout").addEventListener("click", () => { Session.clearAdmin(); location.href = "admin-login.html"; });
        return document.getElementById("admin-content");
    }

    window.Shell = { renderHeader, renderFooter, adminShell };

    document.addEventListener("DOMContentLoaded", () => {
        renderHeader();
        renderFooter();
    });
})();
