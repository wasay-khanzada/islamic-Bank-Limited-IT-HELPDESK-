module.exports = ({
  User,
  Ticket,
  Comment,
  AuditLog,
  Department,
  Category,
  Asset,
  UserAsset,
  Notification,
}) => {
  // ─── EXISTING ASSOCIATIONS (untouched) ───────────────────────
  Ticket.belongsTo(User, { foreignKey: "created_by", as: "creator" });
  User.hasMany(Ticket, { foreignKey: "created_by", as: "myTickets" });

  Ticket.belongsTo(User, { foreignKey: "assigned_to", as: "assignedAgent" });
  User.hasMany(Ticket, { foreignKey: "assigned_to", as: "assignedTickets" });

  Comment.belongsTo(User, { foreignKey: "userId", as: "author" });
  Comment.belongsTo(Ticket, { foreignKey: "ticketId", as: "ticket" });
  Ticket.hasMany(Comment, { foreignKey: "ticketId", as: "comments" });

  // ✅ AuditLog associations
  AuditLog.belongsTo(Ticket, { foreignKey: "ticketId", as: "ticket" });
  AuditLog.belongsTo(User, { foreignKey: "userId", as: "actor" });
  Ticket.hasMany(AuditLog, { foreignKey: "ticketId", as: "logs" });

  // ─── NEW ASSOCIATIONS ────────────────────────────────────────

  // User → Department
  User.belongsTo(Department, { foreignKey: "departmentId", as: "department" });
  Department.hasMany(User, { foreignKey: "departmentId", as: "users" });

  // Ticket → Category
  Ticket.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
  Category.hasMany(Ticket, { foreignKey: "categoryId", as: "tickets" });

  // Ticket → Department (routed to IT)
  Ticket.belongsTo(Department, {
    foreignKey: "department_id",
    as: "department",
  });
  Department.hasMany(Ticket, {
    foreignKey: "department_id",
    as: "departmentTickets",
  });

  // Ticket → Asset (optional)
  Ticket.belongsTo(Asset, { foreignKey: "assetId", as: "asset" });
  Asset.hasMany(Ticket, { foreignKey: "assetId", as: "tickets" });

  // User ↔ Asset (many-to-many through UserAsset)
  User.belongsToMany(Asset, {
    through: UserAsset,
    foreignKey: "userId",
    otherKey: "assetId",
    as: "assets",
  });
  Asset.belongsToMany(User, {
    through: UserAsset,
    foreignKey: "assetId",
    otherKey: "userId",
    as: "assignedUsers",
  });

  // UserAsset belongs to Asset
  UserAsset.belongsTo(Asset, { foreignKey: "assetId", as: "asset" });

  // User ↔ Notification
  User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
  Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

  // Ticket ↔ Notification (optional, for linking notifications to tickets)
  Ticket.hasMany(Notification, { foreignKey: "ticketId", as: "notifications" });
  Notification.belongsTo(Ticket, { foreignKey: "ticketId", as: "ticket" });
};
