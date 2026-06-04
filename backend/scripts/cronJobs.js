const cron = require("node-cron");
const { Ticket, User, Notification } = require("../models");
const { Op } = require("sequelize");
const notificationService = require("../services/notificationService");

// Check every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log("🕒 Running SLA Status Check...");
  
  try {
    const now = new Date();
    const tickets = await Ticket.findAll({
      where: {
        status: { [Op.ne]: "closed" },
        slaStatus: { [Op.ne]: "met" }
      }
    });

    for (const ticket of tickets) {
      if (!ticket.slaDeadline) continue;

      const deadline = new Date(ticket.slaDeadline);
      const diffMs = deadline - now;
      const diffHrs = diffMs / (1000 * 60 * 60);

      // 1. Expired
      if (diffMs < 0 && ticket.slaStatus !== "expired") {
        await ticket.update({ slaStatus: "expired" });
        await notificationService.createNotification({
          userId: ticket.assignedToId || 1, // Notify agent or fallback to admin
          message: `SLA EXPIRED: Ticket "${ticket.title}" has exceeded its deadline!`,
          ticketId: ticket.id,
          type: "danger"
        });
      } 
      // 2. Warning (e.g., less than 4 hours left)
      else if (diffHrs < 4 && diffHrs > 0 && ticket.slaStatus !== "warning") {
        await ticket.update({ slaStatus: "warning" });
        await notificationService.createNotification({
          userId: ticket.assignedToId || 1,
          message: `SLA WARNING: Ticket "${ticket.title}" will expire in less than 4 hours!`,
          ticketId: ticket.id,
          type: "warning"
        });
      }
    }
  } catch (error) {
    console.error("SLA Cron Error:", error);
  }
});
