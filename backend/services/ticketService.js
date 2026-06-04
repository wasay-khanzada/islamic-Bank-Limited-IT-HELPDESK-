// services/ticketService.js
const Ticket = require("../models/Ticket");
const Comment = require("../models/Comment");
const User = require("../models/User");

class TicketService {
  // Create a new ticket
  async createTicket(userId, title, description, priority) {
    const ticket = await Ticket.create({
      title,
      description,
      priority,
      userId,
      status: "open",
    });
    return ticket;
  }

  // Get all tickets with user and assigned agent info
  async getAllTickets() {
    const tickets = await Ticket.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
      ],
    });
    return tickets;
  }

  // Assign ticket to agent
  async assignTicket(ticketId, agentId) {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) throw new Error("Ticket not found");

    ticket.assignedToId = agentId;
    await ticket.save();
    return ticket;
  }

  // Add comment to ticket
  async addComment(ticketId, userId, message) {
    const comment = await Comment.create({ ticketId, userId, message });
    return comment;
  }

  async getTicketById(ticketId) {
    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "assignedTo",
          attributes: ["id", "name", "email"],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    return ticket;
  }

  // Update ticket status
  async updateStatus(ticketId, status) {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) throw new Error("Ticket not found");

    ticket.status = status;
    await ticket.save();
    return ticket;
  }

  // Get tickets of a specific user
  async getTicketsByUser(userId) {
    const tickets = await Ticket.findAll({
      where: { userId },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: User, as: "assignedTo", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return tickets;
  }
}

module.exports = new TicketService();
