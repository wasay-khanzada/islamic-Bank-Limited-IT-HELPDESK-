// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getStats,
  getAllTickets,
  getAgents,
  getRegistrationRequests,
  approveRegistration,
  rejectRegistration,
} = require("../controllers/adminController");

router.get("/stats", authMiddleware, getStats);
router.get("/tickets", authMiddleware, getAllTickets);
router.get("/agents", authMiddleware, getAgents);
router.get("/registration-requests", authMiddleware, getRegistrationRequests);
router.put("/registration-requests/:id/approve", authMiddleware, approveRegistration);
router.delete("/registration-requests/:id/reject", authMiddleware, rejectRegistration);

module.exports = router;
