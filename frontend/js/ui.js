/* =====================================================
   CARTIVA - UI HELPERS
   escaping, formatting, icons, toasts, modals, product card
===================================================== */
(function () {
    // ---- text / formatting ----
    const esc = (v) => String(v == null ? "" : v)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

    const inr0 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    // Whole rupees show without decimals; anything else shows paise (₹224.10)
    const money = (n) => { const v = Number(n) || 0; return (Number.isInteger(v) ? inr0 : inr2).format(v); };
    const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const formatDateTime = (d) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const debounce = (fn, ms = 300) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
    const qs = (name) => new URLSearchParams(location.search).get(name);
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // ---- icons (inline SVG sprite, Lucide-style paths) ----
    const ICONS = {
        cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/>',
        user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
        menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
        x: '<path d="M18 6 6 18M6 6l12 12"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        minus: '<path d="M5 12h14"/>',
        check: '<path d="M20 6 9 17l-5-5"/>',
        "check-circle": '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
        alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
        trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
        edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
        eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
        "eye-off": '<path d="M3 3l18 18M10.6 6.1A10.6 10.6 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 6.6A16.7 16.7 0 0 0 2 12s3.6 6 10 6a10 10 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
        package: '<path d="m7.5 4.3 9 5.2M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
        truck: '<path d="M1 3h13v13H1zM14 8h4l4 4v4h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
        refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
        headset: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/>',
        tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
        home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
        grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        users: '<circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0 1 16 0M17 4a4 4 0 0 1 0 8M23 21a8 8 0 0 0-5-7.4"/>',
        box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
        chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
        rupee: '<path d="M6 4h12M6 9h12M6 4c6 0 8 2 8 5s-3 5-8 5l8 6"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
        filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
        arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
        star: '<path d="m12 2 3 6.5 7 .9-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.9z"/>',
        lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
        bag: '<path d="M5 8h14l1 13H4z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'
    };
    const icon = (name, cls = "") =>
        `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ""}</svg>`;

    // ---- toast ----
    function toast(message, type = "info") {
        let host = document.getElementById("toast-host");
        if (!host) {
            host = document.createElement("div");
            host.id = "toast-host";
            host.setAttribute("role", "status");
            host.setAttribute("aria-live", "polite");
            document.body.appendChild(host);
        }
        const el = document.createElement("div");
        el.className = "toast toast-" + type;
        el.innerHTML = (type === "success" ? icon("check-circle") : type === "error" ? icon("alert") : "") + `<span>${esc(message)}</span>`;
        host.appendChild(el);
        setTimeout(() => el.remove(), 3800);
    }

    // ---- modal ----
    function openModal({ title, body, footer = "", wide = false, onOpen }) {
        return new Promise((resolve) => {
            const previous = document.activeElement;
            const backdrop = document.createElement("div");
            backdrop.className = "modal-backdrop";
            backdrop.innerHTML = `
                <div class="modal ${wide ? "modal-wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
                    <div class="modal-head"><h2>${esc(title)}</h2>
                        <button class="btn btn-icon" data-close aria-label="Close">${icon("x")}</button></div>
                    <div class="modal-body">${body}</div>
                    ${footer ? `<div class="modal-foot">${footer}</div>` : ""}
                </div>`;
            document.body.appendChild(backdrop);
            document.body.style.overflow = "hidden";

            const close = (result) => {
                backdrop.remove();
                document.body.style.overflow = "";
                document.removeEventListener("keydown", onKey);
                if (previous && previous.focus) previous.focus();
                resolve(result);
            };
            const onKey = (e) => { if (e.key === "Escape") close(undefined); };
            document.addEventListener("keydown", onKey);
            backdrop.addEventListener("click", (e) => { if (e.target === backdrop || e.target.closest("[data-close]")) close(undefined); });

            const first = backdrop.querySelector("input, select, textarea, button:not([data-close])") || backdrop.querySelector("button");
            if (first) first.focus();
            if (onOpen) onOpen(backdrop, close);
        });
    }

    function confirmDialog(message, { title = "Are you sure?", confirmText = "Confirm", danger = false } = {}) {
        return openModal({
            title,
            body: `<p class="muted">${esc(message)}</p>`,
            footer: `<button class="btn btn-ghost" data-close>Cancel</button>
                     <button class="btn ${danger ? "btn-danger" : ""}" data-ok>${esc(confirmText)}</button>`,
            onOpen: (root, close) => root.querySelector("[data-ok]").addEventListener("click", () => close(true))
        }).then((r) => r === true);
    }

    // ---- building blocks ----
    const skeletonCards = (n = 8) => Array.from({ length: n }, () => '<div class="skeleton skel-card"></div>').join("");
    const emptyState = ({ iconName = "package", title, text = "", action = "" }) =>
        `<div class="empty">${icon(iconName)}<h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`;

    const STATUS_TONE = { "Order Placed": "info", Processing: "warning", Shipped: "info", Delivered: "success", Cancelled: "danger" };
    const statusBadge = (s) => `<span class="badge badge-${STATUS_TONE[s] || ""}">${esc(s)}</span>`;

    const img = (src, alt = "") =>
        `<img src="${esc(src || "image/product-placeholder.svg")}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src='image/product-placeholder.svg'">`;

    function stockNote(stock) {
        if (stock <= 0) return '<span class="stock-note stock-out">Out of stock</span>';
        if (stock <= window.CARTIVA.LOW_STOCK) return `<span class="stock-note stock-low">Only ${stock} left</span>`;
        return '<span class="stock-note stock-ok">In stock</span>';
    }

    function priceBlock(p) {
        const off = Number(p.discount) > 0;
        return `<div class="price-row"><span class="price">${money(p.final_price)}</span>` +
            (off ? `<span class="price-old">${money(p.price)}</span><span class="price-off">${Math.round(p.discount)}% off</span>` : "") + "</div>";
    }

    function productCard(p) {
        const out = p.stock <= 0;
        return `<article class="card product-card">
            <a class="product-media" href="product-details.html?id=${p.id}" aria-label="${esc(p.name)}">
                ${img(p.image, p.name)}
                ${Number(p.discount) > 0 ? `<span class="badge badge-danger product-flag">-${Math.round(p.discount)}%</span>` : ""}
            </a>
            <div class="product-body">
                <span class="product-cat">${esc(p.category_name || "General")}</span>
                <a class="product-name" href="product-details.html?id=${p.id}">${esc(p.name)}</a>
                ${stockNote(p.stock)}
                ${priceBlock(p)}
                <button class="btn btn-sm ${out ? "btn-ghost" : ""}" data-add="${p.id}" ${out ? "disabled" : ""}>
                    ${icon("cart", "icon-sm")} ${out ? "Sold out" : "Add to cart"}</button>
            </div></article>`;
    }

    // Shared "add to cart" used by every product grid (event delegation)
    async function addToCart(productId, quantity = 1, button) {
        if (!Session.user()) {
            const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
            toast("Please log in to add items to your cart", "info");
            setTimeout(() => (location.href = "login.html?next=" + next), 700);
            return false;
        }
        const original = button && button.innerHTML;
        if (button) { button.disabled = true; button.innerHTML = '<span class="spinner"></span> Adding'; }
        try {
            const data = await api.post("/cart/items", { productId, quantity });
            Session.setCartCount(data.summary.items);
            toast("Added to your cart", "success");
            return true;
        } catch (e) {
            toast(e.message, "error");
            return false;
        } finally {
            if (button) { button.disabled = false; button.innerHTML = original; }
        }
    }

    function bindAddToCart(root) {
        root.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-add]");
            if (btn) addToCart(Number(btn.dataset.add), 1, btn);
        });
    }

    function renderPagination(container, { page, pages }, onPage) {
        if (pages <= 1) { container.innerHTML = ""; return; }
        const nums = [];
        for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
        let html = `<button data-p="${page - 1}" ${page === 1 ? "disabled" : ""} aria-label="Previous page">‹</button>`;
        let last = 0;
        nums.forEach((n) => {
            if (n - last > 1) html += '<button disabled aria-hidden="true">…</button>';
            html += `<button data-p="${n}" ${n === page ? 'aria-current="page"' : ""}>${n}</button>`;
            last = n;
        });
        html += `<button data-p="${page + 1}" ${page === pages ? "disabled" : ""} aria-label="Next page">›</button>`;
        container.innerHTML = html;
        container.onclick = (e) => { const b = e.target.closest("[data-p]"); if (b && !b.disabled) onPage(Number(b.dataset.p)); };
    }

    // Field-level validation helper: shows message under the field
    function setFieldError(input, message) {
        const field = input.closest(".field");
        if (!field) return;
        field.classList.toggle("invalid", !!message);
        let el = field.querySelector(".error");
        if (!el) { el = document.createElement("div"); el.className = "error"; el.setAttribute("role", "alert"); field.appendChild(el); }
        el.textContent = message || "";
        input.setAttribute("aria-invalid", message ? "true" : "false");
    }

    window.UI = {
        esc, money, formatDate, formatDateTime, debounce, qs, $, $$, icon, toast, openModal, confirmDialog,
        skeletonCards, emptyState, statusBadge, img, stockNote, priceBlock, productCard,
        addToCart, bindAddToCart, renderPagination, setFieldError
    };
    window.cartivaToast = toast;
})();
