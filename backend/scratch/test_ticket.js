const { sequelize, Ticket, User, Department } = require("../models");
const slaService = require("../services/slaService");

async function test() {
  try {
    await sequelize.authenticate();
    
    // Find a user and IT dept to use as context
    const user = await User.findOne();
    const dept = await Department.findOne({ where: { name: 'IT' } });

    if (!user || !dept) {
        console.error("Missing user or IT dept for test");
        process.exit(1);
    }

    const slaDeadline = slaService.calculateSlaDeadline("high");
    console.log("Calculated Deadline:", slaDeadline, typeof slaDeadline);

    const ticket = await Ticket.create({
      title: "Test Date Error",
      description: "Testing conversion error",
      priority: "high",
      userId: user.id,
      status: "open",
      departmentId: dept.id,
      slaDeadline: slaDeadline
    });

    console.log("Success! Ticket created:", ticket.id);
    process.exit(0);
  } catch (error) {
    console.error("FAILED with error:", error.message);
    if (error.parent) console.error("SQL Error:", error.parent.message);
    process.exit(1);
  }
}

test();
