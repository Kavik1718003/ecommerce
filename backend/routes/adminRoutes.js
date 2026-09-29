const express = require("express");
const admin = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", admin.adminLogin);

// Everything below requires an admin token
router.use(requireAdmin);

router.get("/stats", admin.getStats);
router.get("/users", admin.getAllUsers);
router.get("/inventory", admin.getInventory);
router.put("/inventory/:id", admin.updateInventory);
router.get("/orders", admin.getAllOrders);
router.get("/orders/:id", admin.getOrderDetail);
router.put("/orders/:id/status", admin.updateOrderStatus);

module.exports = router;
