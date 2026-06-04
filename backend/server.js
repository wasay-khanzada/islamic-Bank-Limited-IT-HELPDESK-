const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { sequelize } = require("./models");
const { seedReferenceData } = require("./bootstrap/seedReferenceData");
require("./scripts/cronJobs");

// HTTP server banao
const server = http.createServer(app);

// Socket.io attach karo
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Socket.io global accessible banao (controllers mein use hoga)
global.io = io;

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // User apne ticket room mein join kare
  socket.on("joinTicket", (ticketId) => {
    socket.join(`ticket_${ticketId}`);
    console.log(`User joined ticket room: ticket_${ticketId}`);
  });

  // User apne personal room mein join kare (notifications ke liye)
  socket.on("joinUser", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User joined personal room: user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

async function startServer() {
  try {
    await sequelize.sync({ force: false, alter: false });
    console.log("Database synced");

    await seedReferenceData();
    console.log("Reference data ensured");

    server.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  }
}

startServer();
