const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all audit logs (super_admin only)
router.get('/audit-logs', authMiddleware, auditController.getAllAuditLogs);

module.exports = router;
