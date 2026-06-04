const { Ticket, User, Comment, AuditLog, Department, Category, Asset } = require("../models");
const notificationService = require("../services/notificationService");
const slaService = require("../services/slaService");
const { Op } = require("sequelize");

// ─── CREATE TICKET ────────────────────────────────────────────
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority, categoryId, assetId, department_id } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    const attachment = req.file ? req.file.filename : null;

    let finalDepartmentId = department_id;
    if (!finalDepartmentId) {
      const itDepartment = await Department.findOne({ where: { name: "IT" } });
      if (itDepartment) finalDepartmentId = itDepartment.id;
    }

    const slaDeadline = slaService.calculateSlaDeadline(priority || "medium");

    const ticket = await Ticket.create({
      subject,
      description,
      priority: priority || "medium",
      created_by: req.user.id,
      status: "open",
      attachment,
      department_id: finalDepartmentId,
      categoryId: categoryId || null,
      assetId: assetId || null,
      slaDeadline,
    });

    // ✅ Fetch creator name from DB (req.user.name may be undefined)
    const creator = await User.findByPk(req.user.id, { attributes: ["id", "name"] });
    const creatorName = creator?.name || "Someone";

    const admins = await User.findAll({
      where: { role: { [Op.in]: ["admin", "super_admin"] } }
    });

    for (const admin of admins) {
      await notificationService.createNotification({
        userId: admin.id,
        message: `New ticket created by ${creatorName}: "${ticket.subject}"`,
        ticketId: ticket.id,
        type: "info"
      });
    }

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (err) {
    console.error("createTicket error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL TICKETS (with role-based filtering) ──────────────
exports.getTickets = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let whereClause = {};

    if (role === "user") {
      whereClause = { created_by: userId };
    } else if (role === "agent") {
      whereClause = { assigned_to: userId };
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "employeeId", "branchCode"],
          include: [{ model: Department, as: "department", attributes: ["id", "name"] }],
        },
        { model: User, as: "assignedAgent", attributes: ["id", "name", "email"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: Department, as: "department", attributes: ["id", "name"] },
        { model: Asset, as: "asset", attributes: ["id", "name", "type"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    console.error("getTickets error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY TICKETS ───────────────────────────────────────────
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { created_by: req.user.id },
      include: [
        { model: User, as: "assignedAgent", attributes: ["id", "name", "email"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: Department, as: "department", attributes: ["id", "name"] },
        { model: Asset, as: "asset", attributes: ["id", "name", "type"] },
        {
          model: Comment,
          as: "comments",
          include: [{ model: User, as: "author", attributes: ["id", "name", "role"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    console.error("getMyTickets error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ASSIGNED TICKETS (for agents) ───────────────────────────
exports.getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { assigned_to: req.user.id },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "employeeId", "branchCode"],
          include: [{ model: Department, as: "department", attributes: ["id", "name"] }],
        },
        { model: User, as: "assignedAgent", attributes: ["id", "name", "email"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: Department, as: "department", attributes: ["id", "name"] },
        { model: Asset, as: "asset", attributes: ["id", "name", "type"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    console.error("getAssignedTickets error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET SINGLE TICKET with timeline ─────────────────────────
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "employeeId", "branchCode"],
          include: [{ model: Department, as: "department", attributes: ["id", "name"] }],
        },
        { model: User, as: "assignedAgent", attributes: ["id", "name", "email"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: Department, as: "department", attributes: ["id", "name"] },
        { model: Asset, as: "asset", attributes: ["id", "name", "type"] },
        {
          model: Comment,
          as: "comments",
          include: [{ model: User, as: "author", attributes: ["id", "name", "role"] }],
          order: [["createdAt", "ASC"]],
        },
        {
          model: AuditLog,
          as: "logs",
          include: [{ model: User, as: "actor", attributes: ["id", "name", "role"] }],
          order: [["createdAt", "ASC"]],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const { role, id: userId } = req.user;
    if (role === "user" && ticket.created_by !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (role === "agent" && ticket.assigned_to !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    console.error("getTicketById error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ASSIGN TICKET (admin only) ───────────────────────────────
exports.assignTicket = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    const { agentId } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const agent = await User.findOne({
      where: { id: agentId, role: "agent" },
      attributes: ["id", "name", "email"],
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found or user is not an agent",
      });
    }

    await ticket.update({ assigned_to: agentId, status: "in-progress" });

    await AuditLog.create({
      ticketId: ticket.id,
      userId: req.user.id,
      action: `Ticket assigned to ${agent.name}`,
    });

    await notificationService.createNotification({
      userId: agentId,
      message: `You have been assigned a new ticket: "${ticket.subject}"`,
      ticketId: ticket.id,
      type: "info"
    });

    res.json({
      success: true,
      message: `Ticket assigned to ${agent.name}`,
      data: ticket,
    });
  } catch (err) {
    console.error("assignTicket error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADD COMMENT ──────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { ticketId, body } = req.body;

    if (!ticketId || !body) {
      return res.status(400).json({
        success: false,
        message: "ticketId and body are required",
      });
    }

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const { role, id: userId } = req.user;
    if (role === "user" && ticket.created_by !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const comment = await Comment.create({
      ticketId,
      userId,
      message: body,
    });

    const full = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: "author", attributes: ["id", "name", "role"] }],
    });

    await AuditLog.create({
      ticketId,
      userId,
      action: `Comment added`,
    });

    if (global.io) {
      global.io.to(`ticket_${ticketId}`).emit("newComment", full);
    }

    // ✅ Fetch commenter name from DB
    const commenter = await User.findByPk(userId, { attributes: ["id", "name"] });
    const commenterName = commenter?.name || "Someone";

    const recipientId = (userId === ticket.created_by) ? ticket.assigned_to : ticket.created_by;
    if (recipientId) {
      await notificationService.createNotification({
        userId: recipientId,
        message: `New comment on ticket "${ticket.subject}" by ${commenterName}`,
        ticketId: ticket.id,
        type: "info"
      });
    }

    res.status(201).json({ success: true, message: "Comment added", data: full });
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE STATUS ────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    if (req.user.role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { status, assigned_to } = req.body;
    const allowed = ["open", "in-progress", "resolved", "closed"];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be: ${allowed.join(", ")}`,
      });
    }

    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const { role, id: userId } = req.user;
    if (role === "agent" && ticket.assigned_to !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your assigned tickets",
      });
    }

    const updates = {};
    if (status) updates.status = status;

    if ((role === "admin" || role === "super_admin") && assigned_to !== undefined) {
      updates.assigned_to = assigned_to;
    }

    if (status === "resolved" || status === "closed") {
      updates.slaStatus = "met";
    }

    await ticket.update(updates);

    // ✅ Fetch updater name from DB — req.user.name is undefined from JWT
    const updater = await User.findByPk(userId, { attributes: ["id", "name"] });
    const updaterName = updater?.name || "Support Team";

    await AuditLog.create({
      ticketId: ticket.id,
      userId: userId,
      action: `Ticket updated: ${JSON.stringify(updates)}`,
    });

    // ✅ Build a clear, human-readable message
    let notifMessage;
    if (status === "resolved") {
      notifMessage = `Your ticket "${ticket.subject}" has been resolved by ${updaterName}.`;
    } else if (status === "closed") {
      notifMessage = `Your ticket "${ticket.subject}" has been closed by ${updaterName}.`;
    } else if (status === "in-progress") {
      notifMessage = `Your ticket "${ticket.subject}" is now in progress, assigned to ${updaterName}.`;
    } else {
      notifMessage = `Your ticket "${ticket.subject}" has been updated by ${updaterName}.`;
    }

    await notificationService.createNotification({
      userId: ticket.created_by,
      message: notifMessage,
      ticketId: ticket.id,
      type: (status === "resolved" || status === "closed") ? "success" : "info"
    });

    res.json({ success: true, message: "Ticket updated", data: ticket });
  } catch (err) {
    console.error("updateStatus error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET SINGLE TICKET AUDIT LOG ─────────────
exports.getAuditLog = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      where: { ticketId: req.params.id },
      include: [
        { model: User, as: "actor", attributes: ["id", "name", "role"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    console.error("getAuditLog error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL AUDIT LOGS ─────────────────────
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [
        { model: User, as: "actor", attributes: ["id", "name", "role"] },
        { model: Ticket, attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    console.error("getAuditLogs error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE TICKET ─────────────────────────────
exports.deleteTicket = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // ✅ Fetch deleter name from DB
    const deleter = await User.findByPk(req.user.id, { attributes: ["id", "name"] });
    const deleterName = deleter?.name || "Admin";

    await ticket.destroy();

    await AuditLog.create({
      ticketId: req.params.id,
      userId: req.user.id,
      action: `Ticket deleted by ${deleterName}`,
    });

    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (err) {
    console.error("deleteTicket error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};