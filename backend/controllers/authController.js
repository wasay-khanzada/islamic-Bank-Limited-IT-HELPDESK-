const User = require("../models/User");
const { Department } = require("../models");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { computeRole } = require("../services/roleService");
const notificationService = require("../services/notificationService");
const { Op } = require("sequelize");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, employeeId, branchCode, departmentId, designation } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    let departmentName = null;
    if (departmentId) {
      const dept = await Department.findByPk(departmentId);
      if (!dept) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid departmentId" });
      }
      departmentName = dept.name;
    }

    const role = computeRole({
      departmentName,
      designation,
      employeeId,
    });

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      employeeId: employeeId || null,
      branchCode: branchCode || null,
      departmentId: departmentId || null,
      designation: designation || null,
      organization: "islamic Bank Head Office, Karachi",
      status: "pending",
      accountStatus: "pending",
    });

    // ✅ Notify Admins of new registration
    const admins = await User.findAll({
      where: {
        role: { [Op.in]: ["admin", "super_admin"] }
      }
    });

    for (const admin of admins) {
      await notificationService.createNotification({
        userId: admin.id,
        message: `New registration request: ${user.name} (${user.role}) is pending approval.`,
        type: "info"
      });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        branchCode: user.branchCode,
        departmentId: user.departmentId,
        designation: user.designation,
        status: user.status,
        accountStatus: user.accountStatus,
        organization: user.organization,
      },
      token: generateToken(user.id, user.role, user.email),
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message:
        err?.name === "SequelizeUniqueConstraintError"
          ? "User already exists (email/employeeId must be unique)"
          : "User already exists or invalid data",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope(null).findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const approvalStatus = (user.status === "approved" || user.accountStatus === "approved") ? "approved" : (user.status || user.accountStatus || "pending");
    if (approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: `Account ${approvalStatus}. Please contact admin for approval.`,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        branchCode: user.branchCode,
        departmentId: user.departmentId,
        designation: user.designation,
        status: user.status,
        accountStatus: user.accountStatus,
        organization: user.organization,
      },
      token: generateToken(user.id, user.role, user.email), // ← fix
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
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
      ],
      include: [{ model: Department, as: "department", attributes: ["id", "name"] }],
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.scope(null).findByPk(req.user.id);

    if (name) user.name = name;
    if (password) {
      const bcrypt = require("bcrypt");
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated!",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
