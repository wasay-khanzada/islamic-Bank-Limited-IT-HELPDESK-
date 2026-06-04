const { Notification, User } = require("../models");
const emailService = require("./emailService");

exports.createNotification = async ({ userId, message, ticketId, type = "info" }) => {
  try {
    // 1. Save to DB
    const notification = await Notification.create({
      userId,
      message,
      ticketId,
      type,
    });

    // 2. Real-time Socket.io Emit
    if (global.io) {
      global.io.to(`user_${userId}`).emit("newNotification", notification);
    }

    // 3. Send Email
    const user = await User.findByPk(userId);
    if (user && user.email) {
      await emailService.sendEmail({
        to: user.email,
        subject: `islamic Helpdesk Notification: ${type.toUpperCase()}`,
        text: message,
        html: `<div style="font-family: sans-serif; padding: 20px;">
                <h2 style="color: #5B1E7A;">islamic IT Helpdesk</h2>
                <p>${message}</p>
                ${ticketId ? `<br/><a href="http://localhost:3000/ticket/${ticketId}" style="background: #5B1E7A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>` : ""}
              </div>`,
      });
    }

    return notification;
  } catch (error) {
    console.error("createNotification error:", error);
  }
};
