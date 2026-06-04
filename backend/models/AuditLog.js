// models/AuditLog.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AuditLog = sequelize.define("AuditLog", {
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: true,   // ← was false, logs without a ticket were invalid
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = AuditLog;