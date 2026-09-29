/* =====================================================
   CARTIVA - API CLIENT + SESSION
   window.Session : who is logged in (shopper + admin)
   window.api     : api.get/post/put/del(path, body) -> data
                    throws ApiError(message, status) on failure
===================================================== */
(function () {
    const KEYS = {
        user: "cartivaUser", token: "cartivaToken",
        admin: "cartivaAdmin", adminToken: "cartivaAdminToken",
        cartCount: "cartivaCartCount"
    };

    const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };
    const drop = (k) => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };
    const json = (k) => { try { return JSON.parse(read(k)); } catch (e) { return null; } };

    window.Session = {
        user: () => (read(KEYS.token) ? json(KEYS.user) : null),
        setUser(user, token) {
            write(KEYS.user, JSON.stringify(user));
            if (token) write(KEYS.token, token);
        },
        clearUser() { drop(KEYS.user); drop(KEYS.token); drop(KEYS.cartCount); },
        admin: () => (read(KEYS.adminToken) ? json(KEYS.admin) : null),
        setAdmin(admin, token) {
            write(KEYS.admin, JSON.stringify(admin));
            if (token) write(KEYS.adminToken, token);
        },
        clearAdmin() { drop(KEYS.admin); drop(KEYS.adminToken); },
        cartCount: () => Number(read(KEYS.cartCount)) || 0,
        setCartCount(n) { write(KEYS.cartCount, String(n)); document.dispatchEvent(new CustomEvent("cart:count", { detail: n })); },
        clearAll() { this.clearUser(); this.clearAdmin(); }
    };

    class ApiError extends Error {
        constructor(message, status) { super(message); this.status = status; }
    }
    window.ApiError = ApiError;

    const usesAdminToken = (path, method) =>
        path.startsWith("/admin") ||
        (method !== "GET" && (path.startsWith("/products") || path.startsWith("/categories")));

    async function request(method, path, body) {
        const admin = usesAdminToken(path, method);
        const token = read(admin ? KEYS.adminToken : KEYS.token);
        const headers = {};
        if (body !== undefined) headers["Content-Type"] = "application/json";
        if (token) headers.Authorization = "Bearer " + token;

        let response;
        try {
            response = await fetch(window.CARTIVA.API_BASE + path, {
                method, headers, body: body === undefined ? undefined : JSON.stringify(body)
            });
        } catch (e) {
            throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
        }

        let data = {};
        try { data = await response.json(); } catch (e) { /* empty body */ }

        if (!response.ok) {
            const isLogin = /^\/(auth|admin)\/login$/.test(path);
            if (response.status === 401 && !isLogin) {
                // Session expired: clear it and go to the right login page
                const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
                if (admin) { Session.clearAdmin(); location.href = "admin-login.html"; }
                else { Session.clearUser(); location.href = "login.html?next=" + next; }
            }
            throw new ApiError(data.message || "Something went wrong. Please try again.", response.status);
        }
        return data;
    }

    window.api = {
        get: (p) => request("GET", p),
        post: (p, b) => request("POST", p, b || {}),
        put: (p, b) => request("PUT", p, b || {}),
        del: (p) => request("DELETE", p)
    };
})();
