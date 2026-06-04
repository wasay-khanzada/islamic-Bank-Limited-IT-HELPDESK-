const { User, Department } = require("../models");
const notificationService = require("./notificationService");

async function setUserApprovalStatus({ targetUserId, status, requesterRole }) {
  const user = await User.scope(null).findByPk(targetUserId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  // Admin cannot approve/reject Super Admin accounts
  if (requesterRole === "admin" && user.role === "super_admin") {
    const err = new Error("Admins cannot approve or reject a Super Admin");
    err.statusCode = 403;
    throw err;
  }

  user.status = status;
  user.accountStatus = status; // backward compatible
  await user.save();

  // ✅ Notify User of Approval/Rejection
  await notificationService.createNotification({
    userId: user.id,
    message: status === "approved" 
      ? "Congratulations! Your account has been approved. You can now login." 
      : "We regret to inform you that your account registration has been rejected.",
    type: status === "approved" ? "success" : "danger"
  });

  return user;
}

async function listPendingUsers() {
  const users = await User.scope(null).findAll({
    where: { status: "pending" },
    attributes: [
      "id",
      "name",
      "email",
      "role",
      "employeeId",
      "branchCode",
      "departmentId",
      "designation",
      "status",
      "accountStatus",
      "organization",
      "createdAt",
    ],
    include: [{ model: Department, as: "department", attributes: ["id", "name"] }],
    order: [["createdAt", "ASC"]],
  });

  return users;
}

module.exports = { setUserApprovalStatus, listPendingUsers };

