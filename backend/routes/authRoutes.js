const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router();

// ===============================
// CUSTOMER REGISTER
// ===============================
router.post("/register", registerUser);

// ===============================
// CUSTOMER LOGIN
// ===============================
router.post("/login", loginUser);

module.exports = router;