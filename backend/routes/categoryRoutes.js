const express = require("express");
const category = require("../controllers/categoryController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", category.getCategories);
router.post("/", requireAdmin, category.createCategory);
router.put("/:id", requireAdmin, category.updateCategory);

module.exports = router;
