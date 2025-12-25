const express = require("express");
const Holding = require("../models/Holding");
const Position = require("../models/Position");
const Stock = require("../models/Stock");
const router = express.Router();

// Demo user ID for testing without auth
const DEMO_USER_ID = "demo_user_123";

// Get holdings
router.get("/holdings", async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: DEMO_USER_ID }).populate('stockId');
    
    // Calculate current values
    const enrichedHoldings = await Promise.all(
      holdings.map(async (holding) => {
        const stock = await Stock.findById(holding.stockId);
        const currentValue = holding.quantity * stock.ltp;
        const investedValue = holding.quantity * holding.avgPrice;
        const pnl = currentValue - investedValue;
        const pnlPercent = ((pnl / investedValue) * 100).toFixed(2);
        
        return {
          ...holding.toObject(),
          stock,
          currentValue,
          investedValue,
          pnl,
          pnlPercent,
          dayChange: stock.changePercent
        };
      })
    );
    
    res.json(enrichedHoldings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get positions
router.get("/positions", async (req, res) => {
  try {
    const positions = await Position.find({ userId: DEMO_USER_ID }).populate('stockId');
    
    // Calculate current values
    const enrichedPositions = await Promise.all(
      positions.map(async (position) => {
        const stock = await Stock.findById(position.stockId);
        const currentValue = position.quantity * stock.ltp;
        const investedValue = position.quantity * position.avgPrice;
        const pnl = currentValue - investedValue;
        const pnlPercent = ((pnl / investedValue) * 100).toFixed(2);
        
        return {
          ...position.toObject(),
          stock,
          currentValue,
          investedValue,
          pnl,
          pnlPercent,
          dayChange: stock.changePercent
        };
      })
    );
    
    res.json(enrichedPositions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get portfolio summary
router.get("/summary", async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: DEMO_USER_ID }).populate('stockId');
    const positions = await Position.find({ userId: DEMO_USER_ID }).populate('stockId');
    
    let totalInvested = 0;
    let totalCurrent = 0;
    let dayPnl = 0;
    
    // Calculate holdings summary
    for (const holding of holdings) {
      const stock = await Stock.findById(holding.stockId);
      const invested = holding.quantity * holding.avgPrice;
      const current = holding.quantity * stock.ltp;
      
      totalInvested += invested;
      totalCurrent += current;
      dayPnl += holding.quantity * stock.change;
    }
    
    // Calculate positions summary
    for (const position of positions) {
      const stock = await Stock.findById(position.stockId);
      const invested = position.quantity * position.avgPrice;
      const current = position.quantity * stock.ltp;
      
      totalInvested += invested;
      totalCurrent += current;
      dayPnl += position.quantity * stock.change;
    }
    
    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(2) : 0;
    
    res.json({
      totalInvested,
      totalCurrent,
      totalPnl,
      totalPnlPercent,
      dayPnl,
      dayPnlPercent: totalInvested > 0 ? ((dayPnl / totalInvested) * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;