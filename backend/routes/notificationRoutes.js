const express = require("express");
const router = express.Router();
const { Notification } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/notifications/:id/read  ← naya route
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id   // security: sirf apni notification
      }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    await notification.update({ isRead: true });
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/notifications/read
router.patch("/read", authMiddleware, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
