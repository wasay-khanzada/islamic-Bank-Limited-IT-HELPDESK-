const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserAsset = sequelize.define("UserAsset", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    onDelete: "NO ACTION",
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Assets",
      key: "id",
    },
    onDelete: "NO ACTION",
  },
});

module.exports = UserAsset;
