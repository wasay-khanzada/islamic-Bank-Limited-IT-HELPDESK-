require("dotenv").config();

const { Op } = require("sequelize");
const {
  sequelize,
  User,
  Ticket,
  Comment,
  AuditLog,
  Asset,
  UserAsset,
  Department,
  Category,
} = require("../models");
const { seedReferenceData } = require("../bootstrap/seedReferenceData");

function argValue(flag) {
  const prefix = `--${flag}=`;
  const match = process.argv.find((a) => a.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

function hasFlag(flag) {
  return process.argv.includes(`--${flag}`);
}

async function main() {
  const confirm = argValue("confirm") || (hasFlag("confirm") ? "yes" : "");
  const keepDepartmentsCategories =
    argValue("keepDepartmentsCategories") ||
    argValue("keepDepsCategories") ||
    (hasFlag("keepDepartmentsCategories") ? "yes" : "yes");

  const keepEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const keepSuperEmail = process.env.BOOTSTRAP_SUPERADMIN_EMAIL;
  if (!keepEmail) {
    throw new Error("BOOTSTRAP_ADMIN_EMAIL env var is required");
  }

  const keepEmails = [keepEmail.toLowerCase().trim()];
  if (keepSuperEmail) keepEmails.push(keepSuperEmail.toLowerCase().trim());

  if (String(confirm).toLowerCase() !== "yes") {
    throw new Error("Refusing to reset DB without --confirm=yes");
  }

  await sequelize.authenticate();

  if (String(keepDepartmentsCategories).toLowerCase() === "yes") {
    // Ensure reference data exists even after wiping user/ticket data
    await seedReferenceData();
  }

  // Wipe data (no DROP; keep schema + reference tables)
  // Order matters for FK constraints.
  await UserAsset.destroy({ where: {}, truncate: false });
  await Comment.destroy({ where: {}, truncate: false });
  await AuditLog.destroy({ where: {}, truncate: false });
  await Ticket.destroy({ where: {}, truncate: false });

  // Keep super admin (and optionally allow keeping any account with BOOTSTRAP_ADMIN_EMAIL)
  await User.destroy({
    where: {
      email: { [Op.notIn]: keepEmails },
    },
    force: true,
  });

  // Optional clean for Assets table (since asset assignments depend on users/tickets)
  await UserAsset.destroy({ where: {}, truncate: false });
  await Asset.destroy({ where: {}, truncate: false });

  // Validate super admin is still present and approved
  // Ensure preserved accounts are still approved
  const preservedUsers = await User.scope(null).findAll({
    where: { email: { [Op.in]: keepEmails } },
  });

  if (preservedUsers.length === 0) {
    throw new Error("Reset completed but no preserved users were found.");
  }

  for (const u of preservedUsers) {
    u.status = "approved";
    u.accountStatus = "approved";
    await u.save();
  }

  // Ensure Department/Category exist if they were kept
  if (String(keepDepartmentsCategories).toLowerCase() === "yes") {
    // seedReferenceData already called, but safe to call again
    await seedReferenceData();
  }

  console.log("✅ Database reset completed (reference data preserved)");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("reset:confirm failed:", err.message);
    process.exit(1);
  });

