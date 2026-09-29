const pool = require("../config/db");
const db = pool.promise();
const {
    HttpError, str, int, isPincode, PAYMENT_METHODS, shippingFor
} = require("../middleware/validate");

const money = (n) => Math.round(n * 100) / 100;

// Run fn(conn) inside a transaction on a dedicated pooled connection
const withTransaction = async (fn) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

// Put an order's items back into stock (used on cancellation)
const restockOrder = async (conn, orderId) => {
    await conn.query(
        `UPDATE products p JOIN order_items oi ON oi.product_id = p.id
         SET p.stock = p.stock + oi.quantity WHERE oi.order_id = ?`, [orderId]);
};

// POST /api/orders  { address, city, state, pincode, paymentMethod }
const createOrder = async (req, res) => {
    const address = str(req.body.address, 255);
    const city = str(req.body.city, 100);
    const state = str(req.body.state, 100);
    const pincode = str(req.body.pincode, 10);
    const paymentMethod = str(req.body.paymentMethod, 50);

    if (address.length < 5) throw new HttpError(400, "Please enter your full address");
    if (!city || !state) throw new HttpError(400, "City and state are required");
    if (!isPincode(pincode)) throw new HttpError(400, "Please enter a valid pincode");
    if (!PAYMENT_METHODS.includes(paymentMethod)) throw new HttpError(400, "Please choose a valid payment method");

    const result = await withTransaction(async (conn) => {
        // Lock the products in the cart so stock can't be oversold
        const [items] = await conn.query(
            `SELECT ci.product_id, ci.quantity, p.name, p.stock,
                    ROUND(p.price * (1 - p.discount / 100), 2) AS unit_price
             FROM cart c
             JOIN cart_items ci ON ci.cart_id = c.id
             JOIN products p ON p.id = ci.product_id
             WHERE c.user_id = ? FOR UPDATE`, [req.user.id]);

        if (!items.length) throw new HttpError(400, "Your cart is empty");

        for (const item of items) {
            if (item.quantity > item.stock) {
                throw new HttpError(409, item.stock === 0
                    ? `${item.name} is out of stock`
                    : `Only ${item.stock} of ${item.name} left in stock`);
            }
        }

        const itemsTotal = money(items.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0));
        const total = money(itemsTotal + shippingFor(itemsTotal));

        const [order] = await conn.query(
            `INSERT INTO orders (user_id, total_amount, address, city, state, pincode, payment_method, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Order Placed')`,
            [req.user.id, total, address, city, state, pincode, paymentMethod]);

        for (const item of items) {
            await conn.query(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
                [order.insertId, item.product_id, item.quantity, item.unit_price]);
            await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.product_id]);
        }

        await conn.query(
            "DELETE ci FROM cart_items ci JOIN cart c ON c.id = ci.cart_id WHERE c.user_id = ?", [req.user.id]);

        return { orderId: order.insertId, totalAmount: total };
    });

    res.status(201).json({ message: "Order placed successfully", ...result });
};

const ORDER_COLUMNS = `o.id, o.total_amount, o.address, o.city, o.state, o.pincode,
    o.payment_method, o.status, o.created_at, o.cancelled_at`;

const loadItems = async (orderIds) => {
    if (!orderIds.length) return {};
    const [rows] = await db.query(
        `SELECT oi.order_id, oi.product_id, p.name, p.image, oi.quantity, oi.price
         FROM order_items oi JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id IN (?)`, [orderIds]);

    return rows.reduce((acc, r) => {
        (acc[r.order_id] = acc[r.order_id] || []).push({ ...r, price: Number(r.price) });
        return acc;
    }, {});
};

// GET /api/orders   (the caller's orders, with line items)
const getMyOrders = async (req, res) => {
    const [orders] = await db.query(
        `SELECT ${ORDER_COLUMNS} FROM orders o WHERE o.user_id = ? ORDER BY o.id DESC`, [req.user.id]);
    const items = await loadItems(orders.map((o) => o.id));

    res.json({
        message: "Orders fetched successfully",
        orders: orders.map((o) => ({ ...o, items: items[o.id] || [] }))
    });
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
    const [rows] = await db.query(
        `SELECT ${ORDER_COLUMNS} FROM orders o WHERE o.id = ? AND o.user_id = ?`,
        [int(req.params.id), req.user.id]);
    if (!rows.length) throw new HttpError(404, "Order not found");

    const items = await loadItems([rows[0].id]);
    res.json({ order: { ...rows[0], items: items[rows[0].id] || [] } });
};

// PUT /api/orders/:id/cancel  (only before it ships)
const cancelOrder = async (req, res) => {
    await withTransaction(async (conn) => {
        const [rows] = await conn.query(
            "SELECT id, status FROM orders WHERE id = ? AND user_id = ? FOR UPDATE",
            [int(req.params.id), req.user.id]);
        if (!rows.length) throw new HttpError(404, "Order not found");

        if (!["Order Placed", "Processing"].includes(rows[0].status)) {
            throw new HttpError(409, `This order is ${rows[0].status.toLowerCase()} and can no longer be cancelled`);
        }

        await conn.query("UPDATE orders SET status = 'Cancelled', cancelled_at = NOW() WHERE id = ?", [rows[0].id]);
        await restockOrder(conn, rows[0].id);
    });

    res.json({ message: "Order cancelled" });
};

module.exports = { createOrder, getMyOrders, getOrder, cancelOrder, withTransaction, restockOrder, loadItems };
