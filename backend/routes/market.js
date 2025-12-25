const express = require("express");
const Stock = require("../models/Stock");
const MarketData = require("../models/MarketData");
const router = express.Router();

// Get all stocks in watchlist
router.get("/watchlist", async (req, res) => {
  try {
    const stocks = await Stock.find({ isActive: true });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search stocks
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const stocks = await Stock.find({
      $or: [
        { symbol: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ],
      isActive: true
    }).limit(10);
    
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stock details with market depth
router.get("/stock/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await Stock.findOne({ symbol });
    
    if (!stock) {
      return res.status(404).json({ error: "Stock not found" });
    }

    // Get latest market data
    const marketData = await MarketData.findOne({ symbol }).sort({ timestamp: -1 });
    
    // Generate mock market depth data
    const marketDepth = generateMarketDepth(stock.ltp);
    
    res.json({
      ...stock.toObject(),
      marketData,
      marketDepth
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add stock to watchlist
router.post("/watchlist/add", async (req, res) => {
  try {
    const { symbol, exchange = "NSE" } = req.body;
    
    let stock = await Stock.findOne({ symbol, exchange });
    
    if (!stock) {
      // Create new stock entry
      stock = new Stock({
        symbol,
        exchange,
        name: symbol + " Ltd", // In real app, fetch from external API
        ltp: Math.random() * 1000 + 100, // Mock price
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000),
        isActive: true
      });
      
      await stock.save();
    }
    
    res.json({ message: "Stock added to watchlist", stock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove stock from watchlist
router.delete("/watchlist/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    await Stock.findOneAndUpdate({ symbol }, { isActive: false });
    res.json({ message: "Stock removed from watchlist" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate mock market depth
function generateMarketDepth(ltp) {
  const bids = [];
  const offers = [];
  
  // Generate 5 bid levels
  for (let i = 0; i < 5; i++) {
    bids.push({
      price: (ltp - (i + 1) * 0.25).toFixed(2),
      quantity: Math.floor(Math.random() * 1000) + 100,
      orders: Math.floor(Math.random() * 10) + 1
    });
  }
  
  // Generate 5 offer levels
  for (let i = 0; i < 5; i++) {
    offers.push({
      price: (ltp + (i + 1) * 0.25).toFixed(2),
      quantity: Math.floor(Math.random() * 1000) + 100,
      orders: Math.floor(Math.random() * 10) + 1
    });
  }
  
  return { bids, offers };
}

module.exports = router;