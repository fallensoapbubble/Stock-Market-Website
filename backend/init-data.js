const mongoose = require("mongoose");
const Stock = require("./models/Stock");

const sampleStocks = [
  { symbol: "INFY", name: "Infosys Limited", ltp: 1555.45, previousClose: 1580.00 },
  { symbol: "TCS", name: "Tata Consultancy Services", ltp: 3194.8, previousClose: 3202.00 },
  { symbol: "ITC", name: "ITC Limited", ltp: 262.25, previousClose: 263.30 },
  { symbol: "RELIANCE", name: "Reliance Industries", ltp: 2112.4, previousClose: 2082.15 },
  { symbol: "HDFCBANK", name: "HDFC Bank Limited", ltp: 1522.35, previousClose: 1520.75 },
  { symbol: "WIPRO", name: "Wipro Limited", ltp: 577.75, previousClose: 575.90 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Limited", ltp: 541.15, previousClose: 538.05 },
  { symbol: "SBIN", name: "State Bank of India", ltp: 430.2, previousClose: 431.67 },
  { symbol: "ONGC", name: "Oil & Natural Gas Corporation", ltp: 116.8, previousClose: 116.90 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Limited", ltp: 2417.4, previousClose: 2412.35 }
];

async function initializeData() {
  try {
    await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/trading_platform");
    console.log("Connected to MongoDB");

    for (const stockData of sampleStocks) {
      const existingStock = await Stock.findOne({ symbol: stockData.symbol });
      if (!existingStock) {
        const change = stockData.ltp - stockData.previousClose;
        const changePercent = ((change / stockData.previousClose) * 100);
        
        const stock = new Stock({
          ...stockData,
          change,
          changePercent,
          open: stockData.previousClose + (Math.random() - 0.5) * 10,
          high: stockData.ltp + Math.random() * 20,
          low: stockData.ltp - Math.random() * 15,
          volume: Math.floor(Math.random() * 1000000) + 100000,
          ohlc: {
            open: stockData.previousClose + (Math.random() - 0.5) * 10,
            high: stockData.ltp + Math.random() * 20,
            low: stockData.ltp - Math.random() * 15,
            close: stockData.ltp
          }
        });
        
        await stock.save();
        console.log(`✅ Created stock: ${stockData.symbol}`);
      } else {
        console.log(`📊 Stock already exists: ${stockData.symbol}`);
      }
    }

    console.log("✅ Data initialization completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing data:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeData();
}

module.exports = initializeData;