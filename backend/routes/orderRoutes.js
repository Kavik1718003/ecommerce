const express = require("express");

const orderController =
    require("../controllers/orderController");

const router = express.Router();


// Create order
router.post(
    "/",
    orderController.createOrder
);


// Get user orders
router.get(
    "/user/:userId",
    orderController.getUserOrders
);


module.exports = router;