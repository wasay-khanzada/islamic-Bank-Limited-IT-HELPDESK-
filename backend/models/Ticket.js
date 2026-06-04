const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ticket = sequelize.define("Ticket", {
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "title" 
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("open", "in-progress", "resolved", "closed"),
    defaultValue: "open",
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high", "urgent"),
    defaultValue: "medium",
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "userId",
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "assignedToId",
  },
  attachment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Categories",
      key: "id",
    },
    onDelete: "NO ACTION",
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "departmentId",
    references: {
      model: "Departments",
      key: "id",
    },
    onDelete: "NO ACTION",
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Assets",
      key: "id",
    },
    onDelete: "NO ACTION",
  },
  slaDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  slaStatus: {
    type: DataTypes.ENUM("pending", "met", "warning", "expired"),
    defaultValue: "pending",
  },
}, {
  timestamps: true,
});

module.exports = Ticket;
