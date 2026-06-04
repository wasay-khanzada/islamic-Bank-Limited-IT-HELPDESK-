const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("user", "agent", "admin", "super_admin"), defaultValue: "user" },
    employeeId: {
      type: DataTypes.STRING(5),
      unique: true,
      allowNull: true,
      validate: {
        is: {
          args: /^\d{5}$/,
          msg: "Employee ID must be exactly 5 digits",
        },
      },
    },
    branchCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Departments",
        key: "id",
      },
      onDelete: "NO ACTION",
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accountStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    organization: {
      type: DataTypes.STRING,
      defaultValue: "islamic Bank Head Office, Karachi",
    },
  },
  {
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
  },
);

module.exports = User;
