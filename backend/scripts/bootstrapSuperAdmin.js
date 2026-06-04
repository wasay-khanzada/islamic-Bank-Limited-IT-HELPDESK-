require("dotenv").config();
const bcrypt = require("bcrypt");

const { sequelize, User, Department } = require("../models");
const { computeRole } = require("../services/roleService");

function requiredEnv(name) {
  const val = process.env[name];
  if (!val || String(val).trim() === "" || String(val).trim() === "CHANGE_ME") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
}

async function main() {
  const name = requiredEnv("BOOTSTRAP_SUPERADMIN_NAME");
  const email = requiredEnv("BOOTSTRAP_SUPERADMIN_EMAIL").toLowerCase().trim();
  const password = requiredEnv("BOOTSTRAP_SUPERADMIN_PASSWORD");
  const employeeId = requiredEnv("BOOTSTRAP_SUPERADMIN_EMPLOYEE_ID").trim();
  const branchCode =
    (process.env.BOOTSTRAP_SUPERADMIN_BRANCH_CODE || "").trim() || null;
  const designation =
    (process.env.BOOTSTRAP_SUPERADMIN_DESIGNATION || "SEVPI").trim() || "SEVPI";

  if (!/^\d{5}$/.test(employeeId)) {
    throw new Error("BOOTSTRAP_SUPERADMIN_EMPLOYEE_ID must be exactly 5 digits");
  }

  await sequelize.authenticate();

  // Ensure IT department exists
  const [itDept] = await Department.findOrCreate({
    where: { name: "IT" },
    defaults: { name: "IT" },
  });

  const role = computeRole({
    departmentName: "IT",
    designation,
    allowSuperAdmin: true,
  });
  if (role !== "super_admin") {
    throw new Error(
      `Super admin designation resolved to role="${role}". Use SEVPI/SEVPII for super_admin.`,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await User.scope(null).findOne({ where: { email } });

  if (!existing) {
    const created = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      employeeId,
      branchCode,
      departmentId: itDept.id,
      designation,
      organization: "islamic Bank Head Office, Karachi",
      status: "approved",
      accountStatus: "approved",
    });

    // eslint-disable-next-line no-console
    console.log(
      `Bootstrap super admin created: id=${created.id}, email=${created.email}, role=${created.role}`,
    );
    return;
  }

  existing.name = name;
  existing.password = hashedPassword;
  existing.employeeId = employeeId;
  existing.branchCode = branchCode;
  existing.departmentId = itDept.id;
  existing.designation = designation;
  existing.organization = "islamic Bank Head Office, Karachi";
  existing.status = "approved";
  existing.accountStatus = "approved";
  existing.role = role;

  await existing.save();

  // eslint-disable-next-line no-console
  console.log(
    `Bootstrap super admin updated: id=${existing.id}, email=${existing.email}, role=${existing.role}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("bootstrap:superadmin failed:", err.message);
    process.exit(1);
  });

