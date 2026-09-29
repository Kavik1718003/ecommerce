const bcrypt = require("bcryptjs");
const db = require("../config/db").promise();
const { signToken } = require("../middleware/authMiddleware");
const { withTransaction, restockOrder, loadItems } = require("./orderController");
const { HttpError, str, int, ORDER_STATUSES } = require("../middleware/validate");

const LOW_STOCK = 10;

// Allowed status moves; Delivered and Cancelled are final
const TRANSITIONS = {
    "Order Placed": ["Processing", "Shipped", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Cancelled"],
    Delivered: [],
    Cancelled: []
};

// POST /api/admin/login
const adminLogin = async (req, res) => {
    const email = str(req.body.email, 150).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password) throw new HttpError(400, "Email and password are required");

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const admin = rows[0];

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        throw new HttpError(401, "Invalid email or password");
    }
    if (admin.role !== "admin") throw new HttpError(403, "This account is not an admin");

    res.json({
        message: "Admin login successful",
        token: signToken(admin),
        admin: { id: admin.id, name: admin.name, email: admin.email, phone: admin.phone, role: admin.role }
    });
};

// GET /api/admin/stats
const getStats = async (req, res) => {
    const [[totals]] = await db.query(
        `SELECT
            (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status <> 'Cancelled') AS revenue,
            (SELECT COUNT(*) FROM orders) AS orders,
            (SELECT COUNT(*) FROM orders WHERE status IN ('Order Placed', 'Processing')) AS pending_orders,
            (SELECT COUNT(*) FROM users WHERE role = 'user') AS customers,
            (SELECT COUNT(*) FROM products) AS products,
            (SELECT COUNT(*) FROM products WHERE stock <= ?) AS low_stock`, [LOW_STOCK]);

    const [byStatus] = await db.query("SELECT status, COUNT(*) AS count FROM orders GROUP BY status");

    const [recentOrders] = await db.query(
        `SELECT o.id, u.name AS customer_name, o.total_amount, o.status, o.created_at
         FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC LIMIT 5`);

    const [lowStock] = await db.query(
        "SELECT id, name, stock, image FROM products WHERE stock <= ? ORDER BY stock ASC, id LIMIT 6", [LOW_STOCK]);

    res.json({
        stats: {
            revenue: Number(totals.revenue),
            orders: totals.orders,
            pendingOrders: totals.pending_orders,
            customers: totals.customers,
            products: totals.products,
            lowStock: totals.low_stock,
            lowStockThreshold: LOW_STOCK
        },
        ordersByStatus: byStatus,
        recentOrders,
        lowStock
    });
};

// GET /api/admin/inventory?search=&low=1
const getInventory = async (req, res) => {
    const search = str(req.query.search, 100);
    const where = [];
    const params = [];
    if (search) { where.push("p.name LIKE ?"); params.push(`%${search}%`); }
    if (req.query.low === "1") { where.push("p.stock <= ?"); params.push(LOW_STOCK); }

    const [inventory] = await db.query(
        `SELECT p.id, p.name, p.category_id, c.name AS category_name, p.price, p.discount, p.stock, p.image
         FROM products p LEFT JOIN categories c ON c.id = p.category_id
         ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY p.stock ASC, p.id`, params);

    res.json({ message: "Inventory fetched successfully", inventory, lowStockThreshold: LOW_STOCK });
};

// PUT /api/admin/inventory/:id  { stock }
const updateInventory = async (req, res) => {
    const stock = Number(req.body.stock);
    if (!Number.isInteger(stock) || stock < 0) throw new HttpError(400, "Stock must be a whole number, 0 or more");

    const [r] = await db.query("UPDATE products SET stock = ? WHERE id = ?", [stock, req.params.id]);
    if (!r.affectedRows) throw new HttpError(404, "Product not found");

    res.json({ message: "Stock updated successfully" });
};

// GET /api/admin/orders?status=&search=&page=&limit=
const getAllOrders = async (req, res) => {
    const status = str(req.query.status, 30);
    const search = str(req.query.search, 100);
    const page = int(req.query.page, { min: 1, fallback: 1 });
    const limit = int(req.query.limit, { min: 1, max: 100, fallback: 15 });

    const where = [];
    const params = [];
    if (ORDER_STATUSES.includes(status)) { where.push("o.status = ?"); params.push(status); }
    if (search) {
        where.push("(u.name LIKE ? OR u.email LIKE ? OR o.id = ?)");
        params.push(`%${search}%`, `%${search}%`, int(search, { min: 0, fallback: 0 }));
    }
    const clause = where.length ? "WHERE " + where.join(" AND ") : "";
    const base = `FROM orders o JOIN users u ON u.id = o.user_id ${clause}`;

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total ${base}`, params);
    const [orders] = await db.query(
        `SELECT o.id, o.user_id, u.name AS customer_name, u.email AS customer_email, o.total_amount,
                o.address, o.city, o.state, o.pincode, o.status, o.payment_method, o.created_at
         ${base} ORDER BY o.id DESC LIMIT ? OFFSET ?`, [...params, limit, (page - 1) * limit]);

    res.json({
        message: "Orders fetched successfully",
        orders, total, page, pages: Math.max(1, Math.ceil(total / limit)),
        nextStatuses: TRANSITIONS
    });
};

// GET /api/admin/orders/:id
const getOrderDetail = async (req, res) => {
    const [rows] = await db.query(
        `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
         FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?`, [req.params.id]);
    if (!rows.length) throw new HttpError(404, "Order not found");

    const items = await loadItems([rows[0].id]);
    res.json({ order: { ...rows[0], items: items[rows[0].id] || [] }, nextStatuses: TRANSITIONS[rows[0].status] || [] });
};

// PUT /api/admin/orders/:id/status  { status }
const updateOrderStatus = async (req, res) => {
    const status = str(req.body.status, 30);
    if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, "Invalid order status");

    await withTransaction(async (conn) => {
        const [rows] = await conn.query("SELECT id, status FROM orders WHERE id = ? FOR UPDATE", [req.params.id]);
        if (!rows.length) throw new HttpError(404, "Order not found");

        const current = rows[0].status;
        if (current === status) return;
        if (!(TRANSITIONS[current] || []).includes(status)) {
            throw new HttpError(409, `Cannot change an order from "${current}" to "${status}"`);
        }

        if (status === "Cancelled") {
            await conn.query("UPDATE orders SET status = ?, cancelled_at = NOW() WHERE id = ?", [status, rows[0].id]);
            await restockOrder(conn, rows[0].id);
        } else {
            await conn.query("UPDATE orders SET status = ? WHERE id = ?", [status, rows[0].id]);
        }
    });

    res.json({ message: "Order status updated successfully" });
};

// GET /api/admin/users?search=
const getAllUsers = async (req, res) => {
    const search = str(req.query.search, 100);
    const params = ["user"];
    let extra = "";
    if (search) { extra = " AND (u.name LIKE ? OR u.email LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }

    const [customers] = await db.query(
        `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
                COUNT(o.id) AS order_count,
                COALESCE(SUM(CASE WHEN o.status <> 'Cancelled' THEN o.total_amount END), 0) AS total_spent
         FROM users u LEFT JOIN orders o ON o.user_id = u.id
         WHERE u.role = ?${extra} GROUP BY u.id ORDER BY u.id DESC`, params);

    res.json({
        message: "Customers fetched successfully",
        customers: customers.map((c) => ({ ...c, total_spent: Number(c.total_spent) }))
    });
};

module.exports = {
    adminLogin, getStats, getInventory, updateInventory,
    getAllOrders, getOrderDetail, updateOrderStatus, getAllUsers
};
