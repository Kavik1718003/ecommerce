require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const authRoutes =
    require("./routes/authRoutes");

const productRoutes =
    require("./routes/productRoutes");

const cartRoutes =
    require("./routes/cartRoutes");

const orderRoutes =
    require("./routes/orderRoutes");

const adminRoutes =
    require("./routes/adminRoutes");

const categoryRoutes =
    require("./routes/categoryRoutes");


const app = express();


// ===============================
// MIDDLEWARE
// ===============================

const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.disable("x-powered-by");

app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : true
}));

// Basic security headers
app.use((req, res, next) => {
    res.set({
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer"
    });
    next();
});

app.use(express.json({ limit: "100kb" }));

// Simple in-memory rate limit for login/register (per IP)
const attempts = new Map();
const authLimiter = (req, res, next) => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const max = 30;
    const hits = (attempts.get(req.ip) || []).filter((t) => now - t < windowMs);

    if (hits.length >= max) {
        return res.status(429).json({
            message: "Too many attempts. Please try again later."
        });
    }

    hits.push(now);
    attempts.set(req.ip, hits);
    next();
};

app.use(["/api/auth/login", "/api/auth/register", "/api/admin/login"], authLimiter);


// ===============================
// API ROUTES
// ===============================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/products",
    productRoutes
);

app.use(
    "/api/categories",
    categoryRoutes
);

app.use(
    "/api/cart",
    cartRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);


// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {

    res.send(
        "Cartiva Backend is Running!"
    );

});


// ===============================
// 404 + ERROR HANDLING
// ===============================

app.use("/api", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid JSON body" });
    }

    if (err.status && err.status < 500) {
        return res.status(err.status).json({ message: err.message });
    }

    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
});


// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5050;

app.listen(
    PORT,
    () => {

        console.log(
            `🚀 Cartiva Backend running on http://localhost:${PORT}`
        );

    }
);