const { AuditLog, User, Ticket } = require('../models');

exports.getAllAuditLogs = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    const auditLogs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'actor',           // ← matches AuditLog.belongsTo(User, { as: 'actor' })
          attributes: ['id', 'name', 'email'],
          required: false,
        },
        {
          model: Ticket,
          as: 'ticket',          // ← matches AuditLog.belongsTo(Ticket, { as: 'ticket' })
          attributes: ['id', 'subject'],
          required: false,
        },
      ],
    });

    res.json({ success: true, data: auditLogs });
  } catch (error) {
    console.error('Error fetching audit logs:', error.message);
    res.status(500).json({ message: 'Failed to fetch audit logs', detail: error.message });
  }
};