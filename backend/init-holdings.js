const mongoose = require("mongoose");
const Stock = require("./models/Stock");
const Holding = require("./models/Holding");

// Demo user ID (same as used in routes)
const DEMO_USER_ID = "demo_user_123";

const sampleHoldings = [
  { symbol: "RELIANCE", quantity: 50, avgPrice: 2000 },
  { symbol: "TCS", quantity: 25, avgPrice: 3100 },
  { symbol: "INFY", quantity: 30, avgPrice: 1500 },
  { symbol: "HDFCBANK", quantity: 40, avgPrice: 1450 },
  { symbol: "ITC", quantity: 100, avgPrice: 250 }
];

async function initializeHoldings() {
  try {
    await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/trading_platform");
    console.log("Connected to MongoDB");

    // Clear existing holdings for demo user
    await Holding.deleteMany({ userId: DEMO_USER_ID });
    console.log("🗑️ Cleared existing holdings");

    for (const holdingData of sampleHoldings) {
      // Find the stock
      const stock = await Stock.findOne({ symbol: holdingData.symbol });
      if (!stock) {
        console.log(`❌ Stock not found: ${holdingData.symbol}`);
        continue;
      }

      // Create holding
      const holding = new Holding({
        userId: DEMO_USER_ID,
        stockId: stock._id,
        symbol: holdingData.symbol,
        quantity: holdingData.quantity,
        avgPrice: holdingData.avgPrice,
        totalInvested: holdingData.quantity * holdingData.avgPrice,
        exchange: "NSE"
      });

      await holding.save();
      console.log(`✅ Created holding: ${holdingData.symbol} - ${holdingData.quantity} shares @ ₹${holdingData.avgPrice}`);
    }

    console.log("✅ Holdings initialization completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing holdings:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeHoldings();
}

module.exports = initializeHoldings;