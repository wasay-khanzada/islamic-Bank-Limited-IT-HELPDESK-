const { sequelize, User } = require("../models");

async function fix() {
  try {
    await sequelize.authenticate();
    console.log("Connection established for manual migration.");

    const queryInterface = sequelize.getQueryInterface();

    // 1. Check/Add slaDeadline to Tickets
    try {
      // Drop first to ensure correct type if previous attempt created it as DATETIME
      try { await queryInterface.removeColumn('Tickets', 'slaDeadline'); } catch(e) {}
      
      await queryInterface.addColumn('Tickets', 'slaDeadline', {
        type: 'DATETIMEOFFSET',
        allowNull: true
      });
      console.log("Added slaDeadline to Tickets as DATETIMEOFFSET.");
    } catch (e) {
      console.log("slaDeadline error:", e.message);
    }

    // 2. Check/Add slaStatus to Tickets
    try {
      await queryInterface.addColumn('Tickets', 'slaStatus', {
        type: 'NVARCHAR(255)',
        defaultValue: 'pending',
        allowNull: false
      });
      console.log("Added slaStatus to Tickets.");
    } catch (e) {
      console.log("slaStatus already exists or failed:", e.message);
    }

    // 3. Sync status with accountStatus for Users
    try {
      await sequelize.query("UPDATE Users SET status = accountStatus WHERE status IS NULL OR status = 'pending'");
      console.log("Synced Users status with accountStatus.");
    } catch (e) {
      console.log("User status sync failed:", e.message);
    }

    console.log("Manual migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

fix();
