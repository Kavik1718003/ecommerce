const express = require("express");

const {
    adminLogin,
    getInventory,
    updateInventory,
    getAllOrders,
    updateOrderStatus,
    getAllUsers
} = require("../controllers/adminController");

const router = express.Router();


// =====================================================
// ADMIN LOGIN
// =====================================================

router.post("/login", adminLogin);


// =====================================================
// CUSTOMERS
// =====================================================

router.get("/users", getAllUsers);


// =====================================================
// INVENTORY
// =====================================================

router.get("/inventory", getInventory);

router.put("/inventory/:id", updateInventory);


// =====================================================
// ORDERS
// =====================================================

router.get("/orders", getAllOrders);

router.put("/orders/:id/status", updateOrderStatus);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;