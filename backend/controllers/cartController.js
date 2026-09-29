const db = require("../config/db").promise();
const { HttpError, int, shippingFor } = require("../middleware/validate");

const money = (n) => Math.round(n * 100) / 100;

const CART_SQL = `
    SELECT ci.id AS cart_item_id, p.id AS product_id, p.name, p.image, p.price, p.discount,
           ROUND(p.price * (1 - p.discount / 100), 2) AS final_price, p.stock, ci.quantity
    FROM cart c
    JOIN cart_items ci ON ci.cart_id = c.id
    JOIN products p ON p.id = ci.product_id
    WHERE c.user_id = ?
    ORDER BY ci.id DESC`;

// Build the cart payload (lines + totals) for a user
const loadCart = async (userId) => {
    const [rows] = await db.query(CART_SQL, [userId]);

    const items = rows.map((r) => ({
        ...r,
        price: Number(r.price),
        discount: Number(r.discount),
        final_price: Number(r.final_price),
        line_total: money(Number(r.final_price) * r.quantity)
    }));

    const subtotal = money(items.reduce((s, i) => s + i.price * i.quantity, 0));
    const total = money(items.reduce((s, i) => s + i.line_total, 0));

    const shipping = shippingFor(total);

    return {
        cart: items,
        summary: {
            items: items.reduce((s, i) => s + i.quantity, 0),
            subtotal,
            savings: money(subtotal - total),
            total,
            shipping,
            grandTotal: money(total + shipping)
        }
    };
};

// GET /api/cart
const getCart = async (req, res) => {
    res.json({ message: "Cart fetched successfully", ...(await loadCart(req.user.id)) });
};

// POST /api/cart/items  { productId, quantity }
const addToCart = async (req, res) => {
    const productId = int(req.body.productId, { min: 0 });
    const quantity = int(req.body.quantity, { min: 1, max: 99, fallback: 1 });

    const [products] = await db.query("SELECT id, stock FROM products WHERE id = ?", [productId]);
    if (!products.length) throw new HttpError(404, "Product not found");

    let [carts] = await db.query("SELECT id FROM cart WHERE user_id = ?", [req.user.id]);
    let cartId = carts[0] && carts[0].id;
    if (!cartId) {
        const [r] = await db.query("INSERT INTO cart (user_id) VALUES (?)", [req.user.id]);
        cartId = r.insertId;
    }

    const [existing] = await db.query(
        "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId]);
    const newQty = (existing[0] ? existing[0].quantity : 0) + quantity;

    if (newQty > products[0].stock) {
        throw new HttpError(409, products[0].stock === 0
            ? "This product is out of stock"
            : `Only ${products[0].stock} left in stock`);
    }

    if (existing[0]) {
        await db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [newQty, existing[0].id]);
    } else {
        await db.query("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)", [cartId, productId, quantity]);
    }

    res.status(201).json({ message: "Product added to cart", ...(await loadCart(req.user.id)) });
};

// PUT /api/cart/items/:id  { quantity }
const updateCartItem = async (req, res) => {
    const quantity = int(req.body.quantity, { min: 1, max: 99, fallback: 0 });
    if (!quantity) throw new HttpError(400, "Quantity must be at least 1");

    const [rows] = await db.query(
        `SELECT ci.id, p.stock FROM cart_items ci
         JOIN cart c ON c.id = ci.cart_id JOIN products p ON p.id = ci.product_id
         WHERE ci.id = ? AND c.user_id = ?`, [req.params.id, req.user.id]);
    if (!rows.length) throw new HttpError(404, "Cart item not found");
    if (quantity > rows[0].stock) throw new HttpError(409, `Only ${rows[0].stock} left in stock`);

    await db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, rows[0].id]);
    res.json({ message: "Cart updated", ...(await loadCart(req.user.id)) });
};

// DELETE /api/cart/items/:id
const removeCartItem = async (req, res) => {
    const [r] = await db.query(
        `DELETE ci FROM cart_items ci JOIN cart c ON c.id = ci.cart_id
         WHERE ci.id = ? AND c.user_id = ?`, [req.params.id, req.user.id]);
    if (!r.affectedRows) throw new HttpError(404, "Cart item not found");

    res.json({ message: "Item removed from cart", ...(await loadCart(req.user.id)) });
};

// DELETE /api/cart
const clearCart = async (req, res) => {
    await db.query(
        "DELETE ci FROM cart_items ci JOIN cart c ON c.id = ci.cart_id WHERE c.user_id = ?", [req.user.id]);
    res.json({ message: "Cart cleared", ...(await loadCart(req.user.id)) });
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
