const express = require("express");

const {
    getCart,
    addToCart,
    removeCartItem
} = require("../controllers/cartController");

const router = express.Router();


// Get cart
router.get("/:userId", getCart);


// Add product
router.post("/add", addToCart);


// Remove product
router.delete("/item/:id", removeCartItem);


module.exports = router;