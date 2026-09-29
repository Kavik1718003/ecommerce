const express = require("express");
const order = require("../controllers/orderController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.post("/", order.createOrder);
router.get("/", order.getMyOrders);
router.get("/:id", order.getOrder);
router.put("/:id/cancel", order.cancelOrder);

module.exports = router;
