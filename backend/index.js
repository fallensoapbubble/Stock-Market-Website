require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

// Import routes
const authRoutes = require("./routes/auth");
const marketRoutes = require("./routes/market");
const orderRoutes = require("./routes/orders");
const portfolioRoutes = require("./routes/portfolio");
const userRoutes = require("./routes/user");

// Import services
const MarketDataService = require("./services/MarketDataService");
const OrderService = require("./services/OrderService");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/trading_platform")
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Initialize services
const marketDataService = new MarketDataService(io);
const orderService = new OrderService(io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Subscribe to market data
  socket.on("subscribe_market", (symbols) => {
    marketDataService.subscribe(socket, symbols);
  });

  // Unsubscribe from market data
  socket.on("unsubscribe_market", (symbols) => {
    marketDataService.unsubscribe(socket, symbols);
  });

  // Handle order placement
  socket.on("place_order", async (orderData) => {
    try {
      const result = await orderService.placeOrder(orderData);
      socket.emit("order_response", result);
    } catch (error) {
      socket.emit("order_error", { error: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`👤 User disconnected: ${socket.id}`);
    marketDataService.unsubscribeAll(socket);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Trading Platform Backend running on http://localhost:${PORT}`);
  
  // Start market data simulation
  await marketDataService.startSimulation();
});

module.exports = { app, io };


