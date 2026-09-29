const db = require("../config/db").promise();
const { HttpError, str } = require("../middleware/validate");

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// GET /api/categories
const getCategories = async (req, res) => {
    const [categories] = await db.query(
        `SELECT c.id, c.name, c.slug, c.image, COUNT(p.id) AS product_count
         FROM categories c LEFT JOIN products p ON p.category_id = c.id
         GROUP BY c.id ORDER BY c.id`
    );
    res.json({ categories });
};

const readCategory = (body) => {
    const name = str(body.name, 100);
    if (name.length < 2) throw new HttpError(400, "Category name is required");
    return { name, slug: slugify(name), image: str(body.image, 255) || null };
};

// POST /api/categories (admin)
const createCategory = async (req, res) => {
    const c = readCategory(req.body);
    try {
        const [r] = await db.query("INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)", [c.name, c.slug, c.image]);
        res.status(201).json({ message: "Category created", categoryId: r.insertId });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") throw new HttpError(409, "A category with this name already exists");
        throw err;
    }
};

// PUT /api/categories/:id (admin)
const updateCategory = async (req, res) => {
    const c = readCategory(req.body);
    const [r] = await db.query("UPDATE categories SET name = ?, slug = ?, image = ? WHERE id = ?", [c.name, c.slug, c.image, req.params.id]);
    if (!r.affectedRows) throw new HttpError(404, "Category not found");
    res.json({ message: "Category updated" });
};

module.exports = { getCategories, createCategory, updateCategory };
