const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// Use the getStats from adminController but under /api/dashboard/stats
router.get("/stats", authMiddleware, adminController.getStats);

module.exports = router;
