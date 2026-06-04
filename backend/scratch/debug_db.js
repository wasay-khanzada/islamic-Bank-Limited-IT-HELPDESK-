const { sequelize, Ticket, Notification, User } = require("../models");

async function debug() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    const ticketDesc = await sequelize.getQueryInterface().describeTable("Tickets");
    console.log("Tickets Columns:", Object.keys(ticketDesc));
    
    const userDesc = await sequelize.getQueryInterface().describeTable("Users");
    console.log("Users Columns:", Object.keys(userDesc));

    if (!ticketDesc.slaDeadline) console.error("MISSING: slaDeadline in Tickets");
    if (!ticketDesc.slaStatus) console.error("MISSING: slaStatus in Tickets");
    if (!userDesc.status) console.error("MISSING: status in Users");

    try {
      const notifDesc = await sequelize.getQueryInterface().describeTable("Notifications");
      console.log("Notifications table exists.");
    } catch (e) {
      console.error("MISSING: Notifications table");
    }

    process.exit(0);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

debug();
