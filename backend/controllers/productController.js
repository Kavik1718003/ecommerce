const db = require("../config/db").promise();
const { HttpError, str, int, num } = require("../middleware/validate");

const SORTS = {
    newest: "p.id DESC",
    "price-asc": "(p.price * (1 - p.discount / 100)) ASC",
    "price-desc": "(p.price * (1 - p.discount / 100)) DESC",
    discount: "p.discount DESC",
    name: "p.name ASC"
};

const COLUMNS = `p.id, p.name, p.category_id, c.name AS category_name, p.description,
    p.price, p.discount, ROUND(p.price * (1 - p.discount / 100), 2) AS final_price,
    p.stock, p.image, p.created_at`;

// GET /api/products?search=&category=&min=&max=&inStock=&sort=&page=&limit=
const getAllProducts = async (req, res) => {
    const search = str(req.query.search, 100);
    const category = int(req.query.category, { min: 0, fallback: 0 });
    const min = num(req.query.min);
    const max = num(req.query.max);
    const page = int(req.query.page, { min: 1, fallback: 1 });
    const limit = int(req.query.limit, { min: 1, max: 60, fallback: 12 });
    const order = SORTS[req.query.sort] || SORTS.newest;

    const where = [];
    const params = [];

    if (search) {
        where.push("(p.name LIKE ? OR p.description LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
    }
    if (category) { where.push("p.category_id = ?"); params.push(category); }
    if (min !== null) { where.push("(p.price * (1 - p.discount / 100)) >= ?"); params.push(min); }
    if (max !== null) { where.push("(p.price * (1 - p.discount / 100)) <= ?"); params.push(max); }
    if (req.query.inStock === "1") where.push("p.stock > 0");

    const clause = where.length ? "WHERE " + where.join(" AND ") : "";
    const base = `FROM products p LEFT JOIN categories c ON c.id = p.category_id ${clause}`;

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total ${base}`, params);
    const [products] = await db.query(
        `SELECT ${COLUMNS} ${base} ORDER BY ${order} LIMIT ? OFFSET ?`,
        [...params, limit, (page - 1) * limit]
    );

    res.json({
        message: "Products fetched successfully",
        products,
        total,
        page,
        pages: Math.max(1, Math.ceil(total / limit))
    });
};

// GET /api/products/:id  (+ related products from the same category)
const getProductById = async (req, res) => {
    const id = int(req.params.id, { min: 0 });

    const [rows] = await db.query(
        `SELECT ${COLUMNS} FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
        [id]
    );
    if (!rows.length) throw new HttpError(404, "Product not found");

    const [related] = await db.query(
        `SELECT ${COLUMNS} FROM products p LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.category_id <=> ? AND p.id <> ? ORDER BY p.id DESC LIMIT 4`,
        [rows[0].category_id, id]
    );

    res.json({ message: "Product fetched successfully", product: rows[0], related });
};

// Shared validation for create / update
const readProduct = (body) => {
    const name = str(body.name, 200);
    const description = str(body.description, 2000);
    const image = str(body.image, 255);
    const category_id = int(body.category_id, { min: 0, fallback: 0 });
    const price = num(body.price);
    const discount = num(body.discount, 0);
    const stock = num(body.stock, 0);

    if (name.length < 2) throw new HttpError(400, "Product name is required");
    if (price === null || price <= 0) throw new HttpError(400, "Price must be greater than 0");
    if (discount < 0 || discount > 90) throw new HttpError(400, "Discount must be between 0 and 90");
    if (!Number.isInteger(stock) || stock < 0) throw new HttpError(400, "Stock must be a whole number, 0 or more");

    return { name, description, image: image || "image/product-placeholder.svg",
        category_id: category_id || null, price, discount, stock };
};

// POST /api/products  (admin)
const addProduct = async (req, res) => {
    const p = readProduct(req.body);

    const [result] = await db.query(
        `INSERT INTO products (name, category_id, description, price, discount, stock, image)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.category_id, p.description, p.price, p.discount, p.stock, p.image]
    );

    res.status(201).json({ message: "Product added successfully", productId: result.insertId });
};

// PUT /api/products/:id  (admin)
const updateProduct = async (req, res) => {
    const p = readProduct(req.body);

    const [result] = await db.query(
        `UPDATE products SET name = ?, category_id = ?, description = ?, price = ?,
         discount = ?, stock = ?, image = ? WHERE id = ?`,
        [p.name, p.category_id, p.description, p.price, p.discount, p.stock, p.image, req.params.id]
    );
    if (!result.affectedRows) throw new HttpError(404, "Product not found");

    res.json({ message: "Product updated successfully" });
};

// DELETE /api/products/:id  (admin)
const deleteProduct = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
        if (!result.affectedRows) throw new HttpError(404, "Product not found");
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            throw new HttpError(409, "This product is part of existing orders and cannot be deleted. Set its stock to 0 instead.");
        }
        throw err;
    }
};

module.exports = { getAllProducts, getProductById, addProduct, updateProduct, deleteProduct };
