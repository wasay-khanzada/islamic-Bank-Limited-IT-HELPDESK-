const { Department, Category } = require("../models");

const DEPARTMENTS = ["IT", "HR", "Finance", "Operations", "Branch Banking"];
const CATEGORIES = [
  "Hardware Issue",
  "Software Issue",
  "Network/Internet",
  "Access Request",
  "Email/Outlook Issue",
  "ATM/POS Issue",
];

async function ensureByName(Model, names) {
  for (const name of names) {
    // findOrCreate is safe + idempotent for unique(name)
    // (if unique constraint is missing at DB-level, this still works but may allow dupes)
    await Model.findOrCreate({ where: { name }, defaults: { name } });
  }
}

async function seedReferenceData() {
  await ensureByName(Department, DEPARTMENTS);
  await ensureByName(Category, CATEGORIES);
}

module.exports = { seedReferenceData, DEPARTMENTS, CATEGORIES };

