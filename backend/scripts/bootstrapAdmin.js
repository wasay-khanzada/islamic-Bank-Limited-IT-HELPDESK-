require("dotenv").config();
const bcrypt = require("bcrypt");

const { sequelize, User, Department } = require("../models");
const { computeRole } = require("../services/roleService");

function requiredEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

async function main() {
  // Required for the bootstrap account
  const name = requiredEnv("BOOTSTRAP_ADMIN_NAME");
  const email = requiredEnv("BOOTSTRAP_ADMIN_EMAIL").toLowerCase().trim();
  const password = requiredEnv("BOOTSTRAP_ADMIN_PASSWORD");
  const employeeId = requiredEnv("BOOTSTRAP_ADMIN_EMPLOYEE_ID").trim();

  // Optional
  const branchCode = (process.env.BOOTSTRAP_ADMIN_BRANCH_CODE || "").trim() || null;
  const designation =
    (process.env.BOOTSTRAP_ADMIN_DESIGNATION || "SVPI").trim() || "SVPI";

  if (!/^\d{5}$/.test(employeeId)) {
    throw new Error("BOOTSTRAP_ADMIN_EMPLOYEE_ID must be exactly 5 digits");
  }

  // Ensure DB connection
  await sequelize.authenticate();

  // Ensure IT department exists
  const [itDept] = await Department.findOrCreate({
    where: { name: "IT" },
    defaults: { name: "IT" },
  });

  const role = computeRole({ departmentName: "IT", designation });
  if (role !== "admin" && role !== "super_admin") {
    throw new Error(
      `Bootstrap designation resolved to role="${role}". Use SVPI/EVPI/SEVPI to get admin/super_admin.`,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create or update by email (stable identifier)
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
      `Bootstrap admin created: id=${created.id}, email=${created.email}, role=${created.role}`,
    );
    return;
  }

  // Update in-place (do not downgrade role)
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
    `Bootstrap admin updated: id=${existing.id}, email=${existing.email}, role=${existing.role}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("bootstrap:admin failed:", err.message);
    process.exit(1);
  });

