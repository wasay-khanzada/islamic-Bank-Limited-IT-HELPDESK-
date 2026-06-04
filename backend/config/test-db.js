const sequelize = require("./db");

async function testDBConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database Connected Successfully!");

    await sequelize.sync({ alter: false });
    console.log("✅ Models Synced (if any exist)");
  } catch (error) {
    console.error("❌ Database Connection Failed:");
    console.error(error.message || error);
  }
}

testDBConnection();
