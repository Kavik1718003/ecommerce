const express = require("express");

const {
    getAllProducts,
    getProductById,
    addProduct,
    deleteProduct
} = require("../controllers/productController");


const router = express.Router();


// ===============================
// GET ALL PRODUCTS
// ===============================

router.get(
    "/",
    getAllProducts
);


// ===============================
// ADD PRODUCT
// ===============================

router.post(
    "/",
    addProduct
);


// ===============================
// GET PRODUCT BY ID
// ===============================

router.get(
    "/:id",
    getProductById
);


// ===============================
// DELETE PRODUCT
// ===============================

router.delete(
    "/:id",
    deleteProduct
);


module.exports = router;