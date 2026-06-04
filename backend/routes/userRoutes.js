const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  approveUser,
  rejectUser,
  getPendingUsers,
  getAllUsers,
} = require("../controllers/userApprovalController");

router.get("/", authMiddleware, getAllUsers);
router.get("/pending", authMiddleware, getPendingUsers);
router.patch("/:id/approve", authMiddleware, approveUser);
router.patch("/:id/reject", authMiddleware, rejectUser);

module.exports = router;

