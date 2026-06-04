const {
  setUserApprovalStatus,
  listPendingUsers,
} = require("../services/userApprovalService");
const { User, Department } = require("../models");

function requireAdmin(req, res) {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res.status(403).json({ success: false, message: "Admin access required" });
    return false;
  }
  return true;
}

// PATCH /api/users/:id/approve
exports.approveUser = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const updated = await setUserApprovalStatus({
      targetUserId: req.params.id,
      status: "approved",
      requesterRole: req.user.role,
    });

    res.json({
      success: true,
      message: "User approved",
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
        accountStatus: updated.accountStatus,
      },
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

// PATCH /api/users/:id/reject
exports.rejectUser = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const updated = await setUserApprovalStatus({
      targetUserId: req.params.id,
      status: "rejected",
      requesterRole: req.user.role,
    });

    res.json({
      success: true,
      message: "User rejected",
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
        accountStatus: updated.accountStatus,
      },
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

// GET /api/users/pending
exports.getPendingUsers = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const users = await listPendingUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "employeeId",
        "branchCode",
        "designation",
        "status",
        "accountStatus",
        "createdAt",
      ],
      include: [
        { model: Department, as: "department", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

