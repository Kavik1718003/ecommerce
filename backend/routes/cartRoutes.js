const express = require("express");
const cart = require("../controllers/cartController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// The cart always belongs to the logged-in user (from the token)
router.use(requireAuth);

router.get("/", cart.getCart);
router.delete("/", cart.clearCart);
router.post("/items", cart.addToCart);
router.put("/items/:id", cart.updateCartItem);
router.delete("/items/:id", cart.removeCartItem);

module.exports = router;
