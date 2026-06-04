// controllers/adminController.js
const { Ticket, User, Department, Category, Asset } = require("../models");
const { Op } = require("sequelize");

// GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role === "user") {
      // User stats: myOpen, myInProgress, myResolved
      const myOpen = await Ticket.count({ where: { created_by: userId, status: "open" } });
      const myInProgress = await Ticket.count({ where: { created_by: userId, status: "in-progress" } });
      const myResolved = await Ticket.count({ where: { created_by: userId, status: { [Op.in]: ["resolved", "closed"] } } });

      return res.json({
        success: true,
        data: { myOpen, myInProgress, myResolved }
      });
    } else if (role === "agent") {
      // Agent stats: assignedOpen, assignedInProgress, assignedResolved
      const assignedOpen = await Ticket.count({ where: { assigned_to: userId, status: "open" } });
      const assignedInProgress = await Ticket.count({ where: { assigned_to: userId, status: "in-progress" } });
      const assignedResolved = await Ticket.count({ where: { assigned_to: userId, status: { [Op.in]: ["resolved", "closed"] } } });

      return res.json({
        success: true,
        data: { assignedOpen, assignedInProgress, assignedResolved }
      });
    } else if (role === "admin" || role === "super_admin") {
      // Admin stats: totalTickets, open, inProgress, resolved, totalAgents, pendingRegistrations
      const totalTickets = await Ticket.count();
      const open = await Ticket.count({ where: { status: "open" } });
      const inProgress = await Ticket.count({ where: { status: "in-progress" } });
      const resolved = await Ticket.count({ where: { status: { [Op.in]: ["resolved", "closed"] } } });
      const totalAgents = await User.count({ where: { role: "agent" } });
      const pendingRegistrations = await User.count({ where: { is_approved: false } });

      return res.json({
        success: true,
        data: {
          totalTickets,
          open,
          inProgress,
          resolved,
          totalAgents,
          pendingRegistrations,
        },
      });
    } else {
      return res.status(403).json({ success: false, message: "Invalid role" });
    }
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/tickets
exports.getAllTickets = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admins only" });
    }

    const tickets = await Ticket.findAll({
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
    console.error("getAllTickets error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/agents
exports.getAgents = async (req, res) => {
  try {
    if (
      req.user.role !== "admin" &&
      req.user.role !== "super_admin" &&
      req.user.role !== "agent"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }

    const agents = await User.findAll({
      where: { role: "agent" },
      attributes: ["id", "name", "email"],
    });

    res.json({ success: true, data: agents });
  } catch (err) {
    console.error("getAgents error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/registration-requests
exports.getRegistrationRequests = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    const requests = await User.findAll({
      where: { is_approved: false },
      attributes: ["id", "name", "email", "role", "employeeId", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    console.error("getRegistrationRequests error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/registration-requests/:id/approve
exports.approveRegistration = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.update({ is_approved: true, accountStatus: "approved", status: "approved" });

    res.json({ success: true, message: "User approved successfully", data: user });
  } catch (err) {
    console.error("approveRegistration error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/registration-requests/:id/reject
exports.rejectRegistration = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.update({ accountStatus: "rejected", status: "rejected" });
    // Optionally delete the user record instead
    // await user.destroy();

    res.json({ success: true, message: "User rejected successfully" });
  } catch (err) {
    console.error("rejectRegistration error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
