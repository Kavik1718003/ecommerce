const express = require("express");
const product = require("../controllers/productController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", product.getAllProducts);
router.get("/:id", product.getProductById);

router.post("/", requireAdmin, product.addProduct);
router.put("/:id", requireAdmin, product.updateProduct);
router.delete("/:id", requireAdmin, product.deleteProduct);

module.exports = router;
