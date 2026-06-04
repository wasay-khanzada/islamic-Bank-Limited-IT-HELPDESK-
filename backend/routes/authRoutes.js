const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRegistration } = require("../middleware/validationMiddleware");

router.post("/register", validateRegistration, register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile); // ✅ new
router.put("/profile", authMiddleware, updateProfile); // ✅ new

module.exports = router;
