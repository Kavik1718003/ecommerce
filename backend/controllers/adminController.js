const db = require("../config/db");
const bcrypt = require("bcryptjs");


// =====================================================
// ADMIN LOGIN
// =====================================================

const adminLogin = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            password,
            role
        FROM users
        WHERE email = ?
        AND role = 'admin'
    `;

    db.query(sql, [email], async (err, results) => {

        if (err) {
            console.error("Admin login database error:", err);

            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        console.log("Admin search result:", results.length);

        if (results.length === 0) {
            return res.status(401).json({
                message: "Admin account not found"
            });
        }

        const admin = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        console.log(
            "Admin password match:",
            passwordMatch
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid admin password"
            });
        }

        res.status(200).json({
            message: "Admin login successful",
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role
            }
        });

    });

};


// =====================================================
// GET INVENTORY
// =====================================================

const getInventory = (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            category_id,
            price,
            stock,
            image
        FROM products
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Inventory database error:", err);

            return res.status(500).json({
                message: "Failed to fetch inventory",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Inventory fetched successfully",
            inventory: results
        });

    });

};


// =====================================================
// UPDATE INVENTORY
// =====================================================

const updateInventory = (req, res) => {

    const productId = req.params.id;
    const { stock } = req.body;

    if (stock === undefined) {
        return res.status(400).json({
            message: "Stock value is required"
        });
    }

    if (Number(stock) < 0) {
        return res.status(400).json({
            message: "Stock cannot be negative"
        });
    }

    const sql = `
        UPDATE products
        SET stock = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [Number(stock), productId],
        (err, result) => {

            if (err) {
                console.error("Inventory update error:", err);

                return res.status(500).json({
                    message: "Failed to update inventory",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            res.status(200).json({
                message: "Stock updated successfully"
            });

        }
    );

};


// =====================================================
// GET ALL ORDERS
// =====================================================

const getAllOrders = (req, res) => {

    const sql = `
        SELECT
            orders.id,
            orders.user_id,
            users.name AS customer_name,
            users.email AS customer_email,
            orders.total_amount,
            orders.address,
            orders.city,
            orders.state,
            orders.pincode,
            orders.status,
            orders.payment_method,
            orders.created_at
        FROM orders
        JOIN users
            ON orders.user_id = users.id
        ORDER BY orders.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Orders database error:", err);

            return res.status(500).json({
                message: "Failed to fetch orders",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Orders fetched successfully",
            orders: results
        });

    });

};


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

const updateOrderStatus = (req, res) => {

    const orderId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
        "Order Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    if (!status) {
        return res.status(400).json({
            message: "Order status is required"
        });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid order status"
        });
    }

    const sql = `
        UPDATE orders
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [status, orderId],
        (err, result) => {

            if (err) {
                console.error(
                    "Order status update error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to update order status",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            res.status(200).json({
                message: "Order status updated successfully"
            });

        }
    );

};


// =====================================================
// GET ALL CUSTOMERS
// =====================================================

const getAllUsers = (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            role,
            created_at
        FROM users
        WHERE role = 'customer'
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Users database error:", err);

            return res.status(500).json({
                message: "Failed to fetch customers",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Customers fetched successfully",
            customers: results
        });

    });

};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    adminLogin,
    getInventory,
    updateInventory,
    getAllOrders,
    updateOrderStatus,
    getAllUsers
};