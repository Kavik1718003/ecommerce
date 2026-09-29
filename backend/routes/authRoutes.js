const express = require("express");
const auth = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", auth.registerUser);
router.post("/login", auth.loginUser);

router.get("/me", requireAuth, auth.getMe);
router.put("/me", requireAuth, auth.updateMe);
router.put("/password", requireAuth, auth.changePassword);

module.exports = router;
