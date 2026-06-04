const sequelize = require("../config/db");
const User = require("./User");
const Ticket = require("./Ticket");
const Comment = require("./Comment");
const AuditLog = require("./AuditLog");
const Department = require("./Department");
const Category = require("./Category");
const Asset = require("./Asset");
const UserAsset = require("./UserAsset");
const Notification = require("./Notification");

const models = {
  User,
  Ticket,
  Comment,
  AuditLog,
  Department,
  Category,
  Asset,
  UserAsset,
  Notification,
};

require("./associations")(models);

module.exports = {
  sequelize,
  ...models,
};
