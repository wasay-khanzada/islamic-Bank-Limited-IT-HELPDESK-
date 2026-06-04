const express = require("express");
const router = express.Router();

const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); 
const { validateTicketCreate } = require("../middleware/validationMiddleware");

// ─── CREATE TICKET ─────────────────────────────
router.post(
  "/",
  authMiddleware,
  upload.single("attachment"),
  validateTicketCreate,
  ticketController.createTicket
);

// ─── GET MY TICKETS ────────────────────────────
router.get("/my", authMiddleware, ticketController.getMyTickets);

// ─── GET ASSIGNED TICKETS ──────────────────────
router.get("/assigned", authMiddleware, ticketController.getAssignedTickets);

// ─── GET ALL TICKETS ───────────────────────────
router.get("/", authMiddleware, ticketController.getTickets);

// ─── GET SINGLE TICKET ─────────────────────────
router.get("/:id", authMiddleware, ticketController.getTicketById);

// ─── ASSIGN TICKET ─────────────────────────────
router.put("/assign/:id", authMiddleware, ticketController.assignTicket);

// ─── ADD COMMENT ───────────────────────────────
router.post("/comment", authMiddleware, ticketController.addComment);

// ─── UPDATE STATUS (🔥 FIXED HERE)
router.put(
  "/status/:id",
  authMiddleware,
  ticketController.updateStatus   // ✅ correct function name
);

// ─── DELETE TICKET ─────────────────────────────
router.delete(
  "/:id",
  authMiddleware,
  ticketController.deleteTicket
);

// ─── GET SINGLE TICKET AUDIT LOG ───────────────
router.get(
  "/:id/audit",
  authMiddleware,
  ticketController.getAuditLog   // ⚠️ ensure controller me exist ho
);

// ─── GET ALL AUDIT LOGS ───────────────────────
router.get(
  "/audit-logs",
  authMiddleware,
  ticketController.getAuditLogs   // ⚠️ ensure controller me exist ho
);

module.exports = router;