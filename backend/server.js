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


const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());


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
// START SERVER
// ===============================

const PORT = 5000;

app.listen(
    PORT,
    () => {

        console.log(
            `🚀 Cartiva Backend running on http://localhost:${PORT}`
        );

    }
);