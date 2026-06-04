const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Asset = sequelize.define("Asset", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [["laptop", "phone", "extension"]],
    },
  },
});

module.exports = Asset;
